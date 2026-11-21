import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readSkillCached } from '../src/skill.js';

test('skill cache is invalidated when a reference file changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-skill-cache-'));
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# version one');
  const state = { skillReadCache: {} };

  assert.equal(readSkillCached(state, dir, 'SKILL.md'), '# version one');
  const first = state.skillReadCache['SKILL.md'];
  assert.equal(first.content, '# version one');
  assert.equal(readSkillCached(state, dir, 'SKILL.md'), '# version one');

  // Same path, new content: fingerprint changes and the cache is refreshed.
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# version two with more text');
  assert.equal(readSkillCached(state, dir, 'SKILL.md'), '# version two with more text');
  assert.notEqual(state.skillReadCache['SKILL.md'].fingerprint, first.fingerprint);

  // A legacy string cache entry is treated as stale.
  state.skillReadCache['SKILL.md'] = '# version one';
  assert.equal(readSkillCached(state, dir, 'SKILL.md'), '# version two with more text');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('same-size edit with unchanged mtime still invalidates the cache', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-skill-hash-'));
  const target = path.join(dir, 'SKILL.md');
  fs.writeFileSync(target, 'abcdefgh');
  const state = { skillReadCache: {} };
  assert.equal(readSkillCached(state, dir, 'SKILL.md'), 'abcdefgh');
  const before = state.skillReadCache['SKILL.md'].fingerprint;

  // Same length, and force the same mtime so mtime+size would miss this.
  fs.writeFileSync(target, 'abcdWxyz');
  const stat = fs.statSync(target);
  fs.utimesSync(target, stat.atime, new Date(0));
  assert.equal(readSkillCached(state, dir, 'SKILL.md'), 'abcdWxyz');
  assert.notEqual(state.skillReadCache['SKILL.md'].fingerprint, before);
  assert.equal(state.skillReadCache['SKILL.md'].fingerprint.length, 64);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('skill cache distinguishes different skill directories', () => {
  const a = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-skill-a-'));
  const b = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-skill-b-'));
  fs.writeFileSync(path.join(a, 'SKILL.md'), '# dir A');
  fs.writeFileSync(path.join(b, 'SKILL.md'), '# dir B');
  const state = { skillReadCache: {} };
  assert.equal(readSkillCached(state, a, 'SKILL.md'), '# dir A');
  assert.equal(readSkillCached(state, b, 'SKILL.md'), '# dir B');
  assert.equal(readSkillCached(state, a, 'SKILL.md'), '# dir A');
  fs.rmSync(a, { recursive: true, force: true });
  fs.rmSync(b, { recursive: true, force: true });
});
