import fs from 'node:fs';
import path from 'node:path';
import * as simpleIcons from 'simple-icons';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let gsapSource;
let fontsCss;
let iconMap;

export function getGsapSource() {
  if (gsapSource === undefined) {
    gsapSource = fs.readFileSync(require.resolve('gsap/dist/gsap.min.js'), 'utf8');
  }
  return gsapSource;
}

export function getFontsCss() {
  if (fontsCss !== undefined) return fontsCss;
  const face = (family, weight, file) => {
    const bytes = fs.readFileSync(require.resolve(file));
    return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2')}`;
  };
  fontsCss = [
    face('Display', 600, '@fontsource/archivo/files/archivo-latin-600-normal.woff2'),
    face('Display', 900, '@fontsource/archivo/files/archivo-latin-900-normal.woff2'),
    face('Body', 300, '@fontsource/archivo/files/archivo-latin-300-normal.woff2'),
    face('Body', 400, '@fontsource/archivo/files/archivo-latin-400-normal.woff2'),
    face('Mono', 500, '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')
  ].join('\n');
  return fontsCss;
}

function getIconMap() {
  if (!iconMap) {
    iconMap = new Map();
    for (const icon of Object.values(simpleIcons)) {
      if (icon?.slug && icon?.path) iconMap.set(icon.slug, icon);
    }
  }
  return iconMap;
}

const ICON_ALIASES = { sheets: 'googlesheets', mail: 'gmail', twitter: 'x' };

function iconDataUrl(spec) {
  const [slugPart, variant, hex] = spec.split('/');
  const slug = ICON_ALIASES[slugPart] ?? slugPart;
  const icon = getIconMap().get(slug);
  if (!icon) return '';
  const fill = variant === 'mono' ? `#${(hex ?? 'ffffff').replace(/^#/, '')}` : `#${icon.hex}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}"><path d="${icon.path}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

function assetDataUrl(rel, assetsDir) {
  if (!assetsDir) return '';
  const safe = String(rel).replace(/\\/g, '/').replace(/^\/+/, '');
  if (safe.includes('..')) return '';
  const file = path.resolve(assetsDir, safe);
  if (!file.startsWith(path.resolve(assetsDir) + path.sep)) return '';
  if (!fs.existsSync(file)) return '';
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  return `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
}

const TYPING_SHIM = `<script data-om-typing-runtime>(function(){
  var flushes=[];
  window.OMTyping={
    attach:function(cfg){
      var target=typeof cfg.target==='string'?document.querySelector(cfg.target):cfg.target;
      var cursor=cfg.cursor?(typeof cfg.cursor==='string'?document.querySelector(cfg.cursor):cfg.cursor):null;
      var text=String(cfg.text==null?'':cfg.text);
      var proxy={n:0};
      function write(){
        var n=Math.max(0,Math.min(text.length,Math.round(proxy.n)));
        if(target)target.textContent=text.slice(0,n);
        if(cursor)cursor.style.opacity='1';
      }
      if(target){target.style.opacity='1';target.style.transform='none';}
      var tl=cfg.timeline;
      tl.fromTo(proxy,{n:0},{n:text.length,duration:cfg.duration==null?1:cfg.duration,ease:'none',onUpdate:write},cfg.start==null?0:cfg.start);
      var seek=tl.seek.bind(tl);
      tl.seek=function(t,suppress){var r=seek(t,suppress);write();return r;};
      flushes.push(write);write();
      return {flush:write};
    }
  };
})();<\/script>`;

function injectFonts(html, css) {
  if (html.includes('{{FONTS_CSS}}')) {
    return html
      .replace(/\/\*\s*\{\{FONTS_CSS\}\}[^*]*\*\//g, () => css)
      .replaceAll('{{FONTS_CSS}}', () => css);
  }
  if (/<style[^>]*>/i.test(html)) return html.replace(/<style([^>]*)>/i, (_m, attrs) => `<style${attrs}>\n${css}\n`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>\n<style>${css}</style>\n`);
  return `<style>${css}</style>\n${html}`;
}

function injectBeforeFirstScript(html, block) {
  const i = html.search(/<script\b/i);
  if (i < 0) return html + '\n' + block;
  return html.slice(0, i) + block + '\n' + html.slice(i);
}

export function injectSceneHtml(html, { width, height, assetsDir } = {}) {
  let out = String(html).replaceAll('{{W}}', String(width)).replaceAll('{{H}}', String(height));
  out = injectFonts(out, getFontsCss());

  // Keep scenes self-contained: no network, no external assets, no eval.
  const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; img-src data: blob:; media-src data: blob:; connect-src 'none';">`;
  if (!/http-equiv=["']Content-Security-Policy/i.test(out)) {
    out = /<head[^>]*>/i.test(out)
      ? out.replace(/<head([^>]*)>/i, (_match, attrs) => `<head${attrs}>${CSP}`)
      : CSP + out;
  }

  const gsapTag = `<script>${getGsapSource()}<\/script>`;
  const withTyping = gsapTag + (/\bOMTyping\./.test(out) ? TYPING_SHIM : '');
  out = out.replace(/<!--\s*\{\{GSAP\}\}[^>]*-->/g, () => withTyping);
  if (out.includes('{{GSAP}}')) out = out.replaceAll('{{GSAP}}', () => withTyping);
  else if (/\bgsap\./.test(out) && !out.includes('gsap.min.js')) out = injectBeforeFirstScript(out, gsapTag);
  if (/\bOMTyping\./.test(out) && !out.includes('data-om-typing-runtime')) out = injectBeforeFirstScript(out, TYPING_SHIM);

  out = out.replace(/\{\{ICON:([^}]+)\}\}/g, (_m, spec) => iconDataUrl(spec.trim()));
  out = out.replace(/\{\{ASSET:([^}]+)\}\}/g, (_m, rel) => assetDataUrl(rel.trim(), assetsDir));

  const unsupported = [...out.matchAll(/\{\{(THREE|SHADERS|ROUGH|FX|BRAND:[^}]+|COMPONENT:[^}]+)\}\}/g)].map((m) => m[1]);
  if (unsupported.length) {
    throw new Error(`Unsupported injection token(s): ${[...new Set(unsupported)].join(', ')}. TrueMotion core supports {{GSAP}}, {{FONTS_CSS}}, {{W}}, {{H}}, {{ICON:...}} and {{ASSET:...}} only.`);
  }
  return out;
}
