import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderFrames } from '../src/render.js';
import { diffPng } from '../src/diff.js';
import { GOLDEN_HTML, GOLDEN_TIMES, ROUGH_HTML, ROUGH_TIMES, FX_HTML, FX_TIMES, SHADERS_HTML, SHADERS_TIMES } from './fixtures/golden-scene.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.join(dir, 'fixtures/golden');
const enabled = process.env.TRUEMOTION_GOLDEN === '1';

test('golden frames match the pinned render', { skip: !enabled && 'set TRUEMOTION_GOLDEN=1' }, async () => {
  const sets = [
    { prefix: 'frame', html: GOLDEN_HTML, times: GOLDEN_TIMES },
    { prefix: 'rough', html: ROUGH_HTML, times: ROUGH_TIMES },
    { prefix: 'fx', html: FX_HTML, times: FX_TIMES },
    { prefix: 'shaders', html: SHADERS_HTML, times: SHADERS_TIMES }
  ];
  for (const set of sets) {
    const frames = await renderFrames(set.html, {
      aspect: '16:9', resolution: '540p', timesSec: set.times
    });
    for (const [index, frame] of frames.entries()) {
      const file = path.join(goldenDir, `${set.prefix}-${index}.png`);
      assert.ok(fs.existsSync(file), `missing golden frame ${file}; run npm run goldens`);
      const diff = diffPng(Buffer.from(frame.base64Png, 'base64'), fs.readFileSync(file), { threshold: 12 });
      assert.ok(diff.changedRatio < 0.01,
        `${set.prefix} frame ${index} differs by ${(diff.changedRatio * 100).toFixed(2)}% of pixels`);
      assert.ok(diff.meanAbs < 0.01,
        `${set.prefix} frame ${index} mean absolute difference ${diff.meanAbs.toFixed(4)}`);
    }
  }
});
