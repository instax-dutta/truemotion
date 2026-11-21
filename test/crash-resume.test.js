import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_CRASH === '1';

function probeFrames(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-of', 'json', file
  ], { encoding: 'utf8' }).stdout;
  return Number(JSON.parse(stdout).streams[0].nb_frames);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('render survives a SIGKILL mid-segment and resumes from checkpoint', { skip: !enabled && 'set TRUEMOTION_CRASH=1' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-crash-'));
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
    '--segment-size', '10', '--keep-checkpoints'
  ];
  const manifestFile = `${out}.segments/resume.json`;

  const victim = spawn(process.execPath, args, { cwd: path.resolve('.'), stdio: ['ignore', 'pipe', 'pipe'] });
  let sawCheckpoint = false;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline && victim.exitCode === null) {
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      if (manifest.segments.length >= 1) { sawCheckpoint = true; break; }
    }
    await sleep(100);
  }
  assert.ok(sawCheckpoint, 'expected at least one checkpointed segment before crash');

  victim.kill('SIGKILL');
  await new Promise((resolve) => victim.once('close', resolve));
  assert.ok(!fs.existsSync(out), 'a crashed render must not emit a final MP4');

  const before = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(before.segments.length >= 1);

  const resumed = spawnSync(process.execPath, [...args, '--resume'], {
    cwd: path.resolve('.'), encoding: 'utf8'
  });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-1000));
  assert.ok(resumed.stdout.includes('(resumed)'), resumed.stdout);
  assert.ok(fs.existsSync(out));
  assert.equal(probeFrames(out), 40);

  const after = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(after.finalized, 'manifest should be marked finalized after resume');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('SIGKILL during a partial MPEG-TS write discards the orphan on resume', { skip: !enabled && 'set TRUEMOTION_CRASH=1' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-crash-partial-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: Array.from({ length: 3 }, () => ({ ...source.scenes[0], durationSec: 4 }))
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '60', '--keep-checkpoints'
  ];
  const segDir = `${out}.segments`;
  const manifestFile = path.join(segDir, 'resume.json');

  const victim = spawn(process.execPath, args, { cwd: path.resolve('.'), stdio: ['ignore', 'pipe', 'pipe'] });
  let orphan = null;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline && victim.exitCode === null) {
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      const complete = new Set(manifest.segments.map((entry) => entry.index));
      for (const file of fs.readdirSync(segDir).filter((name) => /^segment-\d+\.ts$/.test(name))) {
        const index = Number(file.match(/segment-(\d+)\.ts/)[1]);
        if (!complete.has(index)) {
          const filePath = path.join(segDir, file);
          if (fs.statSync(filePath).size > 0) {
            orphan = { filePath, index, bytes: fs.statSync(filePath).size };
            break;
          }
        }
      }
    }
    if (orphan) break;
    await sleep(20);
  }
  assert.ok(orphan, 'expected an in-flight (not yet manifested) segment file');

  victim.kill('SIGKILL');
  await new Promise((resolve) => victim.once('close', resolve));
  assert.ok(fs.existsSync(orphan.filePath), 'orphan partial file should remain on disk');
  assert.equal(fs.statSync(orphan.filePath).size, orphan.bytes);

  const before = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(!before.segments.some((entry) => entry.index === orphan.index),
    'orphan segment must not be in the byte-verified manifest');

  const resumed = spawnSync(process.execPath, [...args, '--resume'], {
    cwd: path.resolve('.'), encoding: 'utf8'
  });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-1000));
  assert.ok(fs.existsSync(out));
  assert.equal(probeFrames(out), 120);

  const after = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const entry = after.segments.find((segment) => segment.index === orphan.index);
  assert.ok(entry, 'resume must add the previously orphaned segment to the manifest');
  assert.equal(fs.statSync(orphan.filePath).size, entry.bytes,
    'the orphan file must be re-encoded to its verified size');
  fs.rmSync(dir, { recursive: true, force: true });
});
