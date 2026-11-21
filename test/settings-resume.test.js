import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_SETTINGS_RESUME === '1';

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-settings-resume-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: [{ ...source.scenes[0], durationSec: 4 }]
  }));
  return { dir, bin, stateFile };
}

function partial(bin, stateFile, out, extra = []) {
  return spawnSync(process.execPath, [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '10', '--keep-checkpoints', ...extra, '--max-segments', '1'
  ], { encoding: 'utf8' });
}

test('resume rejects a changed fps with identical state and audio', {
  skip: !enabled && 'set TRUEMOTION_SETTINGS_RESUME=1'
}, () => {
  const { dir, bin, stateFile } = setup();
  const out = path.join(dir, 'film.mp4');
  const first = partial(bin, stateFile, out);
  assert.equal(first.status, 0, first.stderr.slice(-800));
  assert.ok(!fs.existsSync(out));

  const changed = spawnSync(process.execPath, [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '15', '--batch-size', '4',
    '--segment-size', '10', '--resume'
  ], { encoding: 'utf8' });
  assert.notEqual(changed.status, 0, 'fps change must be rejected on resume');
  assert.ok(changed.stderr.includes('render settings changed since checkpointing'), changed.stderr.slice(-600));
  assert.ok(!fs.existsSync(out), 'rejected resume must not produce a film');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('resume rejects a changed resolution with identical state and audio', {
  skip: !enabled && 'set TRUEMOTION_SETTINGS_RESUME=1'
}, () => {
  const { dir, bin, stateFile } = setup();
  const out = path.join(dir, 'film.mp4');
  const first = partial(bin, stateFile, out);
  assert.equal(first.status, 0, first.stderr.slice(-800));

  const changed = spawnSync(process.execPath, [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '720p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '10', '--resume'
  ], { encoding: 'utf8' });
  assert.notEqual(changed.status, 0, 'resolution change must be rejected on resume');
  assert.ok(changed.stderr.includes('render settings changed since checkpointing'), changed.stderr.slice(-600));
  assert.ok(!fs.existsSync(out));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('resume rejects a changed segment size', {
  skip: !enabled && 'set TRUEMOTION_SETTINGS_RESUME=1'
}, () => {
  const { dir, bin, stateFile } = setup();
  const out = path.join(dir, 'film.mp4');
  const first = partial(bin, stateFile, out);
  assert.equal(first.status, 0, first.stderr.slice(-800));

  const changed = spawnSync(process.execPath, [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '20', '--resume'
  ], { encoding: 'utf8' });
  assert.notEqual(changed.status, 0, 'segment size change must be rejected on resume');
  assert.ok(changed.stderr.includes('render settings changed since checkpointing'), changed.stderr.slice(-600));
  fs.rmSync(dir, { recursive: true, force: true });
});
