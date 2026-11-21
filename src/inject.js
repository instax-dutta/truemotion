import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROUGH_SOURCE } from './rough.js';
import { FX_SOURCE } from './fx.js';

const require = createRequire(import.meta.url);

let gsapSource;
let fontsCss;
let iconifyData;
let iconColors;

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

function getIconifyData() {
  if (!iconifyData) {
    iconifyData = JSON.parse(fs.readFileSync(require.resolve('@iconify-json/simple-icons/icons.json'), 'utf8'));
  }
  return iconifyData;
}

const ICON_ALIASES = { sheets: 'googlesheets', mail: 'gmail', twitter: 'x' };

function iconDataUrl(spec) {
  const [slugPart, variant, hex] = spec.split('/');
  let slug = ICON_ALIASES[slugPart] ?? slugPart;
  const data = getIconifyData();
  let icon = data.icons[slug];
  if (!icon && data.aliases?.[slug]) {
    slug = data.aliases[slug].parent ?? slug;
    icon = data.icons[slug];
  }
  if (!icon) return '';
  if (!iconColors) iconColors = require('./icon-colors.json');
  const fill = variant === 'mono' ? `#${(hex ?? 'ffffff').replace(/^#/, '')}` : `#${iconColors[slug] ?? '111111'}`;
  const body = String(icon.body).replace(/currentColor/g, fill);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`;
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

export const TYPING_SHIM = `<script data-om-typing-runtime>(function(){
  window.__OM_TYPING_RUNTIME__=true;
  window.OMTyping=window.OMTyping||{
    _writes:[],
    _flush:function(){for(var i=0;i<this._writes.length;i++){this._writes[i]();}},
    attach:function(cfg){
      var tl=cfg&&cfg.timeline;
      var target=cfg&&cfg.target;
      if(typeof target==='string')target=document.querySelector(target);
      if(!tl||!target)return null;
      var text=String(cfg.text==null?'':cfg.text);
      var start=cfg.start==null?0:cfg.start;
      var duration=cfg.duration==null?2:cfg.duration;
      var row=cfg.row;
      if(typeof row==='string')row=document.querySelector(row);
      if(!row&&target.closest)row=target.closest('.om-input-row, .input-row, .prompt-row, .prompt-text');
      if(target.setAttribute)target.setAttribute('data-om-typed','');
      var proxy={n:0};
      var sync=function(){
        var n=Math.max(0,Math.min(text.length,Math.round(proxy.n)));
        target.textContent=text.slice(0,n);
      };
      tl.set(target,{opacity:1,visibility:'visible',x:0,y:0,z:0,scale:1,clearProps:'filter'},start);
      if(row)tl.set(row,{opacity:1,visibility:'visible',x:0,y:0,z:0,scale:1,overflow:'visible'},start);
      tl.to(proxy,{n:text.length,duration:duration,ease:'none',lazy:false,onUpdate:sync},start);
      this._writes.push(sync);
      var cursor=cfg.cursor;
      if(typeof cursor==='string')cursor=document.querySelector(cursor);
      if(cursor){
        tl.set(cursor,{opacity:1,visibility:'visible'},start);
        tl.to(cursor,{opacity:0.25,duration:0.4,repeat:-1,yoyo:true,ease:'sine.inOut'},start);
      }
      var seek=tl.seek;
      if(typeof seek==='function'){
        tl.seek=function(){var result=seek.apply(this,arguments);sync();return result;};
      }
      sync();
      return proxy;
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

  out = out.replace(/<!--\s*\{\{ROUGH\}\}[^>]*-->/g, () => ROUGH_SOURCE);
  if (out.includes('{{ROUGH}}')) out = out.replaceAll('{{ROUGH}}', () => ROUGH_SOURCE);
  if (/\bOMRough\./.test(out) && !out.includes('data-om-rough-runtime')) out = injectBeforeFirstScript(out, ROUGH_SOURCE);

  out = out.replace(/<!--\s*\{\{FX\}\}[^>]*-->/g, () => FX_SOURCE);
  if (out.includes('{{FX}}')) out = out.replaceAll('{{FX}}', () => FX_SOURCE);
  if (/\bOMFX\./.test(out) && !out.includes('data-om-fx-runtime')) out = injectBeforeFirstScript(out, FX_SOURCE);

  const gsapTag = `<script>${getGsapSource()}<\/script>`;
  const withTyping = gsapTag + (/\bOMTyping\./.test(out) ? TYPING_SHIM : '');
  out = out.replace(/<!--\s*\{\{GSAP\}\}[^>]*-->/g, () => withTyping);
  if (out.includes('{{GSAP}}')) out = out.replaceAll('{{GSAP}}', () => withTyping);
  else if (/\bgsap\./.test(out) && !out.includes('gsap.min.js')) out = injectBeforeFirstScript(out, gsapTag);
  if (/\bOMTyping\./.test(out) && !out.includes('data-om-typing-runtime')) out = injectBeforeFirstScript(out, TYPING_SHIM);

  out = out.replace(/\{\{ICON:([^}]+)\}\}/g, (_m, spec) => iconDataUrl(spec.trim()));
  out = out.replace(/\{\{ASSET:([^}]+)\}\}/g, (_m, rel) => assetDataUrl(rel.trim(), assetsDir));

  const unsupported = [...out.matchAll(/\{\{(THREE|SHADERS|BRAND:[^}]+|COMPONENT:[^}]+)\}\}/g)].map((m) => m[1]);
  if (unsupported.length) {
    throw new Error(`Unsupported injection token(s): ${[...new Set(unsupported)].join(', ')}. TrueMotion core supports {{GSAP}}, {{FONTS_CSS}}, {{W}}, {{H}}, {{ICON:...}}, {{ASSET:...}}, {{ROUGH}} and {{FX}}.`);
  }
  return out;
}
