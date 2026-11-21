import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_COMPONENTS, COMPONENT_CSS, resolveComponent } from '../src/components.js';
import { injectSceneHtml } from '../src/inject.js';

test('built-in components resolve and state components override them', () => {
  assert.equal(resolveComponent({}, 'button'), BUILTIN_COMPONENTS.button);
  assert.equal(resolveComponent({ button: '<b>custom</b>' }, 'button'), '<b>custom</b>');
  assert.equal(resolveComponent({}, 'not-a-component'), '');
  assert.equal(resolveComponent({}, '../escape'), '');
  assert.equal(resolveComponent({}, ''), '');
});

test('component stylesheet is injected with tokens expanded', () => {
  const out = injectSceneHtml('<div>{{COMPONENT:button}}{{COMPONENT:pill}}</div>', {
    width: 100, height: 100
  });
  assert.ok(out.includes('data-om-id="cta"'));
  assert.ok(out.includes('data-om-id="pill"'));
  assert.ok(out.includes(COMPONENT_CSS));
  assert.ok(!out.includes('{{COMPONENT:button}}'));
});
