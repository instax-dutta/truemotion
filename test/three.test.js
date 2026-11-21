import test from 'node:test';
import assert from 'node:assert/strict';
import { loadThreeHelpers } from '../src/three.js';
import { injectSceneHtml } from '../src/inject.js';

function element() {
  const classes = [];
  return {
    style: {}, classes,
    classList: { add: (name) => classes.push(name) },
    setAttribute() {}
  };
}

function helpers(stage) {
  const documentStub = {
    head: { appendChild() {} },
    querySelector: () => stage,
    getElementById: () => null,
    createElement: () => element()
  };
  return loadThreeHelpers(documentStub);
}

test('CSS-3D stage creates planes and binds seek', () => {
  const stage = element();
  const om3d = helpers(stage);
  const world = om3d.create('#stage', { perspective: 900, maxRotation: 8 });
  assert.ok(stage.classes.includes('om3d-stage'));
  assert.equal(stage.style.perspective, '900px');

  const plane = element();
  world.addPlane(plane, { x: 10, y: 20, z: -120, rotationY: 15 });
  assert.ok(plane.classes.includes('om3d-plane'));
  assert.ok(plane.style.transform.includes('translate3d(10px,20px,-120px)'));
  assert.ok(plane.style.transform.includes('rotateY(15deg)'));

  let time = 0;
  const tl = { time: () => time, seek: (t) => { time = t; return tl; } };
  const frames = [];
  world.bindTimeline(tl, 4, (progress) => frames.push(progress));
  const before = stage.style.transform;
  tl.seek(1);
  assert.notEqual(stage.style.transform, before);
  assert.equal(world.state.progress, 0.25);
  assert.deepEqual(frames, [0, 0.25]);
});

test('THREE token injects the local CSS-3D runtime', () => {
  const out = injectSceneHtml('<div>{{THREE}}</div>', { width: 100, height: 100 });
  assert.ok(out.includes('data-om-three-runtime'));
  assert.ok(out.includes('window.OM3D'));
  assert.ok(!out.includes('{{THREE}}'));
});
