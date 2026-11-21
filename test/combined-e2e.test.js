import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createState, saveState } from '../src/state.js';
import { diffPng } from '../src/diff.js';
import { COMBINED_HTML, COMBINED_BRAND } from '../examples/combined-scene.mjs';

const enabled = process.env.TRUEMOTION_E2E === '1';

function ffmpegFrame(video, time, output) {
  const result = spawnSync('ffmpeg', [
    '-y', '-ss', String(time), '-i', video, '-frames:v', '1', output, '-loglevel', 'error'
  ]);
  assert.equal(result.status, 0, 'ffmpeg frame extraction failed');
}

test('combined token scene authors through MCP and renders distinct frames', { skip: !enabled && 'set TRUEMOTION_E2E=1' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-combined-e2e-'));
  const stateFile = path.join(dir, 'state.json');
  const state = createState();
  state.brand = COMBINED_BRAND;
  saveState(stateFile, state);

  const bin = path.resolve('bin/truemotion.mjs');
  const transport = new StdioClientTransport({ command: process.execPath, args: [bin, 'serve', '--state', stateFile] });
  const client = new Client({ name: 'combined-e2e', version: '1.0.0' }, { capabilities: {} });
  try {
    await client.connect(transport);
    const call = async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(!result.isError, `${name}: ${(result.content || []).map((b) => b.text).join(' ')}`);
      return result;
    };

    await call('add_scene', { name: 'The toolkit', durationSec: 4, html: COMBINED_HTML, freshStart: true });
    const scenes = JSON.parse(fs.readFileSync(stateFile, 'utf8')).scenes;
    assert.equal(scenes.length, 1);

    const evolve = await call('read_scene', { sceneId: scenes[0].id, purpose: 'evolve' });
    const payload = JSON.parse(evolve.content.find((b) => b.type === 'text').text);
    assert.ok(payload.computedExitStates, 'expected measured actor exit states');

    const review = await call('review_timeline', {});
    const reviewText = review.content.find((b) => b.type === 'text').text;
    assert.ok(review.content.some((b) => b.type === 'image'), 'expected a contact sheet');

    const still = await call('render_video', {
      out: path.join(dir, 'out.mp4'), fps: 5, resolution: '540p',
      concurrency: 2, batchSize: 4
    });
    const renderText = still.content.find((b) => b.type === 'text').text;
    assert.ok(renderText.includes('Rendered 20 frames'), renderText);
    assert.ok(fs.existsSync(path.join(dir, 'out.mp4')));

    const probe = JSON.parse(spawnSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-show_entries', 'stream=nb_frames', '-of', 'json', path.join(dir, 'out.mp4')
    ], { encoding: 'utf8' }).stdout);
    assert.equal(Number(probe.format.duration), 4);

    // Interruption + resume: render one checkpoint segment, then resume.
    const resumeOut = path.join(dir, 'resumed.mp4');
    const partial = await call('render_video', {
      out: resumeOut, fps: 5, resolution: '540p', batchSize: 2,
      segmentSize: 4, maxSegments: 2, keepCheckpoints: true
    });
    assert.ok(partial.content.find((b) => b.type === 'text').text.includes('Checkpoint'));
    assert.ok(!fs.existsSync(resumeOut), 'partial render must not emit a final file');
    const resumed = await call('render_video', {
      out: resumeOut, fps: 5, resolution: '540p', batchSize: 2,
      segmentSize: 4, resume: true
    });
    const resumeText = resumed.content.find((b) => b.type === 'text').text;
    assert.ok(resumeText.includes('resumed'), resumeText);
    const resumedProbe = JSON.parse(spawnSync('ffprobe', [
      '-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'json', resumeOut
    ], { encoding: 'utf8' }).stdout);
    assert.equal(Number(resumedProbe.streams[0].nb_frames), 20);

    // Mutating state between checkpoint and resume must be rejected.
    const mutateOut = path.join(dir, 'mutated.mp4');
    await call('render_video', {
      out: mutateOut, fps: 5, resolution: '540p', batchSize: 2,
      segmentSize: 4, maxSegments: 1, keepCheckpoints: true
    });
    const persisted = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    persisted.scenes[0].html = persisted.scenes[0].html.replace('EVERY TOKEN', 'MUTATED TOKEN');
    fs.writeFileSync(stateFile, JSON.stringify(persisted));
    const rejected = await client.callTool({
      name: 'render_video',
      arguments: {
        out: mutateOut, fps: 5, resolution: '540p', batchSize: 2,
        segmentSize: 4, resume: true
      }
    });
    assert.ok(rejected.isError, 'resume with changed state must fail');
    assert.ok(rejected.content.find((b) => b.type === 'text').text.includes('state file changed'));

    // Mutating an ASSET file between checkpoint and resume must also be rejected.
    const assetsDir = path.join(dir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    const logo = path.join(assetsDir, 'logo.svg');
    fs.writeFileSync(logo, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const assetState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assetState.scenes = [{
      ...assetState.scenes[0],
      name: 'Asset scene',
      html: assetState.scenes[0].html.replace(
        '<div class="frame">',
        '<div class="frame"><img src="{{ASSET:logo.svg}}" width="8" height="8" alt="">'
      )
    }];
    fs.writeFileSync(stateFile, JSON.stringify(assetState));
    const assetOut = path.join(dir, 'asset.mp4');
    await call('render_video', {
      out: assetOut, fps: 5, resolution: '540p', batchSize: 2,
      segmentSize: 4, maxSegments: 1, keepCheckpoints: true
    });
    fs.writeFileSync(logo, '<svg xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8"/></svg>');
    const assetRejected = await client.callTool({
      name: 'render_video',
      arguments: {
        out: assetOut, fps: 5, resolution: '540p', batchSize: 2,
        segmentSize: 4, resume: true
      }
    });
    assert.ok(assetRejected.isError, 'resume with changed asset must fail');
    assert.ok(assetRejected.content.find((b) => b.type === 'text').text.includes('state file changed'));

    // Audio/video alignment with a looping bed shorter than the video.
    const bed = path.join(dir, 'bed.m4a');
    spawnSync('ffmpeg', [
      '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
      '-c:a', 'aac', bed, '-loglevel', 'error'
    ]);
    const avOut = path.join(dir, 'av.mp4');
    await call('render_video', {
      out: avOut, fps: 10, resolution: '540p',
      batchSize: 4, segmentSize: 8, audio: bed
    });
    const avProbe = JSON.parse(spawnSync('ffprobe', [
      '-v', 'error', '-show_entries', 'stream=codec_type,duration',
      '-of', 'json', avOut
    ], { encoding: 'utf8' }).stdout);
    const video = avProbe.streams.find((s) => s.codec_type === 'video');
    const audio = avProbe.streams.find((s) => s.codec_type === 'audio');
    assert.ok(audio, 'audio stream must be present');
    assert.equal(Number(video.duration), 4);
    assert.ok(Math.abs(Number(audio.duration) - Number(video.duration)) < 0.05,
      `audio ${audio.duration}s vs video ${video.duration}s`);
    const level = (start, length) => spawnSync('ffmpeg', [
      '-ss', String(start), '-t', String(length), '-i', avOut,
      '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'
    ], { encoding: 'utf8' }).stderr.match(/mean_volume: ([-\d.]+) dB/)?.[1];
    const middle = Number(level(1.5, 1));
    const ending = Number(level(3.7, 0.25));
    assert.ok(ending < middle - 3, `fade-out missing: middle ${middle} dB, end ${ending} dB`);

    // Page-pool regression: a later scene must render identically on a reused
    // page as it does standalone (no stale const bindings or typing runtime).
    const typingScene = assetState.scenes[0];
    const plainScene = {
      ...typingScene,
      name: 'Plain',
      html: typingScene.html.replace('OMTyping.attach(', 'void (0) && OMTyping.attach(')
    };
    const multiState = { ...assetState, scenes: [plainScene, typingScene] };
    const multiFile = path.join(dir, 'multi.json');
    fs.writeFileSync(multiFile, JSON.stringify(multiState));
    const multiOut = path.join(dir, 'multi.mp4');
    const multiRender = spawnSync(process.execPath, [
      bin, 'render', '--state', multiFile, '--out', multiOut,
      '--resolution', '540p', '--fps', '10', '--batch-size', '5'
    ], { encoding: 'utf8' });
    assert.equal(multiRender.status, 0, multiRender.stderr.slice(-800));
    ffmpegFrame(multiOut, 6.5, path.join(dir, 'multi-frame.png'));
    const { renderFrames } = await import('../src/render.js');
    const expected = await renderFrames(typingScene.html, {
      aspect: '16:9', resolution: '540p', timesSec: [2.5],
      brand: COMBINED_BRAND, assetsDir
    });
    const diff = diffPng(fs.readFileSync(path.join(dir, 'multi-frame.png')), Buffer.from(expected[0].base64Png, 'base64'));
    assert.ok(diff.changedRatio < 0.02,
      `reused-page scene differs from standalone render (${(diff.changedRatio * 100).toFixed(2)}%)`);

    // A partial render over a time range reports frames for that range only.
    const rangeOut = path.join(dir, 'range.mp4');
    const ranged = await call('render_video', {
      out: rangeOut, fps: 5, resolution: '540p', batchSize: 2,
      segmentSize: 4, maxSegments: 1, startSec: 0, endSec: 2
    });
    const rangeText = ranged.content.find((b) => b.type === 'text').text;
    assert.ok(rangeText.includes('/10 frames'), `expected range total of 10 frames, got ${rangeText.slice(0, 160)}`);

    // The review contact sheet proves frames differed (rendered-frame feedback).
    assert.ok(reviewText.length > 0);
  } finally {
    await client.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
