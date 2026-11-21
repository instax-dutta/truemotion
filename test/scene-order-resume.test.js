import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_SCENE_ORDER === '1';

test('resume rejects a scene reorder even when scene contents are unchanged', {
  skip: !enabled && 'set TRUEMOTION_SCENE_ORDER=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-scene-order-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  const [sceneA, sceneB] = source.scenes;

  // Two distinct scenes with different ids, names and HTML.
  assert.notEqual(sceneA.id, sceneB.id);
  assert.notEqual(sceneA.html, sceneB.html);
  const state = {
    ...source,
    scenes: [
      { ...sceneA, durationSec: 4 },
      { ...sceneB, durationSec: 4 }
    ]
  };
  fs.writeFileSync(stateFile, JSON.stringify(state));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '5', '--batch-size', '4',
    '--segment-size', '20', '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(partial.stdout.includes('Checkpoint'));
  assert.ok(!fs.existsSync(out), 'partial render must not emit a final MP4');

  const manifestBefore = JSON.parse(fs.readFileSync(`${out}.segments/resume.json`, 'utf8'));
  const digestBefore = manifestBefore.digest;

  // Reorder the same scene objects. No scene is edited and durations are equal.
  const reordered = { ...state, scenes: [state.scenes[1], state.scenes[0]] };
  fs.writeFileSync(stateFile, JSON.stringify(reordered));

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(resumed.status, 0, 'reordered scenes must be rejected on resume');
  assert.ok(resumed.stderr.includes('the state file changed since checkpointing'), resumed.stderr.slice(-600));
  assert.ok(!fs.existsSync(out), 'rejected resume must not produce a film');

  const manifestAfter = JSON.parse(fs.readFileSync(`${out}.segments/resume.json`, 'utf8'));
  assert.equal(manifestAfter.digest, digestBefore, 'rejected resume must not rewrite the manifest');
  assert.ok(manifestAfter.segments.length >= 1);

  fs.rmSync(dir, { recursive: true, force: true });
});
