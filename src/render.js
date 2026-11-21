import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { launchBrowser } from './browser.js';
import { createEncoder, buildFinalizeArgs } from './encode.js';
import {
  checkpointDirFor, manifestPath, segmentPath, emptyManifest, readManifest,
  writeManifest, clearCheckpoint, completedIndices, planSegments,
  manifestCompatible, writeConcatList, sceneDigest
} from './segments.js';
import { injectSceneHtml } from './inject.js';
import { dimensions } from './state.js';
import { diffPng, percent } from './diff.js';
import { PATH_ID_SOURCE } from './pathid.js';

const STATIC_RATIO = 0.005;
const DEAD_RATIO = 0.003;
const CUT_WARN = 0.06;
const CUT_REJECT = 0.18;

export function selectFrames(scenes, fps, startSec = 0, endSec = Infinity) {
  const selected = [];
  let offset = 0;
  for (const [sceneIndex, scene] of scenes.entries()) {
    const count = Math.max(1, Math.ceil(scene.durationSec * fps));
    for (let i = 0; i < count; i += 1) {
      const globalTime = offset + i / fps;
      if (globalTime >= startSec && globalTime < endSec) {
        selected.push({ sceneIndex, index: i, time: i / fps });
      }
    }
    offset += scene.durationSec;
  }
  return selected;
}

export function chunkTimes(count, concurrency) {
  const groups = Array.from({ length: concurrency }, () => []);
  for (let i = 0; i < count; i += 1) {
    groups[Math.min(concurrency - 1, Math.floor((i * concurrency) / count))].push(i);
  }
  return groups;
}

