import path from 'node:path';

const UNSAFE = /[<>:"/\\|?*\x00-\x1f]/g;

export function sanitizeExportFilename(name) {
  const cleaned = String(name ?? '').replace(UNSAFE, '_').replace(/\s+/g, ' ').trim();
  return cleaned || 'Untitled';
}

export function sanitizeOutputPath(filePath) {
  const resolved = path.resolve(filePath);
  const directory = path.dirname(resolved);
  const base = path.basename(resolved);
  const extension = path.extname(base);
  const stem = sanitizeExportFilename(base.slice(0, base.length - extension.length));
  return path.join(directory, `${stem}${extension}`);
}
