import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_BRAND = {
  primary: '#F5A524',
  background: '#0B0E14',
  text: '#F3EFE9',
  accent: '#F5A524',
  muted: 'rgba(243,239,233,0.62)',
  logo: ''
};

const KEYS = Object.keys(DEFAULT_BRAND).filter((key) => key !== 'logo');

export function normalizeBrand(brand) {
  return { ...DEFAULT_BRAND, ...(brand && typeof brand === 'object' ? brand : {}) };
}

export function brandCss(brand) {
  const values = normalizeBrand(brand);
  return `:root{${KEYS.map((key) => `--brand-${key}:${values[key]}`).join(';')}}`;
}

export function brandValue(brand, key) {
  const values = normalizeBrand(brand);
  return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : '';
}

export function brandLogoDataUrl(brand, assetsDir) {
  const logo = normalizeBrand(brand).logo;
  if (!logo || !assetsDir) return '';
  const safe = String(logo).replace(/\\/g, '/').replace(/^\/+/, '');
  if (safe.includes('..')) return '';
  const file = path.resolve(assetsDir, safe);
  if (!file.startsWith(path.resolve(assetsDir) + path.sep) || !fs.existsSync(file)) return '';
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'application/octet-stream';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
