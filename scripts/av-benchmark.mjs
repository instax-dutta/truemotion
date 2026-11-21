// Multi-minute A/V drift check: loop a short bed under a long render and
// measure stream durations and tail fade. Run: npm run bench:av
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCENES = Number(process.env.AV_SCENES || 30);
const SCENE_SEC = Number(process.env.AV_SCENE_SEC || 4);
const FPS = Number(process.env.AV_FPS || 10);
const TOTAL = SCENES * SCENE_SEC;
const EXPECTED = TOTAL * FPS;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'truemotion-av-'));
const bed = path.join(dir, 'bed.m4a');
const out = path.join(dir, 'av.mp4');
const stateFile = path.join(dir, 'state.json');

spawnSync('ffmpeg', [
  '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3',
  '-c:a', 'aac', bed, '-loglevel', 'error'
]);
const source = JSON.parse(fs.readFileSync(path.join(root, 'examples/pro-out/state.json'), 'utf8'));
const template = source.scenes[0];
fs.writeFileSync(stateFile, JSON.stringify({
  ...source,
  scenes: Array.from({ length: SCENES }, () => ({ ...template, durationSec: SCENE_SEC }))
}));

console.log(`A/V drift check: ${SCENES} scenes, ${TOTAL}s, ${EXPECTED} frames, 3s looping bed`);
const started = performance.now();
const child = spawn(process.execPath, [
  path.join(root, 'bin/truemotion.mjs'), 'render',
  '--state', stateFile, '--out', out,
  '--resolution', '540p', '--fps', String(FPS),
  '--batch-size', '24', '--audio', bed
], { cwd: root });
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
const code = await new Promise((resolve) => child.on('close', resolve));
if (code !== 0) {
  fs.rmSync(dir, { recursive: true, force: true });
  process.exit(1);
}

const probe = JSON.parse(spawnSync('ffprobe', [
  '-v', 'error', '-show_entries', 'stream=codec_type,duration,nb_frames',
  '-of', 'json', out
], { encoding: 'utf8' }).stdout);
const video = probe.streams.find((s) => s.codec_type === 'video');
const audio = probe.streams.find((s) => s.codec_type === 'audio');

function level(start, length) {
  const stderr = spawnSync('ffmpeg', [
    '-ss', String(start), '-t', String(length), '-i', out,
    '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'
  ], { encoding: 'utf8' }).stderr;
  return Number(stderr.match(/mean_volume: ([-\d.]+) dB/)?.[1]);
}

const middle = level(TOTAL / 2 - 0.5, 1);
const tailStart = Math.max(0, TOTAL - 0.6);
const tail = level(tailStart + 0.05, Math.max(0.1, TOTAL - tailStart - 0.1));
const result = {
  timelineSeconds: TOTAL,
  videoFrames: Number(video.nb_frames),
  expectedFrames: EXPECTED,
  videoDuration: Number(video.duration),
  audioDuration: Number(audio.duration),
  driftMs: Math.round((Math.abs(Number(video.duration) - Number(audio.duration))) * 1000),
  middleDb: middle,
  tailDb: tail,
  fadeReductionDb: Number((middle - tail).toFixed(1)),
  elapsedSeconds: Number(((performance.now() - started) / 1000).toFixed(2))
};
console.log('\nRESULT ' + JSON.stringify(result));
const report = path.join(root, 'docs/benchmarks/av-drift.md');
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, `# A/V drift (multi-minute)\n\nRecorded ${new Date().toISOString()} on ${process.platform}/${process.arch}, Node ${process.version}.\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\nA 3-second audio bed is looped under a ${TOTAL}-second video. Drift is the absolute difference between audio and video stream durations. Tail level is measured in the final ~0.5 s, after the fade-out begins at \`total - 0.6\` seconds.\n`);
console.log(`Wrote ${report}`);
fs.rmSync(dir, { recursive: true, force: true });
