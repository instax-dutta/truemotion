import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createState, saveState } from '../src/state.js';

const enabled = process.env.TRUEMOTION_CONCURRENT === '1';

const html = '<!doctype html><html><head><style>.frame{width:10px;height:10px}</style></head><body><div class="frame"><h1>Hi</h1></div><script>window.__SCENE_TIMELINE__={seek(){}};window.__SCENE_DURATION__=1;</script></body></html>';

async function openClients(stateFile, count) {
  const bin = path.resolve('bin/truemotion.mjs');
  return Promise.all(Array.from({ length: count }, async (_, index) => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [bin, 'serve', '--state', stateFile, '--no-preview']
    });
    const client = new Client({ name: `concurrent-${index}`, version: '1.0.0' }, { capabilities: {} });
    await client.connect(transport);
    return { client, transport };
  }));
}

test('concurrent MCP writes leave no lost updates or stray temp files', {
  skip: !enabled && 'set TRUEMOTION_CONCURRENT=1'
}, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-concurrent-'));
  const stateFile = path.join(dir, 'state.json');
  saveState(stateFile, createState());
  const clients = await openClients(stateFile, 6);
  try {
    const results = await Promise.all(clients.map(({ client }, index) =>
      client.callTool({
        name: 'add_scene',
        arguments: { name: `Scene ${index}`, durationSec: 1, html, freshStart: true }
      })
    ));
    for (const result of results) {
      assert.ok(!result.isError, (result.content || []).map((block) => block.text).join(' '));
    }
    const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.equal(saved.scenes.length, 6, 'all six concurrent writes must persist');
    assert.equal(new Set(saved.scenes.map((scene) => scene.name)).size, 6);
    assert.deepEqual(fs.readdirSync(dir).filter((file) => file.endsWith('.tmp') || file.endsWith('.lock')), []);
  } finally {
    await Promise.all(clients.map(({ transport }) => transport.close()));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('concurrent patch calls on distinct scenes do not clobber each other', {
  skip: !enabled && 'set TRUEMOTION_CONCURRENT=1'
}, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-concurrent-patch-'));
  const stateFile = path.join(dir, 'state.json');
  const state = createState();
  for (let i = 0; i < 4; i += 1) {
    state.scenes.push({ id: `scene-${i}`, name: `S${i}`, durationSec: 1, html });
  }
  saveState(stateFile, state);
  const clients = await openClients(stateFile, 4);
  try {
    const results = await Promise.all(clients.map(({ client }, index) =>
      client.callTool({
        name: 'patch_scene',
        arguments: {
          id: `scene-${index}`,
          ops: [{ find: '<h1>Hi</h1>', replace: `<h1>Patched ${index}</h1>` }]
        }
      })
    ));
    for (const result of results) {
      assert.ok(!result.isError, (result.content || []).map((block) => block.text).join(' '));
    }
    const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.equal(saved.scenes.length, 4);
    for (let i = 0; i < 4; i += 1) {
      assert.ok(saved.scenes[i].html.includes(`<h1>Patched ${i}</h1>`), `scene ${i} patch lost`);
    }
    assert.deepEqual(fs.readdirSync(dir).filter((file) => file.endsWith('.tmp') || file.endsWith('.lock')), []);
  } finally {
    await Promise.all(clients.map(({ transport }) => transport.close()));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
