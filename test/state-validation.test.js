import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createState, loadState, saveState, normalizeState, SCHEMA_VERSION } from '../src/state.js';

const scene = { id: 'abc', name: 'A', durationSec: 2, html: '<html></html>' };

test('state files carry an explicit schema version', () => {
  assert.equal(SCHEMA_VERSION, 1);
  assert.equal(createState().schemaVersion, SCHEMA_VERSION);
  assert.equal(normalizeState({ scenes: [] }, { onWarning() {} }).schemaVersion, SCHEMA_VERSION);
});

test('legacy and older state files migrate with a warning', () => {
  const warnings = [];
  const onWarning = (message) => warnings.push(message);
  const legacy = normalizeState({ scenes: [scene] }, { onWarning });
  assert.equal(legacy.schemaVersion, SCHEMA_VERSION);
  assert.ok(warnings.some((w) => w.includes('no schemaVersion')));

  const old = normalizeState({ schemaVersion: 0, scenes: [scene] }, { onWarning });
  assert.equal(old.schemaVersion, SCHEMA_VERSION);
  assert.ok(warnings.some((w) => w.includes('Migrating state file from schema v0')));
});

test('newer or invalid schema versions are rejected', () => {
  const silent = { onWarning() {} };
  assert.throws(() => normalizeState({ schemaVersion: SCHEMA_VERSION + 1, scenes: [] }, silent), /newer than supported/);
  assert.throws(() => normalizeState({ schemaVersion: 'one', scenes: [] }, silent), /Invalid schemaVersion/);
});

test('loadState surfaces migration warnings as callbacks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-schema-'));
  const file = path.join(dir, 'state.json');
  fs.writeFileSync(file, JSON.stringify({ scenes: [scene] }));
  const warnings = [];
  const loaded = loadState(file, { onWarning: (message) => warnings.push(message) });
  assert.equal(loaded.schemaVersion, SCHEMA_VERSION);
  assert.ok(warnings.length > 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

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
