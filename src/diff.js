import { PNG } from 'pngjs';

const toBuffer = (value) => (Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64'));

export function diffPng(a, b, { threshold = 12, stride = 4 } = {}) {
  const first = PNG.sync.read(toBuffer(a));
  const second = PNG.sync.read(toBuffer(b));
  if (first.width !== second.width || first.height !== second.height) {
    return { changedRatio: 1, meanAbs: 1 };
  }
  const { width, height } = first;
  let changed = 0;
  let total = 0;
  let absSum = 0;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      let maxDiff = 0;
      for (let c = 0; c < 3; c += 1) {
        const d = Math.abs(first.data[i + c] - second.data[i + c]);
        if (d > maxDiff) maxDiff = d;
        absSum += d;
      }
      if (maxDiff > threshold) changed += 1;
      total += 1;
    }
  }
  return {
    changedRatio: total ? changed / total : 0,
    meanAbs: total ? absSum / (total * 3) / 255 : 0
  };
}

export function percent(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}
