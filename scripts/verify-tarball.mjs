// Called by `npm pack` / `npm publish` via the prepack script. Verifies that
// the tarball contains the runtime and docs but no generated media or secrets.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// --ignore-scripts prevents prepack from recursively invoking this verifier.
const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || 'npm pack --dry-run failed');
  process.exit(1);
}
const pack = JSON.parse(result.stdout)[0];
const files = pack.files.map((entry) => entry.path);
const required = [
  'package.json', 'README.md', 'LICENSE', 'NOTICE.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
  'bin/truemotion.mjs', 'src/mcp.js', 'src/render.js', 'src/encode.js', 'src/segments.js',
  'skill/SKILL.md', 'skill/scene-contract.md'
];
const missing = required.filter((name) => !files.includes(name));
if (missing.length) throw new Error(`tarball missing required files: ${missing.join(', ')}`);

const forbidden = files.filter((name) =>
  /\.(mp4|m4a|wav)$/i.test(name) ||
  /(^|\/)\.env($|\.)/i.test(name) ||
  /(^|\/)\.git($|\/)/i.test(name) ||
  /node_modules\//.test(name) ||
  /(^|\/)__pycache__($|\/)/.test(name)
);
if (forbidden.length) throw new Error(`tarball contains forbidden files: ${forbidden.join(', ')}`);

const bytes = pack.size;
if (bytes > 2 * 1024 * 1024) throw new Error(`tarball too large: ${bytes} bytes`);
console.log(`tarball verified: ${files.length} files, ${(bytes / 1024).toFixed(0)} KiB`);
