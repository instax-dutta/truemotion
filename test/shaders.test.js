import test from 'node:test';
import assert from 'node:assert/strict';
import { loadShadersHelpers } from '../src/shaders.js';
import { injectSceneHtml } from '../src/inject.js';

function fakeDocument(target) {
  const head = { children: [], appendChild(child) { this.children.push(child); } };
  return {
    head,
    querySelector: () => target,
    getElementById: () => null,
    createElement: () => ({ style: {}, children: [], setAttribute() {}, appendChild() {} })
  };
}

test('shader utilities write CSS and inject the class stylesheet', () => {
  const documentStub = fakeDocument({ style: {} });
  const shaders = loadShadersHelpers(documentStub);
  assert.equal(documentStub.head.children.length, 1);
  assert.ok(documentStub.head.children[0].textContent.includes('.om-glass'));

  const target = { style: {}, children: [], appendChild(child) { this.children.push(child); } };
  shaders.translucent(target, '#4D90FF', 0.35);
  assert.equal(target.style.background, 'rgba(77,144,255,0.35)');

  const glass = { style: {} };
  shaders.glass(glass, { blur: 8 });
  assert.equal(glass.style.backdropFilter, 'blur(8px)');

  const text = { style: {} };
  shaders.aberration(text, 3);
  assert.ok(text.style.textShadow.includes('3px 0'));

  const container = { style: {}, children: [], appendChild(child) { this.children.push(child); } };
  const vignette = shaders.vignette(container);
  assert.equal(container.children.length, 1);
  assert.ok(vignette.style.background.includes('radial-gradient'));
});

test('SHADERS token injects the local CSS runtime', () => {
  const out = injectSceneHtml('<div>{{SHADERS}}</div>', { width: 100, height: 100 });
  assert.ok(out.includes('data-om-shaders-runtime'));
  assert.ok(out.includes('window.OMShaders'));
  assert.ok(!out.includes('{{SHADERS}}'));
});
