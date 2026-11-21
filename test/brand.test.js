import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { brandCss, brandValue, brandLogoDataUrl, DEFAULT_BRAND } from '../src/brand.js';
import { injectSceneHtml } from '../src/inject.js';

test('brand CSS exposes colour variables', () => {
  const css = brandCss({ primary: '#123456' });
  assert.ok(css.includes('--brand-primary:#123456'));
  assert.ok(css.includes('--brand-background:#0B0E14'));
  assert.equal(brandValue({ primary: '#ABCDEF' }, 'primary'), '#ABCDEF');
  assert.equal(brandValue(DEFAULT_BRAND, 'unknown'), '');
});

test('brand logo is inlined from the assets directory only', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-brand-'));
  fs.writeFileSync(path.join(dir, 'logo.svg'), '<svg></svg>');
  assert.ok(brandLogoDataUrl({ logo: 'logo.svg' }, dir).startsWith('data:image/svg+xml;base64,'));
  assert.equal(brandLogoDataUrl({ logo: '../escape.svg' }, dir), '');
  assert.equal(brandLogoDataUrl({ logo: 'logo.svg' }, null), '');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('BRAND tokens resolve to values and CSS variables', () => {
  const out = injectSceneHtml('<div><!-- {{FONTS_CSS}} --></div><div style="color:{{BRAND:primary}};background:var(--brand-background)">x</div>', {
    width: 100, height: 100, brand: { primary: '#123456' }
  });
  assert.ok(out.includes('color:#123456'));
  assert.ok(out.includes('--brand-primary:#123456'));
  assert.ok(out.includes('var(--brand-background)'));
  assert.ok(!out.includes('{{BRAND:primary}}'));
});
