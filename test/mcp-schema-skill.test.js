import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createState, saveState } from '../src/state.js';

const enabled = process.env.TRUEMOTION_MCP_SCHEMA === '1';

async function clientFor(stateFile, skillDir) {
  const bin = path.resolve('bin/truemotion.mjs');
  const args = [bin, 'serve', '--state', stateFile, '--no-preview'];
  if (skillDir) args.push('--skill', skillDir);
  const transport = new StdioClientTransport({ command: process.execPath, args });
  const client = new Client({ name: 'mcp-schema-test', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  return client;
}

test('MCP rejects a newer schema across read and write tools', { skip: !enabled && 'set TRUEMOTION_MCP_SCHEMA=1' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-mcp-schema-'));
  const stateFile = path.join(dir, 'state.json');
  saveState(stateFile, createState());
  const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  parsed.schemaVersion = 999;
  fs.writeFileSync(stateFile, JSON.stringify(parsed));
  const original = fs.readFileSync(stateFile);

  const client = await clientFor(stateFile);
  try {
    for (const [name, args] of [
      ['get_scenes', {}],
      ['read_scene', { sceneId: 'missing' }],
      ['add_scene', { name: 'X', durationSec: 1, html: '<html></html>' }],
      ['update_scene', { id: 'missing', html: '<html></html>' }],
      ['patch_scene', { id: 'missing', ops: [{ find: 'x', replace: 'y' }] }],
      ['read_skill', { file: 'SKILL.md' }],
      ['list_skills', {}]
    ]) {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(result.isError, `${name} must reject a newer schema`);
      const message = result.content.map((block) => block.text).join(' ');
      assert.ok(/newer than supported/.test(message), `${name}: expected clear error, got ${message.slice(0, 160)}`);
      assert.ok(fs.readFileSync(stateFile).equals(original),
        `${name} must leave the state file byte-identical after rejection`);
    }
    assert.equal(fs.readdirSync(dir).filter((file) => file.endsWith('.tmp')).length, 0,
      'rejected writes must not leave temporary files');
  } finally {
    await client.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('read_skill re-reads edited files despite a populated cache', { skip: !enabled && 'set TRUEMOTION_MCP_SCHEMA=1' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-mcp-skill-'));
  const skillDir = path.join(dir, 'skill');
  fs.mkdirSync(skillDir, { recursive: true });
  const doc = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(doc, '# version one');

  const stateFile = path.join(dir, 'state.json');
  saveState(stateFile, createState());
  const client = await clientFor(stateFile, skillDir);
  try {
    const first = await client.callTool({ name: 'read_skill', arguments: { file: 'SKILL.md' } });
    assert.equal(first.content[0].text, '# version one');

    const cached = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.ok(cached.skillReadCache['SKILL.md'], 'cache should be populated');

    // Same-size edit, so mtime+size alone would miss it.
    fs.writeFileSync(doc, '# version two');
    const second = await client.callTool({ name: 'read_skill', arguments: { file: 'SKILL.md' } });
    assert.equal(second.content[0].text, '# version two', 'edited skill must be re-read through MCP');

    const updated = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.notEqual(updated.skillReadCache['SKILL.md'].fingerprint, cached.skillReadCache['SKILL.md'].fingerprint);
  } finally {
    await client.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
