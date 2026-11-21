import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function resolveSkillDir(override) {
  const candidates = [
    override,
    process.env.TRUEMOTION_SKILL_DIR,
    process.env.OPENMOTION_SKILL_DIR,
    path.join(REPO_ROOT, 'skill')
  ].filter(Boolean);
  const found = candidates.find((dir) => fs.existsSync(path.join(dir, 'SKILL.md')));
  if (!found) throw new Error(`motion skill directory not found. Tried: ${candidates.join(', ')}`);
  return path.resolve(found);
}

export function skillPath(dir, file) {
  const normalized = String(file).replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!normalized || normalized.includes('..')) throw new Error(`Invalid skill file path: ${file}`);
  if (!normalized.endsWith('.md')) throw new Error(`Invalid skill file name: ${file}`);
  const root = path.resolve(dir);
  const target = path.resolve(root, normalized);
  if (!target.startsWith(root + path.sep)) throw new Error(`Skill file escapes skill directory: ${file}`);
  if (!fs.existsSync(target)) throw new Error(`Skill file not found: ${normalized}`);
  return target;
}

export function readSkill(dir, file) {
  return fs.readFileSync(skillPath(dir, file), 'utf8');
}

export function listSkillFiles(dir) {
  const out = [];
  const walk = (d, prefix = '') => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(d, entry.name), rel);
      else if (entry.name.endsWith('.md') && entry.name !== 'SKILL.md') out.push(rel);
    }
  };
  walk(dir);
  return out.sort();
}

export function installSkill(dir, targetDir) {
  fs.cpSync(dir, targetDir, { recursive: true });
  return path.resolve(targetDir);
}
