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
  truemotion render --state <state.json> --out <video.mp4> [--fps 30] [--crf 18] [--resolution 720p] [--audio <file>] [--assets <dir>]
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
      audio: opts.audio ? path.resolve(opts.audio) : undefined,
      assetsDir: opts.assets ? path.resolve(opts.assets) : path.join(path.dirname(path.resolve(stateFile)), 'assets')
    });
    console.log(`Rendered ${result.frames} frames to ${result.output}`);
    return;
  }

  if (command === 'install-skill') {
    const target = opts._[0];
    if (!target) throw new Error('install-skill requires a target directory');
    console.log(`Installed skill to ${installSkill(resolveSkillDir(opts.skill), target)}`);
    return;
  }

  if (command === 'doctor') {
    const checks = [];
    const nodeVer = process.version;
    checks.push(`node ${nodeVer} (>=20 required)`);
    let ffmpegOk = false;
    try { const r = (await import('node:child_process')).spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }); ffmpegOk = r.status === 0; } catch {}
    checks.push(`ffmpeg: ${ffmpegOk ? 'ok' : 'MISSING (needed for render)'}`);
    let pwOk = false;
    try { await import('playwright'); pwOk = true; } catch {}
    checks.push(`playwright: ${pwOk ? 'ok' : 'MISSING'}`);
    console.log(checks.join('\n'));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[truemotion] ${error.message}`);
  process.exit(1);
});
