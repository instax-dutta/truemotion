import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const enabled = process.env.TRUEMOTION_MIXED_CHECKPOINT === '1';

function probeFrames(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'json', file
  ], { encoding: 'utf8' }).stdout;
  return Number(JSON.parse(stdout).streams[0].nb_frames);
}

test('mixed checkpoint recovers a corrupt segment and ignores an orphan', {
  skip: !enabled && 'set TRUEMOTION_MIXED_CHECKPOINT=1'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-mixed-checkpoint-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: [{ ...source.scenes[0], durationSec: 6 }]
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '20', '--keep-checkpoints'
  ];
  // 60 frames -> 3 segments; render the first two, leave segment 2 pending.
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '2'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(!fs.existsSync(out));

  const segDir = `${out}.segments`;
  const manifestFile = path.join(segDir, 'resume.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(manifest.segments.length, 2);
  const [validEntry, corruptEntry] = manifest.segments;

  // Keep segment 0 valid; corrupt segment 1 without changing its size.
  const corruptFile = path.join(segDir, `segment-${String(corruptEntry.index).padStart(6, '0')}.ts`);
  const bytes = Buffer.from(fs.readFileSync(corruptFile));
  const mutated = Buffer.from(bytes);
  mutated[Math.floor(mutated.length / 2)] ^= 0xff;
  assert.equal(mutated.length, bytes.length);
  fs.writeFileSync(corruptFile, mutated);

  // Add an orphan partial file for the already-pending segment 2.
  const orphan = path.join(segDir, 'segment-000002.ts');
  fs.writeFileSync(orphan, 'incomplete');

  const validBefore = createHash('sha256').update(fs.readFileSync(
    path.join(segDir, `segment-${String(validEntry.index).padStart(6, '0')}.ts`)
  )).digest('hex');

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-1000));
  assert.ok(fs.existsSync(out));
  assert.equal(probeFrames(out), 60, 'all three segments must produce 60 frames');

  const validAfter = createHash('sha256').update(fs.readFileSync(
    path.join(segDir, `segment-${String(validEntry.index).padStart(6, '0')}.ts`)
  )).digest('hex');
  assert.equal(validAfter, validBefore, 'the valid segment must be reused untouched');

  const after = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(after.segments.length, 3, 'no duplicate or missing segment entries');
  assert.deepEqual(after.segments.map((entry) => entry.index), [0, 1, 2]);
  for (const entry of after.segments) {
    const file = path.join(segDir, `segment-${String(entry.index).padStart(6, '0')}.ts`);
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), entry.digest,
      `segment ${entry.index} must match its manifest digest`);
  }
  assert.ok(after.finalized);

  fs.rmSync(dir, { recursive: true, force: true });
});
