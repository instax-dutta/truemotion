import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderFrames } from '../src/render.js';
import { diffPng } from '../src/diff.js';
import { GOLDEN_HTML, GOLDEN_TIMES } from './fixtures/golden-scene.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.join(dir, 'fixtures/golden');
const enabled = process.env.TRUEMOTION_GOLDEN === '1';

test('golden frames match the pinned render', { skip: !enabled && 'set TRUEMOTION_GOLDEN=1' }, async () => {
  const frames = await renderFrames(GOLDEN_HTML, {
    aspect: '16:9', resolution: '540p', timesSec: GOLDEN_TIMES
  });
  for (const [index, frame] of frames.entries()) {
    const file = path.join(goldenDir, `frame-${index}.png`);
    assert.ok(fs.existsSync(file), `missing golden frame ${file}; run npm run goldens`);
    const diff = diffPng(Buffer.from(frame.base64Png, 'base64'), fs.readFileSync(file), { threshold: 12 });
    assert.ok(diff.changedRatio < 0.01,
      `frame ${index} differs by ${(diff.changedRatio * 100).toFixed(2)}% of pixels`);
    assert.ok(diff.meanAbs < 0.01,
      `frame ${index} mean absolute difference ${diff.meanAbs.toFixed(4)}`);
  }
});
