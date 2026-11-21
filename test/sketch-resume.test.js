import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_SKETCH_RESUME === '1';

test('resume rejects changed sketchRefs while scenes, brand, assets and audio stay identical', {
  skip: !enabled && 'set TRUEMOTION_SKETCH_RESUME=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-sketch-resume-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'sketch.png'), 'sketch one');

  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  const sketchRef = {
    sceneId: source.scenes[0].id,
    sceneName: source.scenes[0].name,
    relativePath: 'sketch.png',
    width: 100,
    height: 50
  };
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    sketchRefs: [sketchRef],
    scenes: [{ ...source.scenes[0], durationSec: 4 }]
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '5', '--batch-size', '4',
    '--segment-size', '10', '--assets', assetsDir, '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(!fs.existsSync(out));

  // Change only sketchRefs metadata.
  const changed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  changed.sketchRefs[0].sceneName = 'Renamed sketch';
  fs.writeFileSync(stateFile, JSON.stringify(changed));

  const rejected = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(rejected.status, 0, 'changed sketchRefs must be rejected on resume');
  assert.ok(rejected.stderr.includes('the state file changed since checkpointing'), rejected.stderr.slice(-600));
  assert.ok(!fs.existsSync(out));

  // Restore state and corrupt the sketch PNG at the same size instead.
  changed.sketchRefs[0].sceneName = sketchRef.sceneName;
  fs.writeFileSync(stateFile, JSON.stringify(changed));
  const sketch = path.join(assetsDir, 'sketch.png');
  const original = fs.readFileSync(sketch);
  const corrupted = Buffer.from(original);
  corrupted[0] ^= 0xff;
  assert.equal(corrupted.length, original.length);
  fs.writeFileSync(sketch, corrupted);

  const contentRejected = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(contentRejected.status, 0, 'same-size sketch change must be rejected on resume');
  assert.ok(contentRejected.stderr.includes('the state file changed since checkpointing'), contentRejected.stderr.slice(-600));
  assert.ok(!fs.existsSync(out));

  fs.rmSync(dir, { recursive: true, force: true });
});
