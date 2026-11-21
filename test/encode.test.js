import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { spawnSync } from 'node:child_process';
import { buildEncoderArgs, createEncoder } from '../src/encode.js';

const ffmpegAvailable = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).status === 0;

test('encoder args use image2pipe and fade audio to the video length', () => {
  const args = buildEncoderArgs({ fps: 24, crf: 17, outPath: '/tmp/x.mp4', totalSeconds: 10 });
  assert.deepEqual(args.slice(0, 7), ['-y', '-f', 'image2pipe', '-framerate', '24', '-i', 'pipe:0']);
  assert.ok(args.includes('-crf'));
  assert.ok(args.includes('17'));
  assert.ok(args.at(-1).endsWith('x.mp4'));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-encode-'));
  const audio = path.join(dir, 'a.wav');
  fs.writeFileSync(audio, 'x');
  const withAudio = buildEncoderArgs({ fps: 24, audio, crf: 18, outPath: '/tmp/x.mp4', totalSeconds: 12 });
  assert.ok(withAudio.some((arg) => arg.includes('afade=t=out:st=11.4:d=0.6')));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('encoder streams PNG frames into a playable MP4', { skip: !ffmpegAvailable && 'ffmpeg not installed' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-encode-'));
  const out = path.join(dir, 'out.mp4');
  const encoder = createEncoder({ fps: 10, crf: 23, outPath: out, totalSeconds: 0.3 });
  assert.ok(encoder.args.includes('pipe:0'));
  for (let i = 0; i < 3; i += 1) {
    const png = new PNG({ width: 64, height: 64 });
    png.data.fill(i * 80);
    for (let p = 3; p < png.data.length; p += 4) png.data[p] = 255;
    await encoder.write(PNG.sync.write(png));
  }
  const result = await encoder.finish();
  assert.equal(result.code, 0);
  const bytes = fs.statSync(out).size;
  assert.ok(bytes > 0);
  fs.rmSync(dir, { recursive: true, force: true });
});
