import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_LONG_AV === '1';

function probe(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_type,duration,nb_frames,width,height',
    '-of', 'json', file
  ], { encoding: 'utf8' }).stdout;
  const parsed = JSON.parse(stdout);
  return {
    video: parsed.streams.find((s) => s.codec_type === 'video'),
    audio: parsed.streams.find((s) => s.codec_type === 'audio')
  };
}

function level(file, start, length) {
  const stderr = spawnSync('ffmpeg', [
    '-ss', String(start), '-t', String(length), '-i', file,
    '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'
  ], { encoding: 'utf8' }).stderr;
  return Number(stderr.match(/mean_volume: ([-\d.]+) dB/)?.[1]);
}

test('two-minute 1080p multi-segment render with looping audio resumes with aligned A/V', {
  skip: !enabled && 'set TRUEMOTION_LONG_AV=1 (heavy: ~4 minutes)'
}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-long-av-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const bed = path.join(dir, 'bed.m4a');

  spawnSync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3',
    '-c:a', 'aac', bed, '-loglevel', 'error'
  ]);
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  const template = source.scenes[0];
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: Array.from({ length: 30 }, () => ({ ...template, durationSec: 4 }))
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '1080p', '--fps', '10', '--batch-size', '24',
    '--segment-size', '300', '--audio', bed, '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-1200));
  assert.ok(partial.stdout.includes('Checkpoint'));
  assert.ok(!fs.existsSync(out), 'partial render must not emit a final MP4');

  const manifestFile = `${out}.segments/resume.json`;
  const before = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(before.segments.length >= 1);
  assert.equal(before.totalFrames, 1200);
  assert.ok(before.audioDigest, 'manifest must record audio content');

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-1200));
  assert.ok(resumed.stdout.includes('(resumed)'));
  assert.ok(fs.existsSync(out));

  const streams = probe(out);
  assert.equal(Number(streams.video.nb_frames), 1200);
  assert.equal(Number(streams.video.width), 1920);
  assert.equal(Number(streams.video.height), 1080);
  assert.equal(Number(streams.video.duration), 120);
  assert.ok(streams.audio, 'audio stream must survive segmented resume');
  assert.ok(Math.abs(Number(streams.audio.duration) - 120) < 0.05,
    `audio ${streams.audio.duration}s vs video ${streams.video.duration}s`);

  const middle = level(out, 59, 1);
  const tail = level(out, 119.7, 0.25);
  assert.ok(tail < middle - 3, `tail fade missing: middle ${middle} dB, tail ${tail} dB`);

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(manifest.segments.length, 4);
  assert.ok(manifest.finalized);
  fs.rmSync(dir, { recursive: true, force: true });
});
