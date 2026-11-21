import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  manifestPath, segmentPath, emptyManifest, writeManifest, readManifest,
  clearCheckpoint, completedIndices, planSegments, manifestCompatible, writeConcatList
} from '../src/segments.js';

const meta = { fps: 30, resolution: '1080p', totalFrames: 100, segmentSize: 40, audio: null };

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

test('manifest compatibility rejects changed render settings', () => {
  const manifest = { ...emptyManifest(meta), finalized: false };
  assert.ok(manifestCompatible(manifest, meta));
  assert.ok(!manifestCompatible(manifest, { ...meta, fps: 24 }));
  assert.ok(!manifestCompatible(manifest, { ...meta, totalFrames: 99 }));
  assert.ok(!manifestCompatible({ ...manifest, finalized: true }, meta));
});

test('concat list references each completed segment', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-segments-'));
  const list = writeConcatList(dir, planSegments(80, 40));
  const content = fs.readFileSync(list, 'utf8');
  assert.ok(content.includes(segmentPath(dir, 0)));
  assert.ok(content.includes(segmentPath(dir, 1)));
  fs.rmSync(dir, { recursive: true, force: true });
});
