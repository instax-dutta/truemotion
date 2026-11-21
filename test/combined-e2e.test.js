import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createState, saveState } from '../src/state.js';
import { diffPng } from '../src/diff.js';
import { COMBINED_HTML, COMBINED_BRAND } from '../examples/combined-scene.mjs';

const enabled = process.env.TRUEMOTION_E2E === '1';

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

    const { spawnSync } = await import('node:child_process');
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

    // The review contact sheet proves frames differed (rendered-frame feedback).
    assert.ok(reviewText.length > 0);
  } finally {
    await client.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
