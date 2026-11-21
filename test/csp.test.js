import test from 'node:test';
import assert from 'node:assert/strict';
import { launchBrowser } from '../src/browser.js';
import { injectSceneHtml } from '../src/inject.js';

const enabled = process.env.TRUEMOTION_CSP === '1';

test('injected CSP blocks external network requests in a real scene', { skip: !enabled && 'set TRUEMOTION_CSP=1' }, async () => {
  const html = `<!doctype html><html><head><style>/* {{FONTS_CSS}} */
  .frame{width:{{W}}px;height:{{H}}px;background:#000}</style></head>
  <body><div class="frame" id="frame"><img id="remote" src="https://example.invalid/evil.png"></div>
  {{GSAP}}
  <script>
  const tl=gsap.timeline({paused:true});
  window.__SCENE_TIMELINE__=tl;
  window.__SCENE_DURATION__=1;
  </script></body></html>`;

  const injected = injectSceneHtml(html, { width: 320, height: 180 });
  assert.ok(injected.includes("http-equiv=\"Content-Security-Policy\""));
  assert.ok(injected.includes("connect-src 'none'"));
  assert.ok(injected.includes("default-src 'none'"));

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
    const attempts = [];
    const blocked = [];
    const failed = [];
    page.on('request', (request) => {
      if (/^https?:/.test(request.url())) attempts.push(request.url());
    });
    page.on('requestfailed', (request) => failed.push(request.url()));
    // CSP violations are reported as console errors by Chromium.
    page.on('console', (message) => {
      if (/Content Security Policy|blocked/i.test(message.text())) blocked.push(message.text());
    });
    await page.setContent(injected, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const state = await page.evaluate(() => ({
      imgComplete: document.getElementById('remote').complete,
      imgWidth: document.getElementById('remote').naturalWidth,
      timeline: typeof window.__SCENE_TIMELINE__.seek
    }));

    assert.equal(state.timeline, 'function', 'scene script must still run under CSP');
    assert.ok(attempts.length > 0, `expected a remote request attempt, got ${JSON.stringify(state)}`);
    assert.ok(attempts.every((url) => failed.includes(url)),
      `all remote requests must fail: attempts=${JSON.stringify(attempts)} failed=${JSON.stringify(failed)}`);
    assert.equal(state.imgWidth, 0, 'remote image must not load');
  } finally {
    await browser.close();
  }
});
