import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPathIdHelpers } from '../src/pathid.js';

const { omPathId, omFindElementByPathId } = loadPathIdHelpers();

function node(tagName, className = '', attrs = {}, parent = null) {
  const element = {
    tagName: tagName.toUpperCase(),
    className,
    children: [],
    parentElement: parent,
    classList: { contains: (name) => String(className).split(/\s+/).includes(name) },
    getAttribute: (name) => attrs[name] ?? null
  };
  if (parent) parent.children.push(element);
  return element;
}

function fakeFrame() {
  const frame = node('div', 'frame');
  frame.children.item = (i) => frame.children[i];
  frame.querySelectorAll = (selector) => {
    if (selector !== '[data-om-id]') return [];
    const found = [];
    const walk = (el) => {
      for (const child of el.children) {
        if (child.getAttribute('data-om-id')) found.push(child);
        walk(child);
      }
    };
    walk(frame);
    return found;
  };
  return frame;
}

test('explicit data-om-id wins over a generated path', () => {
  const frame = fakeFrame();
  const heading = node('h1', '', { 'data-om-id': 'headline' }, frame);
  assert.equal(omPathId(heading), 'headline');
  assert.equal(omFindElementByPathId(frame, 'headline'), heading);
});

test('unlabelled elements get a stable DOM path and can be found again', () => {
  const frame = fakeFrame();
  const card = node('div', 'card wide', {}, frame);
  const heading = node('h1', '', {}, card);
  const path = omPathId(heading);
  assert.equal(path, 'om/div.card@0/h1@0');
  assert.equal(omFindElementByPathId(frame, path), heading);
});

test('wrong paths and empty ids resolve to null', () => {
  const frame = fakeFrame();
  assert.equal(omFindElementByPathId(frame, ''), null);
  assert.equal(omFindElementByPathId(frame, 'om/div.missing@0/h1@0'), null);
  assert.equal(omFindElementByPathId(frame, 'om/h1@9'), null);
});
