import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function pngHasAlpha(buffer) {
  if (buffer.length < 26 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return true;
  const colorType = buffer.readUInt8(25);
  return !(colorType === 0 || colorType === 2);
}

export function isOptimizable(file) {
  return /\.(png|jpe?g)$/i.test(file);
}

export function optimizeAsset(input, output, { maxDimension = 2200, quality = 4 } = {}) {
  if (!isOptimizable(input)) return null;
  if (!fs.existsSync(input)) throw new Error(`Asset not found: ${input}`);
  const original = fs.readFileSync(input);
  const isPng = /\.png$/i.test(input);
  // Keep the existing extension so {{ASSET:...}} references stay valid.
  const canBeJpeg = !isPng;
  const hasAlpha = isPng ? pngHasAlpha(original) : false;
  const extension = canBeJpeg ? '.jpg' : '.png';
  const target = output || `${input}.optimized${extension}`;

  const scale = `scale='if(gt(max(iw,ih),${maxDimension}),floor(${maxDimension}*iw/max(iw,ih)),iw)':-2:flags=lanczos`;
  const args = ['-y', '-i', input, '-vf', scale];
  if (canBeJpeg) args.push('-q:v', String(quality));
  else args.push('-compression_level', '9');
  args.push(target);

  const result = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    if (fs.existsSync(target)) fs.unlinkSync(target);
    throw new Error(`ffmpeg failed for ${input}: ${(result.stderr || '').slice(-400)}`);
  }
  if (!fs.existsSync(target)) return null;
  const after = fs.statSync(target).size;
  if (after >= original.length) {
    fs.unlinkSync(target);
    return null;
  }
  return {
    input: path.resolve(input),
    output: path.resolve(target),
    before: original.length,
    after,
    alpha: hasAlpha,
    mime: canBeJpeg ? 'image/jpeg' : 'image/png'
  };
}

export function optimizeAssetsInDir(directory, { maxDimension = 2200, minBytes = 900 * 1024 } = {}) {
  if (!fs.existsSync(directory)) throw new Error(`Assets directory not found: ${directory}`);
  const results = [];
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!isOptimizable(entry.name)) continue;
      if (fs.statSync(full).size <= minBytes) continue;
      const temp = `${full}.tm-${process.pid}${path.extname(full).toLowerCase() === '.png' ? '.png' : '.jpg'}`;
      const optimized = optimizeAsset(full, temp, { maxDimension });
      if (optimized) {
        fs.renameSync(temp, full);
        results.push({ ...optimized, output: full });
      } else if (fs.existsSync(temp)) {
        fs.unlinkSync(temp);
      }
    }
  };
  walk(directory);
  return results;
}
