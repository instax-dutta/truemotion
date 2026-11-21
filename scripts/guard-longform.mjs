// CI performance/memory regression guard for the 1200-frame long-form render.
// Reads the JSON block produced by scripts/longform-benchmark.mjs and checks
// documented thresholds. Override with env vars when a runner is calibrated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportArg = process.env.LF_REPORT || 'docs/benchmarks/longform.md';
const report = path.isAbsolute(reportArg) ? reportArg : path.join(root, reportArg);

const thresholds = {
  minFrames: Number(process.env.GUARD_MIN_FRAMES || 1200),
  minFps: Number(process.env.GUARD_MIN_FPS || 4),
  maxPeakRssMib: Number(process.env.GUARD_MAX_RSS_MIB || 2800),
  minOutputKib: Number(process.env.GUARD_MIN_OUTPUT_KIB || 1000),
  maxOutputKib: Number(process.env.GUARD_MAX_OUTPUT_KIB || 50000)
};

if (!fs.existsSync(report)) {
  console.error(`long-form report not found: ${report}`);
  process.exit(1);
}
const match = fs.readFileSync(report, 'utf8').match(/```json\n([\s\S]*?)\n```/);
if (!match) {
  console.error('long-form report contains no JSON block');
  process.exit(1);
}
const result = JSON.parse(match[1]);
const failures = [];

if (result.frames < thresholds.minFrames) failures.push(`frames ${result.frames} < ${thresholds.minFrames}`);
if (result.frames !== result.expectedFrames) failures.push(`frames ${result.frames} != expected ${result.expectedFrames}`);
if (result.framesPerSecond < thresholds.minFps) failures.push(`throughput ${result.framesPerSecond} fps < ${thresholds.minFps}`);
if (result.peakTreeRssMib > thresholds.maxPeakRssMib) failures.push(`peak RSS ${result.peakTreeRssMib} MiB > ${thresholds.maxPeakRssMib}`);
if (result.outputKib < thresholds.minOutputKib) failures.push(`output ${result.outputKib} KiB < ${thresholds.minOutputKib}`);
if (result.outputKib > thresholds.maxOutputKib) failures.push(`output ${result.outputKib} KiB > ${thresholds.maxOutputKib}`);

if (failures.length) {
  console.error('long-form guard FAILED:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`long-form guard PASS: ${result.frames} frames, ${result.framesPerSecond} fps, ${result.peakTreeRssMib} MiB peak RSS, ${result.outputKib} KiB output`);
