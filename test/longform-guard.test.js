import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('long-form guard script is wired into the nightly workflow', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/nightly.yml'), 'utf8');
  assert.ok(workflow.includes('npm run guard:longform'));
  assert.ok(workflow.includes('LF_REPORT=docs/benchmarks/nightly-linux.md'));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['guard:longform'], 'node scripts/guard-longform.mjs');
});

test('documented thresholds match the guard defaults', () => {
  const guard = fs.readFileSync(path.join(root, 'scripts/guard-longform.mjs'), 'utf8');
  assert.match(guard, /GUARD_MIN_FRAMES \|\| 1200/);
  assert.match(guard, /GUARD_MIN_FPS \|\| 4/);
  assert.match(guard, /GUARD_MAX_RSS_MIB \|\| 2800/);
  const doc = fs.readFileSync(path.join(root, 'docs/benchmarks/longform.md'), 'utf8');
  for (const value of ['1200', '2800 MiB', '4 fps']) {
    assert.ok(doc.includes(value), `thresholds doc missing ${value}`);
  }
});
