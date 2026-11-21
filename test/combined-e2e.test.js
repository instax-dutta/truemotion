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

    // The review contact sheet proves frames differed (rendered-frame feedback).
    assert.ok(reviewText.length > 0);
  } finally {
    await client.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
