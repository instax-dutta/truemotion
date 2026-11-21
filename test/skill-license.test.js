import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skill');

function walk(folder, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(folder, entry.name), rel));
    else if (entry.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

test('every skill document carries an MIT SPDX header', () => {
  const files = walk(dir);
  assert.ok(files.length > 0);
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.ok(content.includes('SPDX-License-Identifier: MIT'), `${file} missing MIT SPDX header`);
  }
});

test('skill links resolve to existing documents', () => {
  const root = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
  const links = [...root.matchAll(/\]\(([^)#]+\.md|[^)#]+\/)\)/g)].map((m) => m[1]);
  assert.ok(links.length > 5);
  for (const link of links) {
    assert.ok(fs.existsSync(path.join(dir, link)), `broken skill link: ${link}`);
  }
});
