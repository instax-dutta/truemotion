// Reproducible local benchmark. Run: npm run benchmark
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { createState } from '../src/state.js';
import { renderVideo } from '../src/render.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCENE = `<!doctype html><html><head><meta charset="utf-8"><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0B0E14}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14}
h1{position:absolute;left:120px;top:420px;font-family:'Display';font-weight:900;font-size:140px;color:#F3EFE9}
.box{position:absolute;left:120px;top:620px;width:420px;height:8px;background:#F5A524;transform-origin:left center}
</style></head><body><div class="frame"><h1 data-om-id="title">Benchmark</h1><div class="box"></div></div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo('h1',{y:60,opacity:0},{y:0,opacity:1,duration:0.8,ease:'power3.out'},0.1);
tl.fromTo('.box',{scaleX:0},{scaleX:1,duration:2.4,ease:'power2.inOut'},0.5);
window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=4;
</script></body></html>`;

function makeState() {
  const state = createState();
  state.scenes.push({ id: 'benchmark', name: 'Benchmark', durationSec: 4, html: SCENE });
  return state;
}

function firstLine(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return result.status === 0 ? (result.stdout || '').split('\n')[0] : 'unavailable';
}

function sourceFootprint() {
  let bytes = 0;
  let files = 0;
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      if (['node_modules', '.git', 'out'].includes(entry.name)) continue;
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (/\.(mp4|m4a|wav)$/i.test(entry.name)) continue;
      bytes += fs.statSync(full).size;
      files += 1;
    }
  };
  for (const dir of ['src', 'bin', 'skill', 'test', 'scripts', 'examples', 'docs']) walk(path.join(root, dir));
  for (const file of ['package.json', 'package-lock.json', 'README.md', 'LICENSE', 'NOTICE.md', 'CONTRIBUTING.md', 'CHANGELOG.md', '.gitignore']) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) { bytes += fs.statSync(full).size; files += 1; }
  }
  return { kib: Math.round(bytes / 1024), files };
}

const configurations = [
  { resolution: '1080p', concurrency: 1 },
  { resolution: '540p', concurrency: 1 },
  { resolution: '540p', concurrency: 4 }
];

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'truemotion-bench-'));
const results = [];
try {
  for (const config of configurations) {
    const out = path.join(temp, `${config.resolution}-c${config.concurrency}.mp4`);
    const started = performance.now();
    const rendered = await renderVideo(makeState(), out, { fps: 10, crf: 23, ...config });
    const seconds = (performance.now() - started) / 1000;
    results.push({ ...config, frames: rendered.frames, seconds, framesPerSecond: rendered.frames / seconds });
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8' });
let packInfo = null;
try { packInfo = JSON.parse(packed.stdout)[0]; } catch {}
const nodeModules = spawnSync('du', ['-sk', path.join(root, 'node_modules')], { encoding: 'utf8' });
const footprint = sourceFootprint();

const lines = [];
lines.push('# Benchmark');
lines.push('');
lines.push(`Recorded ${new Date().toISOString()} on ${process.platform}/${process.arch}, Node ${process.version}.`);
lines.push(`ffmpeg: ${firstLine('ffmpeg', ['-version'])}`);
lines.push('');
lines.push('## Render (4s scene, 10 fps, 40 frames, CRF 23)');
lines.push('');
lines.push('| Resolution | Concurrency | Seconds | Frames/s |');
lines.push('| --- | --- | --- | --- |');
for (const r of results) {
  lines.push(`| ${r.resolution} | ${r.concurrency} | ${r.seconds.toFixed(2)} | ${r.framesPerSecond.toFixed(1)} |`);
}
lines.push('');
lines.push('## Footprint');
lines.push('');
lines.push(`- npm tarball: ${packInfo ? (packInfo.size / 1024).toFixed(0) + ' KiB' : 'unavailable'}`);
lines.push(`- npm unpacked: ${packInfo ? (packInfo.unpackedSize / 1024 / 1024).toFixed(2) + ' MiB' : 'unavailable'}`);
lines.push(`- installed dependencies: ${(parseInt(nodeModules.stdout, 10) / 1024 || 0).toFixed(1)} MiB`);
lines.push(`- project source and docs: ${footprint.kib} KiB in ${footprint.files} files`);
const markdown = lines.join('\n');
console.log(markdown);
if (process.argv.includes('--write')) {
  const out = path.join(root, 'docs/benchmarks/latest.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, markdown + '\n');
  console.log(`\nWrote ${out}`);
}
