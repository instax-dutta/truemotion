import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_COMPONENT_RESUME === '1';

test('resume rejects a changed component while scenes, brand, assets and audio stay identical', {
  skip: !enabled && 'set TRUEMOTION_COMPONENT_RESUME=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-component-resume-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const bed = path.join(dir, 'bed.m4a');
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

  spawnSync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
    '-c:a', 'aac', bed, '-loglevel', 'error'
  ]);
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  const state = {
    ...source,
    brand: { ...source.brand },
    components: { card: '<div class="om-card" data-om-id="card">A clear title</div>' },
    scenes: [
      { ...source.scenes[0], durationSec: 4, html: source.scenes[0].html.replace('<div class="frame"', '<div class="frame">{{COMPONENT:card}}') }
    ]
  };
  fs.writeFileSync(stateFile, JSON.stringify(state));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '5', '--batch-size', '4',
    '--segment-size', '10', '--audio', bed, '--assets', assetsDir,
    '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(partial.stdout.includes('Checkpoint'));
  assert.ok(!fs.existsSync(out));

  const manifestFile = `${out}.segments/resume.json`;
  const before = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const digestBefore = before.digest;

  // Change only the component definition; keep everything else byte-identical.
  const changed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  changed.components.card = '<div class="om-card" data-om-id="card">A DIFFERENT title</div>';
  fs.writeFileSync(stateFile, JSON.stringify(changed));

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(resumed.status, 0, 'component change must be rejected on resume');
  assert.ok(resumed.stderr.includes('the state file changed since checkpointing'), resumed.stderr.slice(-600));
  assert.ok(!fs.existsSync(out), 'rejected resume must not produce a film');

  const after = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(after.digest, digestBefore, 'rejected resume must not rewrite the manifest');
  assert.ok(after.segments.length >= 1);

  fs.rmSync(dir, { recursive: true, force: true });
});
