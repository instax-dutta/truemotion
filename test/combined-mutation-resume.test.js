import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const enabled = process.env.TRUEMOTION_COMBINED_MUTATION === '1';

function probeFrames(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'json', file
  ], { encoding: 'utf8' }).stdout;
  return Number(JSON.parse(stdout).streams[0].nb_frames);
}

function flip(file) {
  const bytes = Buffer.from(fs.readFileSync(file));
  const copy = Buffer.from(bytes);
  copy[Math.floor(copy.length / 2)] ^= 0xff;
  assert.equal(copy.length, bytes.length);
  fs.writeFileSync(file, copy);
}

test('resume with simultaneous state, asset, audio and segment mutations fails cleanly', {
  skip: !enabled && 'set TRUEMOTION_COMBINED_MUTATION=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-combined-mutation-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const logo = path.join(assetsDir, 'logo.svg');
  fs.writeFileSync(logo, '<svg></svg>');
  const bed = path.join(dir, 'bed.m4a');
  spawnSync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
    '-c:a', 'aac', bed, '-loglevel', 'error'
  ]);

  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  const scene = { ...source.scenes[0], durationSec: 4 };
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: [{ ...scene, html: scene.html.replace('<div class="frame"', '<div class="frame"><img src="{{ASSET:logo.svg}}">') }]
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '5', '--batch-size', '4',
    '--segment-size', '10', '--audio', bed, '--assets', assetsDir,
    '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(!fs.existsSync(out));

  const segDir = `${out}.segments`;
  const manifestFile = path.join(segDir, 'resume.json');
  const manifestBefore = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const entry = manifestBefore.segments[0];
  const segment = path.join(segDir, `segment-${String(entry.index).padStart(6, '0')}.ts`);

  // Mutate all four categories at once, each same-size.
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.brand.primary = '#FF0000';
  state.components = { injected: '<b>x</b>' };
  fs.writeFileSync(stateFile, JSON.stringify(state));
  flip(logo);
  flip(bed);
  flip(segment);
  const corruptedSegmentHash = createHash('sha256').update(fs.readFileSync(segment)).digest('hex');

  const rejected = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(rejected.status, 0, 'simultaneous mutations must be rejected');
  assert.ok(rejected.stderr.includes('Cannot resume'), rejected.stderr.slice(-600));
  assert.ok(!fs.existsSync(out), 'no film may be produced from a corrupted checkpoint');

  const manifestAfter = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.deepEqual(manifestAfter, manifestBefore, 'rejected resume must not modify the manifest');
  assert.equal(
    createHash('sha256').update(fs.readFileSync(segment)).digest('hex'),
    corruptedSegmentHash,
    'corrupted segment must remain on disk untouched'
  );
  assert.equal(probeFramesSafe(out), null);

  fs.rmSync(dir, { recursive: true, force: true });
});

function probeFramesSafe(file) {
  return fs.existsSync(file) ? probeFrames(file) : null;
}
