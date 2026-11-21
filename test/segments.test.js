import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  manifestPath, segmentPath, emptyManifest, writeManifest, readManifest,
  clearCheckpoint, completedIndices, planSegments, manifestCompatible, writeConcatList,
  sceneDigest, MANIFEST_VERSION, referencedAssets, assetFileHashes, fileDigest,
  segmentComplete, assertUniqueSegments
} from '../src/segments.js';

const sampleState = {
  aspect: '16:9',
  brand: { primary: '#F5A524' },
  components: {},
  scenes: [{ id: 'a', name: 'A', durationSec: 4, html: '<html></html>' }]
};
const meta = {
  fps: 30, resolution: '1080p', totalFrames: 100,
  segmentSize: 40, audio: null, digest: sceneDigest(sampleState)
};

test('segment planning covers every frame exactly once', () => {
  const segments = planSegments(100, 40);
  assert.deepEqual(segments.map((s) => s.count), [40, 40, 20]);
  assert.equal(segments.reduce((sum, s) => sum + s.count, 0), 100);
  assert.deepEqual(segments.map((s) => s.start), [0, 40, 80]);
});

test('manifest persists atomically and detects complete segments by size', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-segments-'));
  const manifest = emptyManifest(meta);
  manifest.segments.push({ index: 0, start: 0, count: 40, bytes: 9 });
  writeManifest(dir, manifest);
  assert.ok(fs.existsSync(manifestPath(dir)));
  assert.equal(readManifest(dir).segments.length, 1);

  fs.writeFileSync(segmentPath(dir, 0), '123456789');
  assert.deepEqual([...completedIndices(readManifest(dir), dir)], [0]);

  fs.writeFileSync(segmentPath(dir, 0), 'short');
  assert.deepEqual([...completedIndices(readManifest(dir), dir)], []);
  clearCheckpoint(dir);
  assert.ok(!fs.existsSync(dir));
});

test('corrupt or structurally invalid manifests are treated as absent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-bad-manifest-'));
  assert.equal(readManifest(dir), null);
  fs.writeFileSync(manifestPath(dir), '{ truncated json');
  assert.equal(readManifest(dir), null);
  fs.writeFileSync(manifestPath(dir), '{}');
  assert.equal(readManifest(dir), null);
  fs.writeFileSync(manifestPath(dir), JSON.stringify({ ...emptyManifest(meta), segments: 'nope' }));
  assert.equal(readManifest(dir), null);

  const good = emptyManifest(meta);
  good.segments.push({ index: 0, start: 0, count: 40, bytes: 9 });
  writeManifest(dir, good);
  assert.ok(readManifest(dir));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('same-size segment corruption is detected by digest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-segment-digest-'));
  const manifest = emptyManifest(meta);
  const file = segmentPath(dir, 0);
  fs.writeFileSync(file, '123456789');
  const entry = { index: 0, start: 0, count: 40, bytes: 9, digest: fileDigest(file) };
  manifest.segments.push(entry);
  assert.ok(segmentComplete(dir, entry));

  // Same length, different bytes: size-only checks would pass.
  fs.writeFileSync(file, '987654321');
  assert.equal(fs.statSync(file).size, entry.bytes);
  assert.ok(!segmentComplete(dir, entry), 'same-size corruption must be detected');
  assert.deepEqual([...completedIndices(manifest, dir)], []);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('orphan segment files not in the manifest are ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-orphan-'));
  const manifest = emptyManifest(meta);
  manifest.segments.push({ index: 0, start: 0, count: 40, bytes: 9 });
  writeManifest(dir, manifest);
  fs.writeFileSync(segmentPath(dir, 0), '123456789');
  fs.writeFileSync(segmentPath(dir, 1), 'partial orphan');
  const done = completedIndices(readManifest(dir), dir);
  assert.deepEqual([...done], [0], 'orphan index 1 must not be considered complete');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('manifest compatibility rejects changed render settings', () => {
  const manifest = { ...emptyManifest(meta), finalized: false };
  assert.ok(manifestCompatible(manifest, meta));
  assert.ok(!manifestCompatible(manifest, { ...meta, fps: 24 }));
  assert.ok(!manifestCompatible(manifest, { ...meta, totalFrames: 99 }));
  assert.ok(!manifestCompatible({ ...manifest, finalized: true }, meta));
});

test('brand changes alter the scene digest', () => {
  const base = { ...sampleState, scenes: sampleState.scenes };
  const changed = { ...base, brand: { ...base.brand, primary: '#FF0000' } };
  assert.notEqual(sceneDigest(base), sceneDigest(changed));
  const manifest = { ...emptyManifest({ ...meta, digest: sceneDigest(base) }), finalized: false };
  assert.ok(!manifestCompatible(manifest, { ...meta, digest: sceneDigest(changed) }));
});

