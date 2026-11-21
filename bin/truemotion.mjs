#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { sanitizeOutputPath } from '../src/filename.js';
import { createState, saveState } from '../src/state.js';
import { resolveSkillDir, installSkill } from '../src/skill.js';
import { startServer } from '../src/mcp.js';
import { renderVideo } from '../src/render.js';

function parse(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i += 1; }
    } else opts._.push(arg);
  }
  return opts;
}

function help() {
  console.log(`truemotion - open, harness-agnostic motion-graphics tool

Usage:
  truemotion init [state.json] [--aspect 16:9|9:16|1:1] [--resolution 1080p|720p|540p]
  truemotion serve --state <state.json> [--skill <dir>] [--assets <dir>] [--no-preview]
  truemotion render --state <state.json> --out <video.mp4> [--fps 30] [--crf 18] [--resolution 720p] [--concurrency 2] [--start 4 --end 8] [--audio <file>] [--assets <dir>] [--chrome <path>]
  truemotion serve --state <state.json> [--chrome <path>]        # reuses system Chrome if set
  truemotion still --state <state.json> --out <frame.png> [--scene <id|1>] [--time 1.5] [--resolution 720p] [--chrome <path>]
  truemotion optimize-assets <dir> [--max-dimension 2200] [--min-bytes 921600]
  truemotion install-skill <target-dir>
  truemotion doctor
  truemotion selftest

Any MCP-capable harness speaks stdio to "truemotion serve".
Default state path: $TRUEMOTION_STATE_FILE or ./truemotion-state.json`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const opts = parse(rest);
  const stateFile = opts.state || process.env.TRUEMOTION_STATE_FILE || process.env.OPENMOTION_STATE_FILE || './truemotion-state.json';

  if (!command || command === 'help' || command === '--help') return help();
  if (command === 'version' || command === '--version' || command === '-v') { console.log(JSON.parse(require('node:fs').readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version); return; }

  if (command === 'init') {
    const file = opts._[0] || stateFile;
    if (fs.existsSync(file)) throw new Error(`State file already exists: ${file}`);
    saveState(file, createState({ aspect: opts.aspect || '16:9', resolution: opts.resolution || '1080p' }));
    console.log(`Created ${path.resolve(file)}`);
    return;
  }

  if (command === 'serve') {
    if (opts.chrome) process.env.TRUEMOTION_CHROME = path.resolve(opts.chrome);
    const skillDir = resolveSkillDir(opts.skill);
    await startServer({
      stateFile: path.resolve(stateFile),
      skillDir,
      assetsDir: opts.assets ? path.resolve(opts.assets) : path.join(path.dirname(path.resolve(stateFile)), 'assets'),
      preview: opts.noPreview !== true
    });
    return;
  }

  if (command === 'render') {
    const { loadState } = await import('../src/state.js');
    if (!opts.out) throw new Error('render requires --out <video.mp4>');
    const result = await renderVideo(loadState(stateFile), sanitizeOutputPath(opts.out), {
      fps: Number(opts.fps || 30),
      crf: Number(opts.crf || 18),
      resolution: opts.resolution || undefined,
      chrome: opts.chrome ? path.resolve(opts.chrome) : undefined,
      concurrency: Math.max(1, Number(opts.concurrency || 2)),
      startSec: Number(opts.start || 0),
      endSec: opts.end === true ? Infinity : Number(opts.end || Infinity),
      audio: opts.audio ? path.resolve(opts.audio) : undefined,
      assetsDir: opts.assets ? path.resolve(opts.assets) : path.join(path.dirname(path.resolve(stateFile)), 'assets')
    });
    console.log(`Rendered ${result.frames} frames to ${result.output}`);
    return;
  }

  if (command === 'still') {
    const { loadState, findScene } = await import('../src/state.js');
    const { renderFrames } = await import('../src/render.js');
    if (!opts.out) throw new Error('still requires --out <frame.png>');
    const state = loadState(stateFile);
    const scene = findScene(state, opts.scene);
    if (!scene) throw new Error(`Scene not found: ${opts.scene ?? '(none)'}`);
    const [frame] = await renderFrames(scene.html, {
      aspect: state.aspect,
      resolution: opts.resolution || state.resolution,
      timesSec: [Number(opts.time || 0)],
      chrome: opts.chrome ? path.resolve(opts.chrome) : undefined,
      assetsDir: opts.assets ? path.resolve(opts.assets) : path.join(path.dirname(path.resolve(stateFile)), 'assets')
    });
    const output = sanitizeOutputPath(opts.out);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, Buffer.from(frame.base64Png, 'base64'));
    console.log(`Wrote ${output} at ${opts.time || 0}s from scene ${scene.name}`);
    return;
  }

  if (command === 'optimize-assets') {
    const { optimizeAssetsInDir } = await import('../src/assets.js');
    const target = opts._[0];
    if (!target) throw new Error('optimize-assets requires a directory');
    const results = optimizeAssetsInDir(path.resolve(target), {
      maxDimension: Number(opts.maxDimension || 2200),
      minBytes: Number(opts.minBytes || 900 * 1024)
    });
    const saved = results.reduce((sum, r) => sum + (r.before - r.after), 0);
    console.log(`Optimized ${results.length} asset(s), saved ${(saved / 1024).toFixed(0)} KiB`);
    for (const r of results) console.log(`  ${path.basename(r.input)}: ${(r.before / 1024).toFixed(0)} -> ${(r.after / 1024).toFixed(0)} KiB`);
    return;
  }

  if (command === 'install-skill') {
    const target = opts._[0];
    if (!target) throw new Error('install-skill requires a target directory');
    console.log(`Installed skill to ${installSkill(resolveSkillDir(opts.skill), target)}`);
    return;
  }

  if (command === 'selftest') {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'truemotion-selftest-'));
    const file = path.join(dir, 'state.json');
    saveState(file, createState());
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(import.meta.url), 'serve', '--state', file, '--no-preview']
    });
    const client = new Client({ name: 'truemotion-selftest', version: '1.0.0' }, { capabilities: {} });
    const minimal = '<!doctype html><html><head><style>.frame{width:100px;height:100px}</style></head><body><div class="frame"><h1>Self test</h1></div><script>window.__SCENE_TIMELINE__={paused:true,seek(){}};window.__SCENE_DURATION__=1;</script></body></html>';
    try {
      await client.connect(transport);
      const call = async (name, args) => {
        const result = await client.callTool({ name, arguments: args });
        if (result.isError) throw new Error(`${name}: ${result.content.map((b) => b.text).join(' ')}`);
        return result;
      };
      await call('get_scenes', {});
      await call('add_scene', { name: 'Self test', durationSec: 1, html: minimal });
      const persisted = JSON.parse(fs.readFileSync(file, 'utf8')).scenes;
      if (persisted.length !== 1) throw new Error(`expected 1 persisted scene, found ${persisted.length}`);
      await call('read_scene', { sceneId: persisted[0].id, purpose: 'digest' });
      await call('patch_scene', { id: persisted[0].id, ops: [{ find: '>Self test<', replace: '>Self test ok<' }] });
      await call('read_skill', { file: 'SKILL.md' });
      await call('list_skills', {});
      console.log('selftest: PASS (6 tools, state persisted)');
    } finally {
      await client.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return;
  }

  if (command === 'doctor') {
    const { spawnSync } = await import('node:child_process');
    const { findSystemChrome, browserOptions } = await import('../src/browser.js');
    const checks = [];
    const major = Number(process.versions.node.split('.')[0]);
    checks.push(`node ${process.version}: ${major >= 20 ? 'ok' : 'UNSUPPORTED (20+ required)'}`);
    const ffmpeg = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
    checks.push(`ffmpeg: ${ffmpeg.status === 0 ? 'ok (' + (ffmpeg.stdout || '').split('\n')[0] + ')' : 'MISSING (needed for render)'}`);
    let pwExecutable = null;
    try {
      const { chromium } = await import('playwright');
      pwExecutable = chromium.executablePath();
      checks.push(`playwright: ok (${pwExecutable})${fs.existsSync(pwExecutable) ? '' : ' - BROWSER NOT DOWNLOADED'}`);
    } catch { checks.push('playwright: MISSING'); }
    const systemChrome = findSystemChrome();
    checks.push(`system chrome: ${systemChrome ?? 'none found'}`);
    const explicit = browserOptions().executablePath;
    if (explicit) checks.push(`TRUEMOTION_CHROME: ${fs.existsSync(explicit) ? 'ok' : 'PATH DOES NOT EXIST'} (${explicit})`);
    const chosen = explicit ?? (pwExecutable && fs.existsSync(pwExecutable) ? pwExecutable : null) ?? systemChrome;
    checks.push(`browser in use: ${chosen ?? 'NONE - run npx playwright install chromium'}`);
    if (!explicit && !pwExecutable && systemChrome) {
      checks.push(`hint: export TRUEMOTION_CHROME="${systemChrome}" to use the installed Chrome`);
    }
    try {
      const dir = resolveSkillDir(opts.skill);
      const { listSkillFiles } = await import('../src/skill.js');
      checks.push(`skill docs: ok (${listSkillFiles(dir).length} references in ${dir})`);
    } catch (e) { checks.push(`skill docs: MISSING (${e.message})`); }
    try {
      const { loadState } = await import('../src/state.js');
      const loaded = loadState(stateFile);
      checks.push(`state file: ok (${loaded.scenes.length} scenes, ${loaded.aspect}, ${loaded.resolution})`);
    } catch (e) { checks.push(`state file: ${e.message}`); }
    console.log(checks.join('\n'));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[truemotion] ${error.message}`);
  process.exit(1);
});
