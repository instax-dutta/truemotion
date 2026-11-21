import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFxHelpers } from '../src/fx.js';
import { injectSceneHtml } from '../src/inject.js';

function element() {
  return {
    style: {}, children: [],
    setAttribute(key, value) { this[key] = value; },
    appendChild(child) { this.children.push(child); return child; }
  };
}

function helpers(target) {
  const documentStub = {
    querySelector: () => target,
    createElement: () => element()
  };
  return loadFxHelpers(documentStub);
}

test('outline, glow and aberration write deterministic inline styles', () => {
  const fx = helpers(element());
  const outline = element();
  fx.outline(outline, '#F5A524', 4);
  assert.equal(outline.style.boxShadow, '0 0 0 4px #F5A524');

  const glow = element();
  fx.glow(glow, '#4D90FF', 60);
  assert.ok(glow.style.backgroundImage.includes('radial-gradient'));
  assert.ok(glow.style.backgroundImage.includes('rgba(77,144,255,0.28)'));

  const text = element();
  fx.aberration(text, 3);
  assert.ok(text.style.textShadow.includes('3px 0'));
  assert.ok(text.style.textShadow.includes('-3px 0'));
});

test('scanlines appends a hard-stop gradient overlay', () => {
  const fx = helpers(element());
  const container = element();
  const layer = fx.scanlines(container, { size: 4, opacity: 0.2 });
  assert.equal(container.children.length, 1);
  assert.equal(layer['data-om-fx'], 'scanlines');
  assert.ok(layer.style.background.includes('repeating-linear-gradient'));
  assert.ok(layer.style.background.includes('rgba(0,0,0,0.2)'));
});

test('FX token injects the local runtime', () => {
  const out = injectSceneHtml('<div>{{FX}}</div>', { width: 100, height: 100 });
  assert.ok(out.includes('data-om-fx-runtime'));
  assert.ok(out.includes('window.OMFX'));
  assert.ok(!out.includes('{{FX}}'));
});
