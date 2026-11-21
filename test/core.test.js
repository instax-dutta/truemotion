import test from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { diffPng } from '../src/diff.js';
import { createState, addScene, patchScene, dimensions, findScene } from '../src/state.js';
import { validateSceneHtml, evolveWarnings } from '../src/validate.js';
import { skillPath, listSkillFiles } from '../src/skill.js';
import { injectSceneHtml } from '../src/inject.js';
import { chunkTimes, selectFrames } from '../src/render.js';
import { makeContactSheet } from '../src/sheet.js';

const MINIMAL = `<!doctype html><html><head><style>/* {{FONTS_CSS}} */ .frame{width:{{W}}px;height:{{H}}px;background:#000}</style></head>
<body><div class="frame" id="frame"><h1 data-om-id="headline">Hi</h1></div>
<!-- {{GSAP}} -->
<script>const tl=gsap.timeline({paused:true});tl.fromTo('h1',{opacity:0},{opacity:1,duration:1});window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=2;</script></body></html>`;

test('dimensions cover the three aspects', () => {
  assert.deepEqual(dimensions('16:9'), [1920, 1080]);
  assert.deepEqual(dimensions('9:16'), [1080, 1920]);
  assert.deepEqual(dimensions('1:1'), [1080, 1080]);
});

test('resolution scales dimensions and rejects unknown values', () => {
  assert.deepEqual(dimensions('16:9', '720p'), [1280, 720]);
  assert.deepEqual(dimensions('16:9', '540p'), [960, 540]);
  assert.deepEqual(dimensions('9:16', '540p'), [540, 960]);
  assert.throws(() => dimensions('16:9', '4k'), /Unknown resolution/);
  assert.equal(createState().resolution, '1080p');
});

test('valid scene contract passes and broken ones fail', () => {
  assert.equal(validateSceneHtml(MINIMAL).ok, true);
  assert.equal(validateSceneHtml('').ok, false);
  assert.equal(validateSceneHtml('<div>no timeline</div>').ok, false);
  const badFont = MINIMAL.replace('.frame{', '.frame{font-family:Inter;');
  assert.equal(validateSceneHtml(badFont).ok, false);
  assert.equal(validateSceneHtml(MINIMAL.replace('tl.fromTo', 'tl.from')).ok, false);
  assert.equal(validateSceneHtml(MINIMAL.replace('</head>', '<script src="https://x/y.js"></script></head>')).ok, false);
  assert.equal(validateSceneHtml(MINIMAL.replace('.frame{', '.frame{transition:opacity 1s;')).ok, false);
});

test('state add and patch keep scenes consistent', () => {
  const s = createState();
  const scene = addScene(s, { name: 'A', durationSec: 2, html: MINIMAL });
  assert.equal(s.scenes.length, 1);
  assert.equal(patchScene(s, 'missing', [{ find: 'x', replace: 'y' }]).error.includes('not found'), true);
  assert.equal(patchScene(s, scene.id, [{ find: 'ZZUNIQUEZZ', replace: 'y' }]).error.includes('not found'), true);
  const ok = patchScene(s, scene.id, [{ find: '>Hi<', replace: '>Hello<' }]);
  assert.ok(ok.html.includes('>Hello<'));
  assert.ok(scene.html.includes('>Hi<'));
});

test('chunkTimes distributes frames without gaps or duplicates', () => {
  const groups = chunkTimes(10, 3);
  assert.deepEqual(groups.map((g) => g.length), [4, 3, 3]);
  assert.deepEqual(groups.flat().sort((a, b) => a - b), [...Array(10).keys()]);
  assert.deepEqual(chunkTimes(1, 4), [[0], [], [], []]);
});

test('selectFrames filters a global time range across scenes', () => {
  const scenes = [{ durationSec: 2 }, { durationSec: 2 }];
  const all = selectFrames(scenes, 10);
  assert.equal(all.length, 40);
  const middle = selectFrames(scenes, 10, 1.5, 2.5);
  assert.equal(middle.length, 10);
  assert.equal(middle[0].sceneIndex, 0);
  assert.equal(middle.at(-1).sceneIndex, 1);
});

