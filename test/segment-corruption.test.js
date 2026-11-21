import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const enabled = process.env.TRUEMOTION_SEGMENT_CORRUPTION === '1';

function probeFrames(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'json', file
  ], { encoding: 'utf8' }).stdout;
  return Number(JSON.parse(stdout).streams[0].nb_frames);
}

test('resume re-encodes a completed segment corrupted without changing its size', {
  skip: !enabled && 'set TRUEMOTION_SEGMENT_CORRUPTION=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-segment-corrupt-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: [{ ...source.scenes[0], durationSec: 4 }]
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '20', '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));

  const segDir = `${out}.segments`;
  const manifestFile = path.join(segDir, 'resume.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(manifest.segments.length >= 1);
  const entry = manifest.segments[0];
  assert.ok(entry.digest, 'manifest must store a segment digest');

  const segment = path.join(segDir, `segment-${String(entry.index).padStart(6, '0')}.ts`);
  const original = fs.readFileSync(segment);
  const corrupted = Buffer.from(original);
  corrupted[Math.floor(corrupted.length / 2)] ^= 0xff;
  assert.equal(corrupted.length, original.length, 'corruption must preserve byte size');
  fs.writeFileSync(segment, corrupted);

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-800));
  assert.ok(fs.existsSync(out));
  assert.equal(probeFrames(out), 40, 'final film must contain all frames');

  const after = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const finalEntry = after.segments.find((item) => item.index === entry.index);
  assert.equal(finalEntry.digest, createHash('sha256').update(fs.readFileSync(segment)).digest('hex'));
  assert.ok(after.finalized);
  fs.rmSync(dir, { recursive: true, force: true });
});
