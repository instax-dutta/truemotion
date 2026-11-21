import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { frameBackground } from './validate.js';
import { DEFAULT_BRAND, normalizeBrand } from './brand.js';

export const SCHEMA_VERSION = 1;

export const ASPECTS = {
  '16:9': [1920, 1080],
  '9:16': [1080, 1920],
  '1:1': [1080, 1080]
};

export const RESOLUTIONS = {
  '1080p': 1,
  '720p': 2 / 3,
  '540p': 0.5,
  source: 1
};

export function dimensions(aspect, resolution = '1080p') {
  if (!(aspect in ASPECTS)) throw new Error(`Unknown aspect: ${aspect}. Supported: ${Object.keys(ASPECTS).join(', ')}`);
  const scale = RESOLUTIONS[resolution];
  if (scale === undefined) throw new Error(`Unknown resolution: ${resolution}. Supported: ${Object.keys(RESOLUTIONS).join(', ')}`);
  const [width, height] = ASPECTS[aspect];
  return [Math.round(width * scale), Math.round(height * scale)];
}

export function createState({ aspect = '16:9', resolution = '1080p', projectId = 'default', brand = DEFAULT_BRAND } = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectId,
    aspect,
    resolution,
    brand: normalizeBrand(brand),
    components: {},
    scenes: [],
    sketchRefs: [],
    skillReadCache: {},
    stats: { readSkillCalls: 0, writeSceneCalls: 0 }
  };
}

export function normalizeState(raw, { onWarning } = {}) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.scenes)) {
    throw new Error('Invalid state shape: missing scenes array');
  }
  const declared = raw.schemaVersion;
  let source = raw;
  if (declared === undefined) {
    onWarning?.('State file has no schemaVersion (legacy v0); migrated to v1. Save the file to persist the version.');
    source = { ...raw, schemaVersion: SCHEMA_VERSION };
  } else if (!Number.isInteger(declared)) {
    throw new Error(`Invalid schemaVersion: ${JSON.stringify(declared)}`);
  } else if (declared > SCHEMA_VERSION) {
    throw new Error(`State file schema v${declared} is newer than supported v${SCHEMA_VERSION}; upgrade TrueMotion.`);
  } else if (declared < SCHEMA_VERSION) {
    onWarning?.(`Migrating state file from schema v${declared} to v${SCHEMA_VERSION}. Save the file to persist the version.`);
    source = { ...raw, schemaVersion: SCHEMA_VERSION };
  }
  const aspect = source.aspect ?? '16:9';
  const resolution = source.resolution ?? '1080p';
  dimensions(aspect, resolution);
  const scenes = source.scenes.map((scene, index) => {
    if (!scene || typeof scene !== 'object') throw new Error(`Scene ${index + 1} is not an object`);
    if (typeof scene.id !== 'string' || !scene.id) throw new Error(`Scene ${index + 1} has no id`);
    if (typeof scene.name !== 'string' || !scene.name) throw new Error(`Scene ${index + 1} has no name`);
    const duration = Number(scene.durationSec);
    if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Scene ${index + 1} has an invalid durationSec`);
    if (typeof scene.html !== 'string' || !scene.html.trim()) throw new Error(`Scene ${index + 1} has no html`);
    return { ...scene, durationSec: duration };
  });
  return {
    ...source,
    schemaVersion: SCHEMA_VERSION,
    aspect,
    resolution,
    brand: normalizeBrand(source.brand),
    components: source.components && typeof source.components === 'object' ? source.components : {},
    scenes,
    sketchRefs: Array.isArray(source.sketchRefs) ? source.sketchRefs : [],
    skillReadCache: source.skillReadCache && typeof source.skillReadCache === 'object' ? source.skillReadCache : {},
    stats: source.stats && typeof source.stats === 'object' ? source.stats : { readSkillCalls: 0, writeSceneCalls: 0 }
  };
}

export function loadState(file, { onWarning } = {}) {
  if (!fs.existsSync(file)) throw new Error(`State file not found: ${file}`);
  const raw = fs.readFileSync(file, 'utf8');
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error(`Invalid state JSON in ${file}: ${e.message}`); }
  const warn = onWarning ?? ((message) => console.warn(`[truemotion] ${message}`));
  try { return normalizeState(parsed, { onWarning: warn }); } catch (e) { throw new Error(`Invalid state in ${file}: ${e.message}`); }
}

export async function withStateLock(file, fn, { timeout = 30000, staleMs = 60000 } = {}) {
  const lock = `${path.resolve(file)}.lock`;
  const started = Date.now();
  let handle;
  while (handle === undefined && Date.now() - started < timeout) {
    try {
      handle = fs.openSync(lock, 'wx');
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > staleMs) fs.unlinkSync(lock);
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 20));
    }
  }
  if (handle === undefined) throw new Error(`Timed out acquiring state lock for ${file}`);
  try {
    return await fn();
  } finally {
    try { fs.closeSync(handle); fs.unlinkSync(lock); } catch {}
  }
}

export function saveState(file, state) {
  const dir = path.dirname(path.resolve(file));
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, file);
}

export function findScene(state, ref) {
  if (ref === undefined) return state.scenes[0] ?? null;
  const byId = state.scenes.find((scene) => scene.id === ref);
  if (byId) return byId;
  const index = Number(ref);
  if (Number.isInteger(index) && index >= 1 && index <= state.scenes.length) return state.scenes[index - 1];
  return null;
}

export function sceneMetadata(scenes) {
  return scenes.map((scene, i) => ({
    index: i + 1,
    id: scene.id,
    name: scene.name,
    durationSec: scene.durationSec
  }));
}

export function addScene(state, input) {
  const scene = {
    id: randomUUID(),
    name: input.name,
    durationSec: input.durationSec,
    html: input.html
  };
  state.scenes = [...state.scenes, scene];
  return scene;
}

export function patchScene(state, id, ops) {
  const scene = state.scenes.find((s) => s.id === id);
  if (!scene) return { error: `Scene not found: ${id}` };
  let html = scene.html;
  for (let i = 0; i < ops.length; i += 1) {
    const { find, replace } = ops[i];
    const count = html.split(find).length - 1;
    if (count === 0) return { error: `patch_scene op ${i + 1}: find text not found. Copy it exactly from read_scene(purpose:"full").` };
    if (count > 1) return { error: `patch_scene op ${i + 1}: find text occurs ${count} times; include more context so it is unique.` };
    html = html.replace(find, replace);
  }
  return { scene, html };
}

export function updateScene(state, input) {
  const scene = state.scenes.find((s) => s.id === input.id);
  if (!scene) return { error: `Scene not found: ${input.id}` };
  if (!input.html) return { error: 'update_scene requires html with the full scene document.' };
  scene.name = input.name ?? scene.name;
  scene.durationSec = input.durationSec ?? scene.durationSec;
  scene.html = input.html;
  return { scene };
}

export function sceneDigest(scene, index, total) {
  const html = scene.html;
  return {
    index: index + 1,
    total,
    id: scene.id,
    name: scene.name,
    durationSec: scene.durationSec,
    ids: [...html.matchAll(/data-om-id=["']([^"']+)["']/g)].map((m) => m[1]),
    background: frameBackground(html)
  };
}
