import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { PNG } from 'pngjs';
import { pngHasAlpha, isOptimizable, optimizeAsset } from '../src/assets.js';

function headerWithColorType(colorType) {
  const buffer = Buffer.alloc(26);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer);
  buffer.writeUInt8(colorType, 25);
  return buffer;
}

test('PNG colour type decides alpha detection', () => {
  assert.equal(pngHasAlpha(headerWithColorType(2)), false);
  assert.equal(pngHasAlpha(headerWithColorType(0)), false);
  assert.equal(pngHasAlpha(headerWithColorType(6)), true);
  assert.equal(pngHasAlpha(headerWithColorType(4)), true);
  assert.equal(isOptimizable('a.PNG'), true);
  assert.equal(isOptimizable('a.webp'), false);
});

const ffmpegAvailable = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).status === 0;

test('optimizer downscales a local PNG without changing its extension', { skip: !ffmpegAvailable && 'ffmpeg not installed' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-assets-'));
  const input = path.join(dir, 'sample.png');
  const png = new PNG({ width: 2000, height: 2000 });
  const bytes = png.data;
  for (let i = 0; i < bytes.length; i += 4) {
    bytes[i] = (i * 7) % 256;
    bytes[i + 1] = (i * 13) % 256;
    bytes[i + 2] = (i * 29) % 256;
    bytes[i + 3] = 255;
  }
  fs.writeFileSync(input, PNG.sync.write(png));
  const before = fs.statSync(input).size;
  const result = optimizeAsset(input, null, { maxDimension: 1000 });
  assert.ok(result, 'expected a smaller asset');
  assert.equal(result.mime, 'image/png');
  assert.equal(result.alpha, true); // PNGJS writes an RGBA colour type even when alpha bytes are opaque
  assert.ok(result.after < before);
  assert.ok(result.output.endsWith('.optimized.png'));
  const written = PNG.sync.read(fs.readFileSync(result.output));
  assert.equal(written.width, 1000);
  assert.equal(written.height, 1000);
  fs.rmSync(dir, { recursive: true, force: true });
});
