import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRoughHelpers } from '../src/rough.js';
import { injectSceneHtml } from '../src/inject.js';

const rough = loadRoughHelpers();

test('rough helpers are deterministic and produce inline SVG', () => {
  const a = rough.rect(20, 30, 200, 100, { stroke: '#111111' });
  const b = rough.rect(20, 30, 200, 100, { stroke: '#111111' });
  assert.equal(a, b);
  assert.ok(a.startsWith('<svg class="om-rough-svg"'));
  assert.ok((a.match(/<path/g) || []).length >= 8);
  assert.ok(a.includes('#111111'));
  assert.notEqual(a, rough.rect(20, 30, 200, 100, { stroke: '#111111', seed: 7 }));
});

test('line, ellipse and polygon are supported', () => {
  assert.ok(rough.line(0, 0, 100, 50).includes('<path'));
  assert.ok(rough.ellipse(100, 100, 80, 40).includes('<path'));
  assert.ok(rough.polygon([[0, 0], [50, 0], [25, 50]]).includes('<path'));
});

test('ROUGH token injects the local runtime', () => {
  const out = injectSceneHtml('<div>{{ROUGH}}</div>', { width: 100, height: 100 });
  assert.ok(out.includes('data-om-rough-runtime'));
  assert.ok(out.includes('window.OMRough'));
  assert.ok(!out.includes('{{ROUGH}}'));
});
