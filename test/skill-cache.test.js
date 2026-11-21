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
