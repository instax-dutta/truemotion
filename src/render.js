import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { launchBrowser } from './browser.js';
import { injectSceneHtml } from './inject.js';
import { dimensions } from './state.js';
import { diffPng, percent } from './diff.js';

const STATIC_RATIO = 0.005;
const DEAD_RATIO = 0.003;
const CUT_WARN = 0.06;
const CUT_REJECT = 0.18;

export function chunkTimes(count, concurrency) {
  const groups = Array.from({ length: concurrency }, () => []);
  for (let i = 0; i < count; i += 1) {
    groups[Math.min(concurrency - 1, Math.floor((i * concurrency) / count))].push(i);
  }
  return groups;
}

async function openScene(html, { aspect = '16:9', resolution = '1080p', assetsDir, chrome } = {}, existingBrowser) {
  // Keep the CSS composition at source size so fixed-pixel layouts do not
  // reflow; scale only the raster via deviceScaleFactor.
  const [width, height] = dimensions(aspect, '1080p');
  const [outputWidth] = dimensions(aspect, resolution);
  const injected = injectSceneHtml(html, { width, height, assetsDir });
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
    // seek(t, false) fires onUpdate callbacks so proxy-driven counters and
    // typed text stay correct on a cold seek during export.
    tl.seek(Math.max(0, Number.isFinite(d) ? Math.min(t, d) : t), false);
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

async function probeScene(html, { aspect = '16:9', resolution = '1080p', timesSec = [], assetsDir, chrome, actorTimeSec } = {}) {
  const ctx = await openScene(html, { aspect, resolution, assetsDir, chrome });
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
      actors = await ctx.page.evaluate(() => [...document.querySelectorAll('[data-om-id]')].map((el) => {
        const r = el.getBoundingClientRect();
        const get = (name) => {
          const value = window.gsap?.getProperty(el, name);
          return typeof value === 'number' ? Number(value.toFixed(2)) : value;
        };
        const cs = getComputedStyle(el);
        return {
          id: el.getAttribute('data-om-id'),
          x: get('x'), y: get('y'), scale: get('scale'),
          rotation: get('rotation'), opacity: get('opacity'),
          rect: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) },
          visible: cs.opacity !== '0' && cs.visibility !== 'hidden'
        };
      }));
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

export async function renderFrames(html, { aspect = '16:9', resolution = '1080p', timesSec = [], assetsDir, chrome } = {}) {
  const result = await probeScene(html, { aspect, resolution, timesSec, assetsDir, chrome });
  return result.frames;
}

async function renderFramesParallel(browser, html, { aspect, resolution, timesSec, assetsDir, concurrency }) {
  const count = Math.min(Math.max(1, concurrency), Math.max(1, timesSec.length));
  const pages = await Promise.all(
    Array.from({ length: count }, () => openScene(html, { aspect, resolution, assetsDir }, browser))
  );
  try {
    const groups = chunkTimes(timesSec.length, count);
    const batches = await Promise.all(pages.map(async (ctx, worker) => {
      const duration = await ctx.page.evaluate(() => window.__SCENE_DURATION__);
      const rendered = [];
      for (const index of groups[worker]) {
        await seek(ctx.page, timesSec[index], duration);
        rendered.push({ index, base64Png: await capture(ctx.page) });
      }
      return rendered;
    }));
    return batches.flat().sort((a, b) => a.index - b.index).map((frame) => frame.base64Png);
  } finally {
    await Promise.all(pages.map((ctx) => ctx.page.close()));
  }
}

export async function sceneNotes(scene, state, { assetsDir, chrome } = {}) {
  const duration = scene.durationSec;
  const times = [duration * 0.1, duration * 0.5, duration * 0.9];
  try {
    const probe = await probeScene(scene.html, { aspect: state.aspect, resolution: state.resolution, timesSec: times, assetsDir, chrome });
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
    actorTimeSec: scene.durationSec
  });
  return probe.actors ?? [];
}

export async function matchedCut(previous, candidate, state, { assetsDir, chrome } = {}) {
  try {
    const [prev, next] = await Promise.all([
      probeScene(previous.html, { aspect: state.aspect, resolution: state.resolution, timesSec: [previous.durationSec], assetsDir, chrome }),
      probeScene(candidate.html, { aspect: state.aspect, resolution: state.resolution, timesSec: [0], assetsDir, chrome })
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

export async function renderVideo(state, outPath, { fps = 30, resolution, assetsDir, audio, chrome, concurrency = 2, crf = 18 } = {}) {
  const outputResolution = resolution || state.resolution || '1080p';
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'truemotion-'));
  const browser = await launchBrowser(chrome);
  let index = 0;
  try {
    for (const scene of state.scenes) {
      const count = Math.max(1, Math.ceil(scene.durationSec * fps));
      const times = Array.from({ length: count }, (_, i) => i / fps);
      const frames = await renderFramesParallel(browser, scene.html, {
        aspect: state.aspect, resolution: outputResolution, timesSec: times, assetsDir, concurrency
      });
      for (const frame of frames) {
        index += 1;
        fs.writeFileSync(path.join(temp, `frame-${String(index).padStart(6, '0')}.png`), Buffer.from(frame, 'base64'));
      }
    }
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    const args = ['-y', '-framerate', String(fps), '-i', path.join(temp, 'frame-%06d.png')];
    if (audio && fs.existsSync(audio)) {
      const total = state.scenes.reduce((sum, s) => sum + s.durationSec, 0);
      const fadeOut = Math.max(0, total - 0.6);
      args.push('-stream_loop', '-1', '-i', audio);
      args.push('-c:v', 'libx264', '-crf', String(crf), '-pix_fmt', 'yuv420p');
      args.push('-c:a', 'aac', '-af', `afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOut}:d=0.6`, '-shortest');
    } else {
      args.push('-c:v', 'libx264', '-crf', String(crf), '-pix_fmt', 'yuv420p');
    }
    args.push('-movflags', '+faststart', path.resolve(outPath));
    const result = spawnSync('ffmpeg', args, { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`ffmpeg failed: ${(result.stderr || '').slice(-1000)}`);
    return { frames: index, output: path.resolve(outPath) };
  } finally {
    await browser.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

export { matchedCut as checkMatchedCut };
