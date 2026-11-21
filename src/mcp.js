import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import {
  loadState, saveState, sceneMetadata, addScene, patchScene, updateScene, sceneDigest
} from './state.js';
import { validateSceneHtml, evolveGuide, evolveWarnings } from './validate.js';
import { readSkill, listSkillFiles } from './skill.js';
import { sceneNotes, actorExitStates, matchedCut, renderVideo } from './render.js';
import { makeContactSheet } from './sheet.js';
import { optimizeAssetsInDir } from './assets.js';
import { sanitizeOutputPath } from './filename.js';
import { percent } from './diff.js';

const text = (value) => ({ content: [{ type: 'text', text: value }] });
const error = (value) => ({ isError: true, content: [{ type: 'text', text: value }] });

export async function startServer({ stateFile, skillDir, assetsDir, preview = true }) {
  const server = new McpServer({ name: 'truemotion', version: '0.3.0' });
  const withState = async (fn) => {
    const state = loadState(stateFile);
    const result = await fn(state);
    saveState(stateFile, state);
    return result;
  };
  const previewFor = async (state, scene) => {
    if (!preview) return [];
    return (await sceneNotes(scene, state, { assetsDir })).blocks;
  };

  server.registerTool('get_scenes', {
    description: 'Refresh scene metadata. The CURRENT TIMELINE block is pre-loaded, so skip this unless re-verifying after writes.',
    inputSchema: z.object({})
  }, async () => withState(async (state) => text(JSON.stringify(sceneMetadata(state.scenes)))));

  server.registerTool('read_scene', {
    description: 'Load one scene by sceneId. purpose:"evolve" before forking scene 2+ (returns full HTML, evolve guide and measured actor exit states). purpose:"digest" returns a cheap design-token summary without the full HTML.',
    inputSchema: z.object({
      sceneId: z.string().describe('Exact id from the CURRENT TIMELINE block.'),
      purpose: z.enum(['full', 'evolve', 'digest']).optional().describe('Use full before edits, evolve before a connected add, digest for inspection.')
    })
  }, async ({ sceneId, purpose = 'full' }) => withState(async (state) => {
    const index = state.scenes.findIndex((s) => s.id === sceneId);
    if (index < 0) return error(`Scene not found: ${sceneId}`);
    const scene = state.scenes[index];
    if (purpose === 'digest') {
      return text(JSON.stringify({ purpose: 'digest', ...sceneDigest(scene, index, state.scenes.length) }));
    }
    const payload = { id: scene.id, name: scene.name, durationSec: scene.durationSec, html: scene.html };
    if (purpose === 'evolve') {
      payload.purpose = 'evolve';
      payload.evolveGuide = evolveGuide(scene);
      try {
        const actors = await actorExitStates(scene, state, { assetsDir });
        if (actors.length) {
          payload.computedExitStates = {
            note: 'Measured in a real browser at this scene\'s final frame. Lock each continuing actor at t=0 with tl.set() using these exact values so frame 0 matches this exit frame. Actors with labelled:true have a data-om-id; pathActors were inferred from their DOM path because they had none. rect is the rendered box for sanity checks. visible:false actors ended hidden; do not show them at t=0.',
            actors: actors.filter((actor) => actor.labelled),
            pathActors: actors.filter((actor) => !actor.labelled)
          };
        }
      } catch (e) {
        payload.computedExitStatesError = e.message;
      }
    }
    return text(JSON.stringify(payload));
  }));

  server.registerTool('update_scene', {
    description: 'Rewrite ONE existing scene. Read it with purpose:"full" first. Prefer patch_scene for small edits so untouched HTML cannot regress.',
    inputSchema: z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      durationSec: z.number().positive().optional(),
      html: z.string().min(1)
    })
  }, async (input) => withState(async (state) => {
    const check = validateSceneHtml(input.html);
    if (!check.ok) return error(check.message);
    const result = updateScene(state, input);
    if (result.error) return error(result.error);
    state.stats.writeSceneCalls += 1;
    return {
      content: [
        { type: 'text', text: `Updated scene ${result.scene.name} (${result.scene.id}).` },
        ...await previewFor(state, result.scene)
      ]
    };
  }));

  server.registerTool('patch_scene', {
    description: 'Surgically edit ONE scene via exact-string find/replace ops. Each find must match the current html exactly and uniquely (read_scene purpose:"full" first). Preferred over update_scene for small edits.',
    inputSchema: z.object({
      id: z.string(),
      ops: z.array(z.object({
        find: z.string().min(1).describe('Exact unique text copied from the current full scene HTML.'),
        replace: z.string()
      })).min(1).max(20),
      name: z.string().min(1).optional(),
      durationSec: z.number().positive().optional()
    })
  }, async (input) => withState(async (state) => {
    const result = patchScene(state, input.id, input.ops);
    if (result.error) return error(result.error);
    const check = validateSceneHtml(result.html);
    if (!check.ok) return error(`patch_scene produced invalid html; no changes were applied. ${check.message}`);
    result.scene.html = result.html;
    if (input.name) result.scene.name = input.name;
    if (input.durationSec) result.scene.durationSec = input.durationSec;
    state.stats.writeSceneCalls += 1;
    return {
      content: [
        { type: 'text', text: `Patched scene ${result.scene.name} (${result.scene.id}) - ${input.ops.length} op(s) applied.` },
        ...await previewFor(state, result.scene)
      ]
    };
  }));

  server.registerTool('add_scene', {
    description: 'Add ONE scene. Scene 1 is fresh. For later scenes, pass evolveFromSceneId only for a connected matched cut; use freshStart:true for an intentional hard cut. The renderer measures the cut and rejects visible jumps.',
    inputSchema: z.object({
      name: z.string().min(1),
      durationSec: z.number().positive(),
      html: z.string().min(1).describe('Complete contract-valid HTML document.'),
      evolveFromSceneId: z.string().optional(),
      freshStart: z.boolean().optional()
    })
  }, async (input) => withState(async (state) => {
    const check = validateSceneHtml(input.html);
    if (!check.ok) return error(check.message);
    if (state.scenes.length > 0 && !input.evolveFromSceneId && !input.freshStart) {
      const last = state.scenes[state.scenes.length - 1];
      return error(`Scene ${state.scenes.length + 1} must evolve from the previous scene. Call read_scene("${last.id}", purpose:"evolve"), modify that HTML, then add_scene({ evolveFromSceneId: "${last.id}", name, durationSec, html }). Use freshStart:true only for isolated beats.`);
    }
    const previous = input.evolveFromSceneId ? state.scenes[state.scenes.length - 1] : null;
    const warnings = [];
    if (input.evolveFromSceneId) {
      if (!previous || previous.id !== input.evolveFromSceneId) {
        return error(`evolveFromSceneId must be the last scene id (${previous?.id ?? 'none'}).`);
      }
      warnings.push(...evolveWarnings(previous, { html: input.html }));
    }
    const candidate = { html: input.html, durationSec: input.durationSec };
    if (previous) {
      const cut = await matchedCut(previous, candidate, state, { assetsDir });
      if (cut.verdict === 'fail') {
        return {
          isError: true,
          content: [
            { type: 'text', text: `FAILED MATCHED CUT: ${percent(cut.changedRatio)} of pixels change between the previous scene's last frame and this scene's frame 0. The viewer would see a jump. Fork the previous HTML verbatim and lock continuing actors at t=0 with the values from read_scene(purpose:"evolve"), or use freshStart:true for an intentional hard cut.` },
            { type: 'image', data: cut.prevFrame, mimeType: 'image/png' },
            { type: 'image', data: cut.nextFrame, mimeType: 'image/png' }
          ]
        };
      }
      if (cut.verdict === 'warn') {
        warnings.push(`Matched cut: ${percent(cut.changedRatio)} of pixels differ across the cut; acceptable only if the motion is intentional.`);
      }
    }
    const scene = addScene(state, input);
    state.stats.writeSceneCalls += 1;
    const note = input.evolveFromSceneId ? ' Evolved from previous scene.' : input.freshStart ? ' Fresh start.' : '';
    const warningText = warnings.length ? `\nChecks:\n- ${warnings.join('\n- ')}` : '';
    return {
      content: [
        { type: 'text', text: `Added scene ${state.scenes.length} "${scene.name}" (${scene.id}).${note}${warningText}` },
        ...await previewFor(state, scene)
      ]
    };
  }));

  server.registerTool('read_skill', {
    description: 'Load one motion reference on demand. Read only references relevant to the requested choreography; reading is preparation, not completion.',
    inputSchema: z.object({
      file: z.string().describe('Path under skill/, such as SKILL.md, scene-contract.md, patterns/*.md or blocks/*.md.')
    })
  }, async ({ file }) => withState(async (state) => {
    state.stats.readSkillCalls += 1;
    const key = file.replace(/\\/g, '/').replace(/^\/+/, '');
    if (state.skillReadCache[key] !== undefined) return text(state.skillReadCache[key]);
    try {
      const content = readSkill(skillDir, key);
      state.skillReadCache[key] = content;
      return text(content);
    } catch (e) {
      return error(e.message);
    }
  }));

  server.registerTool('view_sketch', {
    description: 'Load the sketch PNG for a raw-sketch scene. Call once per sketch sceneId before converting.',
    inputSchema: z.object({ sceneId: z.string() })
  }, async ({ sceneId }) => withState(async (state) => {
    const ref = state.sketchRefs.find((r) => r.sceneId === sceneId);
    if (!ref) return error(`No raw sketch found for sceneId "${sceneId}".`);
    if (!assetsDir) return error('No assets directory configured (--assets).');
    const safeRel = String(ref.relativePath ?? '').replace(/\\/g, '/').replace(/^\/+/, '');
    if (!safeRel || safeRel.includes('..')) return error(`Invalid sketch path: ${ref.relativePath}`);
    const root = path.resolve(assetsDir);
    const file = path.resolve(root, safeRel);
    if (!file.startsWith(root + path.sep)) return error(`Sketch asset escapes assets directory: ${ref.relativePath}`);
    if (!fs.existsSync(file)) return error(`Sketch asset not found: ${file}`);
    return {
      content: [
        { type: 'text', text: `Sketch "${ref.sceneName ?? sceneId}" (${ref.width ?? '?'}x${ref.height ?? '?'}). Match layout positions and hierarchy.` },
        { type: 'image', data: fs.readFileSync(file).toString('base64'), mimeType: 'image/png' }
      ]
    };
  }));

  server.registerTool('review_timeline', {
    description: 'Audit the whole timeline (or one scene) for static slides, dead holds, duration/timeline mismatches, external requests, script errors, clipped actors and tiny text. Use before finishing a video.',
    inputSchema: z.object({
      sceneId: z.string().optional().describe('Limit the review to this scene id; omit to review all scenes.'),
      contactSheet: z.boolean().optional().describe('Return one contact sheet instead of an image per scene. Default true.')
    })
  }, async ({ sceneId, contactSheet = true }) => withState(async (state) => {
    let scenes = state.scenes;
    if (sceneId) {
      scenes = scenes.filter((s) => s.id === sceneId);
      if (!scenes.length) return error(`Scene not found: ${sceneId}`);
    }
    if (!scenes.length) return error('No scenes to review.');
    const blocks = [];
    const thumbnails = [];
    for (const [i, scene] of scenes.entries()) {
      const { notes, blocks: frames } = await sceneNotes(scene, state, { assetsDir });
      blocks.push({ type: 'text', text: `Scene ${i + 1} "${scene.name}" (${scene.id}): ${notes.join(' ') || 'No issues detected.'}` });
      if (frames[1]?.type === 'image') thumbnails.push(frames[1].data);
    }
    if (contactSheet && thumbnails.length) {
      const sheet = makeContactSheet(thumbnails);
      if (sheet) blocks.push({ type: 'image', data: sheet, mimeType: 'image/png' });
    } else if (!contactSheet) {
      for (const data of thumbnails) blocks.push({ type: 'image', data, mimeType: 'image/png' });
    }
    return { content: blocks };
  }));

  server.registerTool('list_skills', {
    description: 'List the motion reference documents available through read_skill.',
    inputSchema: z.object({})
  }, async () => withState(async () => text(JSON.stringify(listSkillFiles(skillDir)))));

  server.registerTool('render_video', {
    description: 'Render the current timeline to an MP4 on disk. Use after review_timeline reports no issues. Long-running but keeps the agent fully standalone.',
    inputSchema: z.object({
      out: z.string().min(1).describe('Output path; relative paths resolve beside the state file.'),
      fps: z.number().int().positive().optional(),
      resolution: z.enum(['1080p', '720p', '540p', 'source']).optional(),
      crf: z.number().int().min(0).max(51).optional(),
      audio: z.string().optional().describe('Optional music bed; relative paths resolve beside the state file.'),
      startSec: z.number().min(0).optional(),
      endSec: z.number().positive().optional(),
      concurrency: z.number().int().min(1).max(16).optional(),
      batchSize: z.number().int().min(1).max(500).optional().describe('Frames held in memory per streaming batch. Lower for long videos on small machines.')
    })
  }, async (input) => withState(async (state) => {
    try {
      const baseDir = path.dirname(path.resolve(stateFile));
      const requested = path.isAbsolute(input.out) ? input.out : path.resolve(baseDir, input.out);
      const out = sanitizeOutputPath(requested);
      const result = await renderVideo(state, out, {
        fps: input.fps ?? 30,
        resolution: input.resolution,
        crf: input.crf ?? 18,
        audio: input.audio ? path.resolve(baseDir, input.audio) : undefined,
        startSec: input.startSec ?? 0,
        endSec: input.endSec ?? Infinity,
        concurrency: input.concurrency ?? 2,
        batchSize: input.batchSize ?? 30
      });
      return text(`Rendered ${result.frames} frames to ${result.output}`);
    } catch (e) {
      return error(`render_video failed: ${e.message}`);
    }
  }));

  server.registerTool('optimize_assets', {
    description: 'Downscale and recompress large PNG/JPEG assets in the project assets folder using local ffmpeg. Files keep their names so ASSET tokens stay valid.',
    inputSchema: z.object({
      dir: z.string().optional().describe('Asset directory; defaults to the directory beside the state file.'),
      maxDimension: z.number().int().positive().optional(),
      minBytes: z.number().int().positive().optional()
    })
  }, async (input) => withState(async () => {
    try {
      const baseDir = path.dirname(path.resolve(stateFile));
      const dir = path.resolve(baseDir, input.dir ?? 'assets');
      const results = optimizeAssetsInDir(dir, {
        maxDimension: input.maxDimension ?? 2200,
        minBytes: input.minBytes ?? 900 * 1024
      });
      const saved = results.reduce((sum, r) => sum + (r.before - r.after), 0);
      return text(`Optimized ${results.length} asset(s), saved ${(saved / 1024).toFixed(0)} KiB.`);
    } catch (e) {
      return error(`optimize_assets failed: ${e.message}`);
    }
  }));

  await server.connect(new StdioServerTransport());
}
