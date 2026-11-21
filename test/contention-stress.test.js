import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createState, saveState } from '../src/state.js';

const enabled = process.env.TRUEMOTION_CONTENTION === '1';
const CLIENTS = 20;
const ROUNDS = 3;
const html = '<!doctype html><html><head><style>.frame{width:10px;height:10px}</style></head><body><div class="frame"></div><script>window.__SCENE_TIMELINE__={seek(){}};window.__SCENE_DURATION__=1;</script></body></html>';

test('sustained contention: 20 writers x 3 rounds never lose or corrupt writes', {
  skip: !enabled && 'set TRUEMOTION_CONTENTION=1'
}, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-contention-'));
  const stateFile = path.join(dir, 'state.json');
  saveState(stateFile, createState());
  const bin = path.resolve('bin/truemotion.mjs');

  const clients = await Promise.all(Array.from({ length: CLIENTS }, async (_, index) => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [bin, 'serve', '--state', stateFile, '--no-preview']
    });
    const client = new Client({ name: `stress-${index}`, version: '1.0.0' }, { capabilities: {} });
    await client.connect(transport);
    return { client, transport, index };
  }));

  try {
    const results = await Promise.all(clients.map(async ({ client, index }) => {
      const roundResults = [];
      for (let round = 0; round < ROUNDS; round += 1) {
        const response = await client.callTool({
          name: 'add_scene',
          arguments: {
            name: `c${index}-r${round}`,
            durationSec: 1,
            html,
            freshStart: true
          }
        });
        roundResults.push({
          ok: !response.isError,
          message: (response.content || []).map((block) => block.text).join(' ').slice(0, 160)
        });
      }
      return roundResults;
    }));

    const flat = results.flat();
    const failures = flat.filter((result) => !result.ok);
    assert.deepEqual(failures, [], `unexpected failures: ${JSON.stringify(failures.slice(0, 5))}`);
    assert.ok(!flat.some((result) => /Timed out acquiring state lock/.test(result.message)),
      'lock timeout must not be hit under sustained contention');

    // State must be valid JSON with every single write present exactly once.
    const raw = fs.readFileSync(stateFile, 'utf8');
    const saved = JSON.parse(raw);
    assert.equal(saved.scenes.length, CLIENTS * ROUNDS);
    const names = saved.scenes.map((scene) => scene.name);
    assert.equal(new Set(names).size, CLIENTS * ROUNDS, 'no duplicate or lost scene names');
    for (let index = 0; index < CLIENTS; index += 1) {
      for (let round = 0; round < ROUNDS; round += 1) {
        assert.ok(names.includes(`c${index}-r${round}`));
      }
    }
    assert.deepEqual(
      fs.readdirSync(dir).filter((file) => file.endsWith('.tmp') || file.endsWith('.lock')),
      [],
      'no stray temp or lock files'
    );
  } finally {
    await Promise.all(clients.map(({ transport }) => transport.close()));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
