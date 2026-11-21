import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { frameBackground } from './validate.js';

export const ASPECTS = {
  '16:9': [1920, 1080],
  '9:16': [1080, 1920],
  '1:1': [1080, 1080]
};

export function dimensions(aspect) {
  return ASPECTS[aspect] ?? ASPECTS['16:9'];
}

export function createState({ aspect = '16:9', projectId = 'default' } = {}) {
  return {
    projectId,
    aspect,
    scenes: [],
    sketchRefs: [],
    skillReadCache: {},
    stats: { readSkillCalls: 0, writeSceneCalls: 0 }
  };
}

export function loadState(file) {
  if (!fs.existsSync(file)) throw new Error(`State file not found: ${file}`);
  const raw = fs.readFileSync(file, 'utf8');
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new Error(`Invalid state JSON in ${file}: ${e.message}`); }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.scenes)) throw new Error(`Invalid state shape in ${file}: missing scenes array`);
  return parsed;
}

export function saveState(file, state) {
  const dir = path.dirname(path.resolve(file));
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, file);
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