test('scene digest is order sensitive', () => {
  const a = { id: 'a', name: 'A', durationSec: 4, html: '<html>A</html>' };
  const b = { id: 'b', name: 'B', durationSec: 4, html: '<html>B</html>' };
  const forward = { ...sampleState, scenes: [a, b] };
  const reversed = { ...sampleState, scenes: [b, a] };
  assert.notEqual(sceneDigest(forward), sceneDigest(reversed));
  assert.equal(sceneDigest(forward), sceneDigest(structuredClone(forward)));
});

test('audio path and content changes reject a resume', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-audio-digest-'));
  const bedA = path.join(dir, 'a.m4a');
  const bedB = path.join(dir, 'b.m4a');
  fs.writeFileSync(bedA, 'audio A');
  fs.writeFileSync(bedB, 'audio B');
  const base = { ...meta, audio: bedA, audioDigest: fileDigest(bedA) };
  const manifest = { ...emptyManifest(base), finalized: false };

  assert.ok(manifestCompatible(manifest, base));
  assert.ok(!manifestCompatible(manifest, { ...base, audio: bedB, audioDigest: fileDigest(bedB) }),
    'a different audio path must be rejected');
  assert.ok(!manifestCompatible(manifest, { ...base, audioDigest: fileDigest(bedB) }),
    'different audio content at the same path must be rejected');
  assert.equal(fileDigest(bedA), fileDigest(bedA));
  assert.notEqual(fileDigest(bedA), fileDigest(bedB));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('scene digest rejects state changes between checkpoint and resume', () => {
  assert.equal(MANIFEST_VERSION, 2);
  const digest = sceneDigest(sampleState);
  assert.equal(digest, sceneDigest(structuredClone(sampleState)));

  const changedHtml = { ...sampleState, scenes: [{ ...sampleState.scenes[0], html: '<html>changed</html>' }] };
  const changedBrand = { ...sampleState, brand: { primary: '#000000' } };
  const changedComponents = { ...sampleState, components: { button: '<b>x</b>' } };
  const changedDuration = { ...sampleState, scenes: [{ ...sampleState.scenes[0], durationSec: 5 }] };
  assert.notEqual(digest, sceneDigest(changedHtml));
  assert.notEqual(digest, sceneDigest(changedBrand));
  assert.notEqual(digest, sceneDigest(changedComponents));
  assert.notEqual(digest, sceneDigest(changedDuration));

  const manifest = { ...emptyManifest(meta), finalized: false };
  assert.ok(manifestCompatible(manifest, { ...meta, digest }));
  assert.ok(!manifestCompatible(manifest, { ...meta, digest: sceneDigest(changedHtml) }));
});

test('asset contents are hashed into the digest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-assets-digest-'));
  fs.writeFileSync(path.join(dir, 'logo.png'), 'original bytes');
  const state = {
    ...sampleState,
    scenes: [{ ...sampleState.scenes[0], html: '<img src="{{ASSET:logo.png}}">' }]
  };
  assert.deepEqual(referencedAssets(state), ['logo.png']);
  const before = sceneDigest(state, dir);
  assert.ok(assetFileHashes(state, dir)['logo.png']);

  fs.writeFileSync(path.join(dir, 'logo.png'), 'modified bytes');
  assert.notEqual(sceneDigest(state, dir), before, 'editing an asset must change the digest');
  const manifest = { ...emptyManifest(meta), finalized: false, digest: before };
  assert.ok(!manifestCompatible(manifest, { ...meta, digest: sceneDigest(state, dir) }));

  // Traversal attempts are ignored rather than hashed.
  const escaping = { ...state, scenes: [{ ...state.scenes[0], html: '<img src="{{ASSET:../secret.png}}">' }] };
  assert.deepEqual(assetFileHashes(escaping, dir), {});
  fs.rmSync(dir, { recursive: true, force: true });
});

test('duplicate segment indices are rejected before concatenation', () => {
  const segments = [
    { index: 0, start: 0, count: 20 },
    { index: 0, start: 0, count: 20 }
  ];
  assert.throws(() => assertUniqueSegments(segments), /Duplicate segment indices/);
  assert.equal(assertUniqueSegments([segments[0], { index: 1, start: 20, count: 20 }]).length, 2);
});

test('concat list references each completed segment', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-segments-'));
  const list = writeConcatList(dir, planSegments(80, 40));
  const content = fs.readFileSync(list, 'utf8');
  assert.ok(content.includes(segmentPath(dir, 0)));
  assert.ok(content.includes(segmentPath(dir, 1)));
  fs.rmSync(dir, { recursive: true, force: true });
});
