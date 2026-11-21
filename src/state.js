import fs from 'node:fs';
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

export function loadState(path) {
  if (!fs.existsSync(path)) throw new Error(`State file not found: ${path}`);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function saveState(path, state) {
  fs.mkdirSync(dirnameOf(path), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(state, null, 2));
}

function dirnameOf(path) {
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return i < 0 ? '.' : path.slice(0, i) || '.';
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
