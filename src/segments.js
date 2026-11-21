import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const MANIFEST_VERSION = 2;

export function referencedAssets(state) {
  const refs = new Set();
  for (const scene of state.scenes ?? []) {
    for (const match of String(scene.html ?? '').matchAll(/\{\{ASSET:([^}]+)\}\}/g)) {
      refs.add(match[1].trim());
    }
  }
  return [...refs].sort();
}

export function assetFileHashes(state, assetsDir) {
  const hashes = {};
  if (!assetsDir) return hashes;
  const root = path.resolve(assetsDir);
  for (const ref of referencedAssets(state)) {
    const safe = String(ref).replace(/\\/g, '/').replace(/^\/+/, '');
    if (safe.includes('..')) continue;
    const file = path.resolve(root, safe);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) continue;
    hashes[ref] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  return hashes;
}

export function sceneDigest(state, assetsDir) {
  const canonical = {
    aspect: state.aspect,
    brand: state.brand ?? {},
    components: state.components ?? {},
    scenes: (state.scenes ?? []).map((scene) => ({
      id: scene.id, name: scene.name,
      durationSec: scene.durationSec, html: scene.html
    })),
    assets: assetFileHashes(state, assetsDir)
  };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function checkpointDirFor(outPath, override) {
  return path.resolve(override || `${outPath}.segments`);
}

export function manifestPath(dir) {
  return path.join(dir, 'resume.json');
}

export function segmentPath(dir, index) {
  return path.join(dir, `segment-${String(index).padStart(6, '0')}.ts`);
}

export function listPath(dir) {
  return path.join(dir, 'concat.txt');
}

export function emptyManifest(meta) {
  return {
    version: MANIFEST_VERSION,
    ...meta,
    segments: [],
    finalized: false
  };
}

export function readManifest(dir) {
  const file = manifestPath(dir);
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const valid = parsed && parsed.version === MANIFEST_VERSION &&
      Array.isArray(parsed.segments) &&
      Number.isFinite(parsed.fps) && Number.isFinite(parsed.totalFrames) &&
      Number.isFinite(parsed.segmentSize);
    return valid ? parsed : null;
  } catch { return null; }
}

export function writeManifest(dir, manifest) {
  fs.mkdirSync(dir, { recursive: true });
  const file = manifestPath(dir);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2));
  fs.renameSync(tmp, file);
}

export function clearCheckpoint(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

export function segmentComplete(dir, entry) {
  if (!entry) return false;
  const file = segmentPath(dir, entry.index);
  if (!fs.existsSync(file)) return false;
  return fs.statSync(file).size === entry.bytes;
}

export function completedIndices(manifest, dir) {
  if (!manifest) return new Set();
  return new Set(manifest.segments.filter((entry) => segmentComplete(dir, entry)).map((entry) => entry.index));
}

export function planSegments(totalFrames, segmentSize) {
  const count = Math.max(1, Math.ceil(totalFrames / segmentSize));
  return Array.from({ length: count }, (_, index) => ({
    index,
    start: index * segmentSize,
    count: Math.min(segmentSize, totalFrames - index * segmentSize)
  }));
}

export function fileDigest(file) {
  if (!file || !fs.existsSync(file)) return null;
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function manifestCompatible(manifest, meta) {
  if (!manifest || manifest.version !== MANIFEST_VERSION || manifest.finalized) return false;
  if (manifest.digest && meta.digest && manifest.digest !== meta.digest) return false;
  return manifest.fps === meta.fps &&
    manifest.resolution === meta.resolution &&
    manifest.totalFrames === meta.totalFrames &&
    manifest.segmentSize === meta.segmentSize &&
    (manifest.audio ?? null) === (meta.audio ?? null) &&
    (manifest.audioDigest ?? null) === (meta.audioDigest ?? null);
}

export function writeConcatList(dir, segments) {
  const file = listPath(dir);
  fs.writeFileSync(file, segments.map((s) => `file '${segmentPath(dir, s.index)}'`).join('\n') + '\n');
  return file;
}
