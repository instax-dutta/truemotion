// Reproducible organisation-scale render: multi-minute 1080p timeline with
// whole-process-tree peak RSS sampling. Run: npm run bench:longform
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCENES = Number(process.env.LF_SCENES || 30);
const SCENE_SEC = Number(process.env.LF_SCENE_SEC || 4);
const FPS = Number(process.env.LF_FPS || 10);
const BATCH = Number(process.env.LF_BATCH || 24);
const CONCURRENCY = Number(process.env.LF_CONCURRENCY || 2);
const TOTAL_SEC = SCENES * SCENE_SEC;
const EXPECTED = SCENES * SCENE_SEC * FPS;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'truemotion-longform-'));
const stateFile = path.join(dir, 'state.json');
const out = path.join(dir, 'longform.mp4');

const source = JSON.parse(fs.readFileSync(path.join(root, 'examples/pro-out/state.json'), 'utf8'));
const template = source.scenes[0];
const state = {
  ...source,
  scenes: Array.from({ length: SCENES }, () => ({ ...template, durationSec: SCENE_SEC }))
};
fs.writeFileSync(stateFile, JSON.stringify(state));

function treeRss(rootPid) {
  let out = '';
  try {
    out = spawnSync('ps', ['-eo', 'pid=,ppid=,rss='], { encoding: 'utf8' }).stdout;
  } catch { return 0; }
  const rows = out.trim().split('\n').map((line) => line.trim().split(/\s+/).map(Number));
  const children = new Map();
  for (const [pid, ppid, rss] of rows) {
    if (!children.has(ppid)) children.set(ppid, []);
    children.get(ppid).push({ pid, rss });
  }
  let total = 0;
  const stack = [...(children.get(rootPid) || [])];
  while (stack.length) {
    const node = stack.pop();
    total += node.rss || 0;
    stack.push(...(children.get(node.pid) || []));
  }
  return total / 1024; // KiB -> MiB
}

const RESOLUTION = process.env.LF_RESOLUTION || '1080p';
console.log(`Long-form: ${SCENES} scenes x ${SCENE_SEC}s = ${TOTAL_SEC}s, ${FPS} fps, ${EXPECTED} frames, ${BATCH}-frame batches, ${RESOLUTION}`);
const started = performance.now();
const child = spawn(process.execPath, [
  path.join(root, 'bin/truemotion.mjs'), 'render',
  '--state', stateFile, '--out', out,
  '--resolution', RESOLUTION, '--fps', String(FPS),
  '--batch-size', String(BATCH), '--concurrency', String(CONCURRENCY)
], { cwd: root });

let peakRss = 0;
let stderr = '';
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
child.stdout.on('data', (chunk) => { process.stdout.write(chunk); });
const sampler = setInterval(() => {
  const rss = treeRss(child.pid);
  if (rss > peakRss) peakRss = rss;
}, 500);
const exitCode = await new Promise((resolve) => child.on('close', resolve));
clearInterval(sampler);

const elapsed = (performance.now() - started) / 1000;
if (exitCode !== 0) {
  console.error(`render failed (exit ${exitCode}): ${stderr.slice(-1500)}`);
  fs.rmSync(dir, { recursive: true, force: true });
  process.exit(1);
}
const probe = JSON.parse(spawnSync('ffprobe', [
  '-v', 'error', '-show_entries', 'format=duration',
  '-show_entries', 'stream=nb_frames,width,height', '-of', 'json', out
], { encoding: 'utf8' }).stdout);
const frameCount = Number(probe.streams[0].nb_frames);
const result = {
  scenes: SCENES,
  timelineSeconds: TOTAL_SEC,
  expectedFrames: EXPECTED,
  frames: frameCount,
  resolution: `${probe.streams[0].width}x${probe.streams[0].height}`,
  elapsedSeconds: Number(elapsed.toFixed(2)),
  framesPerSecond: Number((frameCount / elapsed).toFixed(1)),
  peakTreeRssMib: Math.round(peakRss),
  outputKib: Math.round(fs.statSync(out).size / 1024)
};
console.log('\nRESULT ' + JSON.stringify(result));
const reportPath = process.env.LF_REPORT || 'docs/benchmarks/longform.md';
const report = path.isAbsolute(reportPath) ? reportPath : path.join(root, reportPath);
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, `# Long-form render\n\nRecorded ${new Date().toISOString()} on ${process.platform}/${process.arch}, Node ${process.version}.\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\nPeak RSS is sampled across the whole process tree (Node + Chromium + ffmpeg) every 500 ms. Frames are streamed to ffmpeg in bounded batches; no staging directory is written.\n`);
console.log(`Wrote ${report}`);
fs.rmSync(dir, { recursive: true, force: true });
