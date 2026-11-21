import test from 'node:test';
import assert from 'node:assert/strict';
import { skillPath } from '../src/skill.js';
import { injectSceneHtml } from '../src/inject.js';

test('skillPath rejects traversal and non-md', () => {
  const dir = new URL('../skill/', import.meta.url).pathname;
  assert.throws(() => skillPath(dir, '../package.json'));
  assert.throws(() => skillPath(dir, 'foo.txt'));
});

test('injectSceneHtml resolves the THREE token locally', () => {
  assert.ok(injectSceneHtml('{{THREE}}', { width: 1, height: 1 }).includes('data-om-three-runtime'));
});