async function openScene(html, { aspect = '16:9', resolution = '1080p', assetsDir, brand, components, chrome } = {}, existingBrowser) {
  // Keep the CSS composition at source size so fixed-pixel layouts do not
  // reflow; scale only the raster via deviceScaleFactor.
  const [width, height] = dimensions(aspect, '1080p');
  const [outputWidth] = dimensions(aspect, resolution);
  const injected = injectSceneHtml(html, { width, height, assetsDir, brand, components });
  const browser = existingBrowser ?? await launchBrowser(chrome);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: outputWidth / width });
  const requests = new Set();
  const errors = [];
  page.on('request', (req) => {
    if (/^https?:/.test(req.url())) requests.add(req.url());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.setContent(injected, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  const ready = await page.evaluate(() => typeof window.__SCENE_TIMELINE__?.seek === 'function');
  if (!ready) {
    await browser.close();
    throw new Error('Scene did not expose a seekable window.__SCENE_TIMELINE__');
  }
  return { browser, page, width, height, requests, errors };
}

async function seek(page, time, duration) {
  await page.evaluate(({ t, d }) => {
    const tl = window.__SCENE_TIMELINE__;
    tl.pause();
    // seek(t, false) fires onUpdate callbacks so proxy-driven counters stay
    // correct on a cold seek; the typing runtime also exposes an explicit
    // flush registry for renderers that suppress events.
    tl.seek(Math.max(0, Number.isFinite(d) ? Math.min(t, d) : t), false);
    if (window.OMTyping && typeof window.OMTyping._flush === 'function') window.OMTyping._flush();
  }, { t: time, d: Number(duration) });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function capture(page) {
  const png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
  return png.toString('base64');
}

async function layoutIssues(page, width, height) {
  return page.evaluate(({ width, height }) => {
    const issues = [];
    const seen = new Set();
    const frame = document.querySelector('.frame');
    if (!frame) return issues;
    const fr = frame.getBoundingClientRect();
    for (const el of frame.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      const label = el.dataset.omId ?? '';
      const ownText = el.children.length === 0 ? el.textContent.trim() : '';
      if (!label && !ownText) continue;
      if (r.width < 1 || r.height < 1) continue;
      if (r.left < fr.left - 4 || r.top < fr.top - 4 || r.right > fr.right + 4 || r.bottom > fr.bottom + 4) {
        const key = `clip:${el.tagName}:${label}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push(`clipped: ${label || el.tagName.toLowerCase()} extends outside .frame`);
        }
      }
      if (ownText) {
        const size = parseFloat(cs.fontSize);
        if (size < 18) {
          const key = `small:${size}`;
          if (!seen.has(key)) {
            seen.add(key);
            issues.push(`text under 18px: ${size}px "${ownText.slice(0, 24)}"`);
          }
        }
      }
    }
    return issues.slice(0, 6);
  }, { width, height });
}

async function probeScene(html, { aspect = '16:9', resolution = '1080p', timesSec = [], assetsDir, brand, components, chrome, actorTimeSec } = {}) {
  const ctx = await openScene(html, { aspect, resolution, assetsDir, brand, components, chrome });
  try {
    const info = await ctx.page.evaluate(() => ({
      duration: window.__SCENE_DURATION__,
      timelineDuration: window.__SCENE_TIMELINE__.duration()
    }));
    const frames = [];
    const issues = new Set();
    for (const time of timesSec) {
      await seek(ctx.page, time, info.duration);
      frames.push({ timeSec: time, base64Png: await capture(ctx.page) });
      for (const issue of await layoutIssues(ctx.page, ctx.width, ctx.height)) issues.add(issue);
    }
    let actors = null;
    if (actorTimeSec !== undefined) {
      await seek(ctx.page, actorTimeSec, info.duration);
      await ctx.page.addScriptTag({ content: PATH_ID_SOURCE });
      actors = await ctx.page.evaluate(() => {
        const describe = (el, labelled) => {
          const r = el.getBoundingClientRect();
          const get = (name) => {
            const value = window.gsap?.getProperty(el, name);
            return typeof value === 'number' ? Number(value.toFixed(2)) : value;
          };
          const cs = getComputedStyle(el);
          return {
            id: labelled ? el.getAttribute('data-om-id') : window.omPathId(el),
            pathId: window.omPathId(el),
            labelled,
            x: get('x'), y: get('y'), scale: get('scale'),
            rotation: get('rotation'), opacity: get('opacity'),
            rect: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) },
            visible: cs.opacity !== '0' && cs.visibility !== 'hidden'
          };
        };
        const labelled = [...document.querySelectorAll('[data-om-id]')].map((el) => describe(el, true));
        const known = new Set(labelled.map((actor) => actor.pathId));
        const textLeaves = [...document.querySelectorAll('.frame *')].filter((el) =>
          el.children.length === 0 && el.textContent.trim() && !el.hasAttribute('data-om-id')
        );
        const pathActors = textLeaves.map((el) => describe(el, false))
          .filter((actor) => !known.has(actor.pathId))
          .slice(0, 40);
        return [...labelled, ...pathActors];
      });
    }
    return {
      frames,
      actors,
      info: {
        ...info,
        timelineCount: (String(html).match(/gsap\.timeline\s*\(/g) || []).length,
        requests: [...ctx.requests],
        errors: [...ctx.errors],
        layout: [...issues]
      }
    };
  } finally {
    await ctx.browser.close();
  }
}

export async function renderFrames(html, { aspect = '16:9', resolution = '1080p', timesSec = [], assetsDir, brand, components, chrome } = {}) {
  const result = await probeScene(html, { aspect, resolution, timesSec, assetsDir, brand, components, chrome });
  return result.frames;
}

async function renderFramesParallel(browser, html, { aspect, resolution, timesSec, assetsDir, brand, components, concurrency, batchSize = timesSec.length, onBatch }) {
  const count = Math.min(Math.max(1, concurrency), Math.max(1, timesSec.length));
  // Pages live for the whole scene, not one batch: page setup dominates the
  // cost of short scenes, while batching still bounds in-memory frame buffers.
  const pages = await Promise.all(
    Array.from({ length: count }, () => openScene(html, { aspect, resolution, assetsDir, brand, components }, browser))
  );
  try {
    const duration = await pages[0].page.evaluate(() => window.__SCENE_DURATION__);
    const size = Math.max(1, Math.floor(batchSize));
    let renderedCount = 0;
    for (let start = 0; start < timesSec.length; start += size) {
      const batchTimes = timesSec.slice(start, start + size);
      const results = new Array(batchTimes.length);
      await Promise.all(pages.map(async (ctx, worker) => {
        for (let i = worker; i < batchTimes.length; i += count) {
          await seek(ctx.page, batchTimes[i], duration);
          results[i] = await capture(ctx.page);
        }
      }));
      if (onBatch) await onBatch(results);
      renderedCount += results.length;
    }
    return renderedCount;
  } finally {
    await Promise.all(pages.map((ctx) => ctx.page.close()));
  }
}

export async function sceneNotes(scene, state, { assetsDir, chrome } = {}) {
  const duration = scene.durationSec;
  const times = [duration * 0.1, duration * 0.5, duration * 0.9];
  try {
    const probe = await probeScene(scene.html, { aspect: state.aspect, resolution: state.resolution, timesSec: times, assetsDir, brand: state.brand, components: state.components, chrome });
    const notes = [];
    const [a, b, c] = probe.frames;
    if (a && b && c) {
      const build = diffPng(a.base64Png, b.base64Png).changedRatio;
      const resolve = diffPng(b.base64Png, c.base64Png).changedRatio;
      if (build < STATIC_RATIO && resolve < STATIC_RATIO) {
        notes.push(`STATIC SLIDE: the sampled frames differ by ${percent(build)} and ${percent(resolve)}. Almost nothing moves; rebuild the choreography.`);
      } else if (resolve < DEAD_RATIO) {
        notes.push(`DEAD HOLD: the final 40% changes only ${percent(resolve)} of pixels. Unless deliberate, add progression through the resolve.`);
      } else {
        notes.push(`MOTION: ${percent(build)} of pixels change during the build, ${percent(resolve)} during the resolve.`);
      }
    }
    const info = probe.info;
    if (Number(info.duration) !== Number(duration)) {
      notes.push(`DURATION MISMATCH: window.__SCENE_DURATION__ is ${info.duration}s but the scene is ${duration}s. The export may hold or cut early.`);
    }
    if (info.timelineCount > 1) {
      notes.push(`MULTIPLE TIMELINES: ${info.timelineCount} gsap.timeline() calls found. All motion must live on the single exposed timeline.`);
    }
    if (info.requests.length) notes.push(`EXTERNAL REQUESTS: ${info.requests.slice(0, 3).join(', ')}. Scenes must be self-contained.`);
    if (info.errors.length) notes.push(`SCRIPT ERRORS: ${info.errors.slice(0, 2).join(' | ')}`);
    for (const issue of info.layout) notes.push(issue.toUpperCase().slice(0, 1) + issue.slice(1));
    return {
      notes,
      blocks: [
        { type: 'text', text: `RENDERED FRAMES at ${times.map((t) => `${t.toFixed(1)}s`).join(', ')}. Verify the requested change landed and nothing regressed. ${notes.join(' ')}` },
        ...probe.frames.map((f) => ({ type: 'image', data: f.base64Png, mimeType: 'image/png' }))
      ]
    };
  } catch (error) {
    return { notes: [`Preview unavailable: ${error.message}`], blocks: [{ type: 'text', text: `Preview unavailable: ${error.message}` }] };
  }
}

export async function reviewFrames(scene, state, opts = {}) {
  return (await sceneNotes(scene, state, opts)).blocks;
}

export async function actorExitStates(scene, state, { assetsDir, chrome } = {}) {
  const probe = await probeScene(scene.html, {
    aspect: state.aspect,
    resolution: state.resolution,
    chrome,
    timesSec: [],
    assetsDir,
    brand: state.brand,
    components: state.components,
    actorTimeSec: scene.durationSec
  });
  return probe.actors ?? [];
}

export async function matchedCut(previous, candidate, state, { assetsDir, chrome } = {}) {
  try {
    const [prev, next] = await Promise.all([
      probeScene(previous.html, { aspect: state.aspect, resolution: state.resolution, timesSec: [previous.durationSec], assetsDir, brand: state.brand, components: state.components, chrome }),
      probeScene(candidate.html, { aspect: state.aspect, resolution: state.resolution, timesSec: [0], assetsDir, brand: state.brand, components: state.components, chrome })
    ]);
    const diff = diffPng(prev.frames[0].base64Png, next.frames[0].base64Png);
    return {
      verdict: diff.changedRatio > CUT_REJECT ? 'fail' : diff.changedRatio > CUT_WARN ? 'warn' : 'ok',
      changedRatio: diff.changedRatio,
      prevFrame: prev.frames[0].base64Png,
      nextFrame: next.frames[0].base64Png
    };
  } catch {
    return { verdict: 'ok', changedRatio: 0 };
  }
}

async function renderSegment(browser, segment, chosen, state, options) {
  const {
    aspect, resolution, assetsDir, audio, crf, concurrency,
    batchSize, checkpointDir, chrome
  } = options;
  const frames = chosen.slice(segment.start, segment.start + segment.count);
  const encoder = createEncoder({
    fps: options.fps, crf, outPath: segmentPath(checkpointDir, segment.index)
  });
  let written = 0;
  try {
    const byScene = new Map();
    for (const frame of frames) {
      if (!byScene.has(frame.sceneIndex)) byScene.set(frame.sceneIndex, []);
      byScene.get(frame.sceneIndex).push(frame);
    }
    for (const [sceneIndex, sceneFrames] of [...byScene.entries()].sort((a, b) => a[0] - b[0])) {
      const scene = state.scenes[sceneIndex];
      await renderFramesParallel(browser, scene.html, {
        aspect, resolution, timesSec: sceneFrames.map((f) => f.time), assetsDir,
        brand: state.brand, components: state.components,
        concurrency: Math.min(concurrency, sceneFrames.length), batchSize,
        onBatch: async (rendered) => {
          for (const frame of rendered) {
            await encoder.write(Buffer.from(frame, 'base64'));
            written += 1;
          }
        }
      });
    }
    await encoder.finish();
    return written;
  } catch (error) {
    await encoder.finish().catch(() => {});
    throw error;
  }
}

function finalizeSegments(manifest, checkpointDir, outPath, audio) {
  const list = writeConcatList(checkpointDir, manifest.segments);
  const result = spawnSync('ffmpeg', buildFinalizeArgs({
    listFile: list, audio, outPath, totalSeconds: manifest.totalFrames / manifest.fps
  }), { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`ffmpeg finalize failed: ${(result.stderr || '').slice(-1000)}`);
}

export async function renderVideo(state, outPath, {
  fps = 30, resolution, assetsDir, audio, chrome, concurrency = 2,
  startSec = 0, endSec = Infinity, crf = 18, batchSize = 30,
  segmentSize = 0, resume = false, checkpointDir: checkpointOverride,
  maxSegments = Infinity, keepCheckpoints = false
} = {}) {
  const outputResolution = resolution || state.resolution || '1080p';
  const size = Math.max(1, Math.floor(batchSize));
  const chosen = selectFrames(state.scenes, fps, startSec, endSec);
  if (!chosen.length) throw new Error('No frames in the requested range.');

  const segmentFrames = Math.max(size, Math.floor(segmentSize || batchSize * 4));
  const checkpointDir = checkpointDirFor(outPath, checkpointOverride);
  const meta = {
    fps, resolution: outputResolution,
    totalFrames: chosen.length, segmentSize: segmentFrames,
    audio: audio || null, digest: sceneDigest(state, assetsDir)
  };

  let manifest = resume ? readManifest(checkpointDir) : null;
  if (resume && manifest && !manifestCompatible(manifest, meta)) {
    const mismatch = manifest.digest && meta.digest && manifest.digest !== meta.digest
      ? 'the state file changed since checkpointing'
      : 'render settings changed since checkpointing';
    throw new Error(`Cannot resume: ${mismatch}. Use a fresh render without --resume.`);
  }
  if (manifest && !manifestCompatible(manifest, meta)) manifest = null;
  if (!manifest) {
    clearCheckpoint(checkpointDir);
    manifest = emptyManifest(meta);
    writeManifest(checkpointDir, manifest);
  }

  const segments = planSegments(chosen.length, segmentFrames);
  const done = completedIndices(manifest, checkpointDir);
  const pending = segments.filter((segment) => !done.has(segment.index));
  const budget = Number.isFinite(maxSegments) ? pending.slice(0, Math.max(0, maxSegments)) : pending;

  const browser = budget.length ? await launchBrowser(chrome) : null;
  try {
    for (const segment of budget) {
      const framesRendered = await renderSegment(browser, segment, chosen, state, {
        aspect: state.aspect, resolution: outputResolution, assetsDir, audio, crf,
        concurrency, batchSize: size, checkpointDir, fps, chrome
      });
      if (framesRendered !== segment.count) {
        throw new Error(`Segment ${segment.index} produced ${framesRendered} frames, expected ${segment.count}`);
      }
      manifest.segments.push({
        index: segment.index, start: segment.start, count: segment.count,
        bytes: fs.statSync(segmentPath(checkpointDir, segment.index)).size
      });
      manifest.segments.sort((a, b) => a.index - b.index);
      writeManifest(checkpointDir, manifest);
    }
  } finally {
    if (browser) await browser.close();
  }

  const remaining = segments.filter((segment) => !completedIndices(manifest, checkpointDir).has(segment.index));
  if (remaining.length) {
    return {
      frames: manifest.segments.reduce((sum, s) => sum + s.count, 0),
      output: null,
      partial: true,
      segmentsRendered: budget.length,
      segmentsRemaining: remaining.length,
      checkpointDir
    };
  }

  finalizeSegments(manifest, checkpointDir, outPath, audio);
  manifest.finalized = true;
  writeManifest(checkpointDir, manifest);
  if (!keepCheckpoints) clearCheckpoint(checkpointDir);
  return {
    frames: manifest.totalFrames,
    output: outPath,
    partial: false,
    segmentsRendered: budget.length,
    resumed: done.size > 0,
    checkpointDir
  };
}

export { matchedCut as checkMatchedCut };
