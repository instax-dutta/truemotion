import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { sanitizeExportFilename, sanitizeOutputPath } from '../src/filename.js';

test('export filenames drop unsafe characters', () => {
  assert.equal(sanitizeExportFilename('a/b:c*?'), 'a_b_c__');
  assert.equal(sanitizeExportFilename('  too   many   spaces '), 'too many spaces');
  assert.equal(sanitizeExportFilename('<<<>>>'), '______');
  assert.equal(sanitizeExportFilename(''), 'Untitled');
  assert.equal(sanitizeExportFilename('normal name.mp4'), 'normal name.mp4');
});

test('output paths keep directory and extension', () => {
  const result = sanitizeOutputPath('/tmp/my films/a:b?/launch.mp4');
  assert.equal(path.dirname(result), '/tmp/my films/a:b?');
  assert.equal(path.basename(result), 'launch.mp4');
});
