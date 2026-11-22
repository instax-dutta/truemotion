// Build a compact, looping highlight GIF from the launch film.
// Two-pass palette gives a small file without visible colour banding.
// Run: npm run gif:launch
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const video = path.join(root, 'examples/launch-out/launch-film.mp4');
const out = path.join(root, 'examples/launch-out/launch-film.gif');

if (!fs.existsSync(video)) {
  console.error(`Missing ${video}. Run npm run demo:launch first.`);
  process.exit(1);
}

// Highlight windows (seconds): hook payoff, tool receipts, measured feedback,
// frame count-up and the CTA. Short enough for a README, varied enough to show
// the whole authoring loop.
const windows = [
  [2.8, 4.5],
  [10, 13.2],
  [15.5, 18.5],
  [25, 27.8],
  [34.5, 37.5]
];

const trims = windows.map(([start, end], index) =>
  `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[w${index}]`
).join(';');
const labels = windows.map((_, index) => `[w${index}]`).join('');
const filter = [
  trims,
  `${labels}concat=n=${windows.length}:v=1:a=0,scale=800:-1:flags=lanczos,fps=12,split[v1][v2]`,
  '[v1]palettegen=stats_mode=diff[p]',
  '[v2][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle'
].join(';');

const result = spawnSync('ffmpeg', [
  '-y', '-i', video, '-filter_complex', filter, '-loop', '0', out, '-loglevel', 'error'
], { encoding: 'utf8' });

if (result.status !== 0) {
  console.error(result.stderr || 'ffmpeg failed');
  process.exit(1);
}
const kib = Math.round(fs.statSync(out).size / 1024);
console.log(`Wrote ${out} (${kib} KiB, ${windows.length} highlights, 800px, 12 fps, looping)`);
