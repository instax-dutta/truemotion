#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import path from 'node:path';
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
  truemotion render --state <state.json> --out <video.mp4> [--fps 30] [--crf 18] [--resolution 720p] [--audio <file>] [--assets <dir>] [--chrome <path>]
  truemotion serve --state <state.json> [--chrome <path>]        # reuses system Chrome if set
  truemotion still --state <state.json> --out <frame.png> [--scene <id|1>] [--time 1.5] [--resolution 720p] [--chrome <path>]
  truemotion install-skill <target-dir>
  truemotion doctor

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
    const result = await renderVideo(loadState(stateFile), opts.out, {
      fps: Number(opts.fps || 30),
      crf: Number(opts.crf || 18),
      resolution: opts.resolution || undefined,
      chrome: opts.chrome ? path.resolve(opts.chrome) : undefined,
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
    fs.mkdirSync(path.dirname(path.resolve(opts.out)), { recursive: true });
    fs.writeFileSync(opts.out, Buffer.from(frame.base64Png, 'base64'));
    console.log(`Wrote ${path.resolve(opts.out)} at ${opts.time || 0}s from scene ${scene.name}`);
    return;
  }

  if (command === 'install-skill') {
    const target = opts._[0];
    if (!target) throw new Error('install-skill requires a target directory');
    console.log(`Installed skill to ${installSkill(resolveSkillDir(opts.skill), target)}`);
    return;
  }

  if (command === 'doctor') {
    const { spawnSync } = await import('node:child_process');
    const { findSystemChrome, browserOptions } = await import('../src/browser.js');
    const checks = [];
    const major = Number(process.versions.node.split('.')[0]);
    checks.push(`node ${process.version}: ${major >= 20 ? 'ok' : 'UNSUPPORTED (20+ required)'}`);
    const ffmpeg = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
    checks.push(`ffmpeg: ${ffmpeg.status === 0 ? 'ok' : 'MISSING (needed for render)'}`);
    let pwExecutable = null;
    try {
      const { chromium } = await import('playwright');
      pwExecutable = chromium.executablePath();
      checks.push(`playwright: ok (${pwExecutable})`);
    } catch { checks.push('playwright: MISSING'); }
    const systemChrome = findSystemChrome();
    checks.push(`system chrome: ${systemChrome ?? 'none found'}`);
    const explicit = browserOptions().executablePath;
    const chosen = explicit ?? pwExecutable;
    checks.push(`browser in use: ${chosen ?? 'NONE - run npx playwright install chromium'}`);
    if (!explicit && !pwExecutable && systemChrome) {
      checks.push(`hint: export TRUEMOTION_CHROME="${systemChrome}" to use the installed Chrome`);
    }
    console.log(checks.join('\n'));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[truemotion] ${error.message}`);
  process.exit(1);
});
