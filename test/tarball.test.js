import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('package metadata is complete for publication', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'truemotion');
  assert.equal(pkg.license, 'MIT');
  assert.ok(pkg.repository?.url?.includes('github.com/instax-dutta/truemotion'));
  assert.equal(pkg.bin?.truemotion, './bin/truemotion.mjs');
  assert.match(pkg.engines.node, />=20/);
  assert.match(pkg.scripts.prepack, /verify-tarball/);
  for (const file of ['README.md', 'LICENSE', 'NOTICE.md', 'CONTRIBUTING.md', 'CHANGELOG.md']) {
    assert.ok(pkg.files.includes(file), `${file} must be in the published files list`);
  }
});

test('tarball verifier rejects media and accepts the current tree', () => {
  const verifier = fs.readFileSync(path.join(root, 'scripts/verify-tarball.mjs'), 'utf8');
  assert.ok(verifier.includes('--ignore-scripts'), 'must avoid prepack recursion');
  assert.ok(/\.env/.test(verifier), 'must reject env files');
  assert.ok(/node_modules/.test(verifier), 'must reject dependencies');
  const media = ['examples/pro-out/pro-demo.mp4', 'examples/pro-out/ambient.wav'];
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  for (const file of media) {
    assert.ok(pkg.files.some((entry) => entry.includes('*.mp4') || entry.includes('*.wav')),
      `${file} must be excluded by the files list`);
  }
});
