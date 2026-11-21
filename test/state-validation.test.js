import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createState, loadState, saveState, normalizeState } from '../src/state.js';

const scene = { id: 'abc', name: 'A', durationSec: 2, html: '<html></html>' };

test('normalizeState supplies defaults and normalises durations', () => {
  const result = normalizeState({ scenes: [{ ...scene, durationSec: '3' }] });
  assert.equal(result.aspect, '16:9');
  assert.equal(result.resolution, '1080p');
  assert.equal(result.scenes[0].durationSec, 3);
  assert.deepEqual(result.sketchRefs, []);
  assert.deepEqual(result.stats, { readSkillCalls: 0, writeSceneCalls: 0 });
});

test('normalizeState rejects malformed scenes and unknown dimensions', () => {
  assert.throws(() => normalizeState({}), /scenes array/);
  assert.throws(() => normalizeState({ aspect: '4:3', scenes: [] }), /Unknown aspect/);
  assert.throws(() => normalizeState({ scenes: [{}] }), /no id/);
  assert.throws(() => normalizeState({ scenes: [{ ...scene, name: '' }] }), /no name/);
  assert.throws(() => normalizeState({ scenes: [{ ...scene, durationSec: -1 }] }), /durationSec/);
  assert.throws(() => normalizeState({ scenes: [{ ...scene, html: '  ' }] }), /no html/);
});

test('saveState writes atomically and loadState reads it back', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-state-'));
  const file = path.join(dir, 'state.json');
  const state = createState();
  state.scenes.push(scene);
  saveState(file, state);
  assert.equal(fs.readdirSync(dir).length, 1);
  assert.equal(loadState(file).scenes[0].id, 'abc');
  fs.rmSync(dir, { recursive: true, force: true });
});
