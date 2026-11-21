// Regenerate golden render fixtures with the browser version pinned by
// playwright-core in package-lock.json. Run: npm run goldens
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { renderFrames } from '../src/render.js';
import { GOLDEN_HTML, GOLDEN_TIMES, ROUGH_HTML, ROUGH_TIMES, FX_HTML, FX_TIMES, SHADERS_HTML, SHADERS_TIMES, BRAND_HTML, BRAND_TIMES, BRAND, COMPONENT_HTML, COMPONENT_TIMES, THREE_HTML, THREE_TIMES, COMBINED_GOLDEN_TIMES, COMBINED_GOLDEN_BRAND } from '../test/fixtures/golden-scene.mjs';
import { COMBINED_HTML } from '../examples/combined-scene.mjs';

const require = createRequire(import.meta.url);
process.env.TRUEMOTION_CHROME = require('playwright-core').chromium.executablePath();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'test/fixtures/golden');
fs.mkdirSync(outDir, { recursive: true });

const sets = [
  { prefix: 'frame', html: GOLDEN_HTML, times: GOLDEN_TIMES },
  { prefix: 'rough', html: ROUGH_HTML, times: ROUGH_TIMES },
  { prefix: 'fx', html: FX_HTML, times: FX_TIMES },
  { prefix: 'shaders', html: SHADERS_HTML, times: SHADERS_TIMES },
  { prefix: 'brand', html: BRAND_HTML, times: BRAND_TIMES, brand: BRAND },
  { prefix: 'component', html: COMPONENT_HTML, times: COMPONENT_TIMES },
  { prefix: 'three', html: THREE_HTML, times: THREE_TIMES },
  { prefix: 'combined', html: COMBINED_HTML, times: COMBINED_GOLDEN_TIMES, brand: COMBINED_GOLDEN_BRAND }
];

for (const set of sets) {
  const frames = await renderFrames(set.html, {
    aspect: '16:9', resolution: '540p', timesSec: set.times, brand: set.brand
  });
  for (const [index, frame] of frames.entries()) {
    const buffer = Buffer.from(frame.base64Png, 'base64');
    const file = path.join(outDir, `${set.prefix}-${index}.png`);
    fs.writeFileSync(file, buffer);
    console.log(`${path.basename(file)} ${createHash('sha256').update(buffer).digest('hex').slice(0, 16)} ${buffer.length} bytes`);
  }
}