test('findScene accepts id, 1-based index, or defaults to first', () => {
  const s = createState();
  const a = addScene(s, { name: 'A', durationSec: 2, html: MINIMAL });
  addScene(s, { name: 'B', durationSec: 2, html: MINIMAL });
  assert.equal(findScene(s).id, a.id);
  assert.equal(findScene(s, '2').name, 'B');
  assert.equal(findScene(s, a.id).name, 'A');
  assert.equal(findScene(s, '99'), null);
});

test('skill paths cannot escape the skill directory', () => {
  const dir = new URL('../skill/', import.meta.url).pathname;
  assert.ok(listSkillFiles(dir).includes('scene-contract.md'));
  assert.throws(() => skillPath(dir, '../package.json'));
  assert.throws(() => skillPath(dir, 'scene-contract.txt'));
});

test('injection resolves all supported tokens locally', () => {
  const out = injectSceneHtml(MINIMAL, { width: 1920, height: 1080 });
  assert.ok(out.includes('1920px'));
  assert.ok(out.includes('1080px'));
  assert.ok(out.includes('gsap'));
  assert.ok(out.includes("http-equiv=\"Content-Security-Policy\""));
  assert.ok(out.includes("connect-src 'none'"));
  assert.ok(!out.includes('{{GSAP}}'));
  assert.ok(!out.includes('{{FONTS_CSS}}'));
  assert.ok(injectSceneHtml('{{THREE}}', { width: 1, height: 1 }).includes('data-om-three-runtime'));
});

test('icon tokens resolve locally with brand and mono colours', () => {
  const out = injectSceneHtml('<img src="{{ICON:notion}}"><img src="{{ICON:notion/mono}}"><img src="{{ICON:twitter}}">', { width: 100, height: 100 });
  const urls = [...out.matchAll(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/g)].map((m) => Buffer.from(m[1], 'base64').toString());
  assert.equal(urls.length, 3);
  assert.ok(urls[0].includes('#000000'));
  assert.ok(urls[1].includes('#ffffff'));
  assert.ok(urls[2].includes('<path'));
});

test('contact sheet tiles frames into one PNG', () => {
  const png = new PNG({ width: 40, height: 20 });
  png.data.fill(80);
  const raw = PNG.sync.write(png);
  const sheet = makeContactSheet([raw, raw, raw], { columns: 3, tileWidth: 20 });
  const decoded = PNG.sync.read(Buffer.from(sheet, 'base64'));
  assert.equal(decoded.width, 60);
  assert.equal(decoded.height, 10);
  assert.equal(makeContactSheet([]), null);
});

test('pixel diff detects motion and ignores identical frames', () => {
  const make = (value) => {
    const png = new PNG({ width: 32, height: 32 });
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i] = value; png.data[i + 1] = value; png.data[i + 2] = value; png.data[i + 3] = 255;
    }
    return PNG.sync.write(png);
  };
  assert.equal(diffPng(make(10), make(10)).changedRatio, 0);
  assert.ok(diffPng(make(10), make(200)).changedRatio > 0.9);
});

test('evolve warnings flag a changed background', () => {
  const prev = { html: MINIMAL };
  const next = { html: MINIMAL.replace('background:#000', 'background:#fff') };
  assert.ok(evolveWarnings(prev, next).some((w) => w.includes('background')));
});

test('dimensions rejects unknown aspect', () => {
  assert.throws(() => dimensions('4:3'));
});

test('inject handles asset path traversal safely', () => {
  const html = `<!doctype html><html><head><style>/* {{FONTS_CSS}} */ .frame{width:{{W}}px;height:{{H}}px;background:#000}</style></head><body><div class="frame" id="frame"><img src="{{ASSET:../package.json}}"></div><!-- {{GSAP}} --><script>const tl=gsap.timeline({paused:true});tl.fromTo('h1',{opacity:0},{opacity:1,duration:1});window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=2;</script></body></html>`;
  const out = injectSceneHtml(html, { width: 10, height: 10, assetsDir: '/tmp' });
  assert.ok(!out.includes('data:application/json;base64'));
});
