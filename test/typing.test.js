import test from 'node:test';
import assert from 'node:assert/strict';
import { TYPING_SHIM } from '../src/inject.js';

const source = TYPING_SHIM.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');

function loadRuntime(nodes = {}) {
  const window = {};
  const document = { querySelector: (selector) => nodes[selector] ?? null };
  new Function('window', 'document', source)(window, document);
  return window;
}

function fakeTimeline() {
  const sets = [];
  const tweens = [];
  const tl = {
    set: (target, vars, position) => { sets.push({ target, vars, position }); return tl; },
    to: (target, vars, position) => { tweens.push({ target, vars, position }); return tl; },
    seek: () => tl
  };
  return { tl, sets, tweens };
}

test('typing runtime registers a flushable write and a blinking cursor', () => {
  const window = loadRuntime();
  assert.equal(window.__OM_TYPING_RUNTIME__, true);
  const target = {
    textContent: '', attrs: {},
    setAttribute(key, value) { this.attrs[key] = value; },
    closest: () => null
  };
  const row = { textContent: '' };
  const cursor = {};
  const { tl, sets, tweens } = fakeTimeline();

  const proxy = window.OMTyping.attach({
    timeline: tl, target, row, cursor, text: 'Hello world', start: 0.5, duration: 2
  });

  assert.equal(target.attrs['data-om-typed'], '');
  assert.equal(window.OMTyping._writes.length, 1);
  assert.ok(sets.some((entry) => entry.target === target && entry.vars.opacity === 1));
  assert.ok(sets.some((entry) => entry.target === row && entry.vars.overflow === 'visible'));

  const proxyTween = tweens.find((entry) => entry.target === proxy);
  assert.equal(proxyTween.vars.n, 11);
  assert.equal(proxyTween.vars.lazy, false);
  assert.equal(proxyTween.position, 0.5);

  const blink = tweens.find((entry) => entry.target === cursor);
  assert.equal(blink.vars.repeat, -1);
  assert.equal(blink.vars.yoyo, true);
  assert.equal(blink.vars.ease, 'sine.inOut');
});

test('flush and seek keep text accurate at any timeline position', () => {
  const window = loadRuntime();
  const target = { textContent: '', attrs: {}, setAttribute() {}, closest: () => null };
  const { tl, tweens } = fakeTimeline();
  const proxy = window.OMTyping.attach({ timeline: tl, target, text: 'Render me', duration: 2 });
  const sync = tweens.find((entry) => entry.target === proxy).vars.onUpdate;

  proxy.n = 4; sync();
  assert.equal(target.textContent, 'Rend');
  window.OMTyping._flush();
  assert.equal(target.textContent, 'Rend');

  proxy.n = 9; window.OMTyping._flush();
  assert.equal(target.textContent, 'Render me');

  proxy.n = 2; tl.seek(0.4, false);
  assert.equal(target.textContent, 'Re');
});
