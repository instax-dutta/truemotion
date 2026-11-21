import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { withStateLock } from '../src/state.js';

function makeFile(dir) {
  const file = path.join(dir, 'state.json');
  fs.writeFileSync(file, '{}');
  return file;
}

test('state lock times out when a holder never releases it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-lock-timeout-'));
  const file = makeFile(dir);
  const lock = `${path.resolve(file)}.lock`;
  fs.writeFileSync(lock, 'held');

  await assert.rejects(
    withStateLock(file, async () => 'should not run', { timeout: 80, staleMs: 60000 }),
    /Timed out acquiring state lock/
  );
  assert.ok(fs.existsSync(lock), 'a fresh lock must not be treated as stale');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('state lock recovers from a stale lock left by a crashed process', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-lock-stale-'));
  const file = makeFile(dir);
  const lock = `${path.resolve(file)}.lock`;
  fs.writeFileSync(lock, 'abandoned');
  const old = new Date(Date.now() - 120000);
  fs.utimesSync(lock, old, old);

  let ran = false;
  const value = await withStateLock(file, async () => { ran = true; return 'ok'; }, { timeout: 2000, staleMs: 60000 });
  assert.equal(value, 'ok');
  assert.ok(ran);
  assert.ok(!fs.existsSync(lock), 'stale lock must be removed after use');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('lock is released even when the critical section throws', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-lock-throw-'));
  const file = makeFile(dir);
  const lock = `${path.resolve(file)}.lock`;
  await assert.rejects(withStateLock(file, async () => { throw new Error('boom'); }), /boom/);
  assert.ok(!fs.existsSync(lock));
  fs.rmSync(dir, { recursive: true, force: true });
});
