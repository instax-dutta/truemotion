import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const enabled = process.env.TRUEMOTION_AUDIO_RESUME === '1';

function probe(file) {
  const stdout = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_type,duration,nb_frames',
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

test('multi-segment render with looping audio resumes with aligned A/V and tail fade', { skip: !enabled && 'set TRUEMOTION_AUDIO_RESUME=1' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-audio-resume-'));
  const bin = path.resolve('bin/truemotion.mjs');
  const stateFile = path.join(dir, 'state.json');
  const out = path.join(dir, 'film.mp4');
  const bed = path.join(dir, 'bed.m4a');

  spawnSync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3',
    '-c:a', 'aac', bed, '-loglevel', 'error'
  ]);
  const source = JSON.parse(fs.readFileSync('examples/pro-out/state.json', 'utf8'));
  fs.writeFileSync(stateFile, JSON.stringify({
    ...source,
    scenes: [
      { ...source.scenes[0], durationSec: 4 },
      { ...source.scenes[1], durationSec: 4 }
    ]
  }));

  const args = [
    bin, 'render', '--state', stateFile, '--out', out,
    '--resolution', '540p', '--fps', '10', '--batch-size', '4',
    '--segment-size', '20', '--audio', bed, '--keep-checkpoints'
  ];
  const partial = spawnSync(process.execPath, [...args, '--max-segments', '1'], { encoding: 'utf8' });
  assert.equal(partial.status, 0, partial.stderr.slice(-800));
  assert.ok(partial.stdout.includes('Checkpoint'));
  assert.ok(!fs.existsSync(out), 'partial render must not emit a final MP4');

  const manifestFile = `${out}.segments/resume.json`;
  const before = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.ok(before.segments.length >= 1);
  assert.equal(before.audio, bed);

  const resumed = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.equal(resumed.status, 0, resumed.stderr.slice(-800));
  assert.ok(resumed.stdout.includes('(resumed)'));
  assert.ok(fs.existsSync(out));

  const streams = probe(out);
  assert.ok(streams.audio, 'audio stream must survive segmented resume');
  assert.equal(Number(streams.video.nb_frames), 80);
  assert.equal(Number(streams.video.duration), 8);
  assert.ok(Math.abs(Number(streams.audio.duration) - 8) < 0.05,
    `audio ${streams.audio.duration}s vs video ${streams.video.duration}s`);

  const middle = level(out, 3, 1);
  const tail = level(out, 7.7, 0.25);
  assert.ok(tail < middle - 3, `tail fade missing: middle ${middle} dB, tail ${tail} dB`);

  // Changing the audio bed at the same path between checkpoint and resume
  // must be rejected, as must pointing at a different bed.
  const mutatedBed = path.join(dir, 'mutated.m4a');
  spawnSync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'sine=frequency=880:duration=3',
    '-c:a', 'aac', mutatedBed, '-loglevel', 'error'
  ]);
  const mutated = spawnSync(process.execPath, [...args, '--resume', '--audio', mutatedBed], { encoding: 'utf8' });
  assert.notEqual(mutated.status, 0, 'a different audio path must be rejected on resume');
  assert.ok(mutated.stderr.includes('audio bed changed'), mutated.stderr.slice(-500));

  fs.copyFileSync(mutatedBed, bed);
  const contentChanged = spawnSync(process.execPath, [...args, '--resume'], { encoding: 'utf8' });
  assert.notEqual(contentChanged.status, 0, 'different audio content at the same path must be rejected');
  assert.ok(contentChanged.stderr.includes('audio bed changed'), contentChanged.stderr.slice(-500));

  fs.rmSync(dir, { recursive: true, force: true });
});
