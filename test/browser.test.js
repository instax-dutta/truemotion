import test from 'node:test';
import assert from 'node:assert/strict';
import { browserOptions, resolveBrowserPath, CHROME_ENV, findSystemChrome } from '../src/browser.js';

test('explicit browser path wins and must exist', () => {
  const previous = process.env[CHROME_ENV];
  process.env[CHROME_ENV] = process.execPath;
  assert.deepEqual(resolveBrowserPath(), { executablePath: process.execPath, source: 'explicit' });
  assert.equal(browserOptions().executablePath, process.execPath);
  assert.throws(() => resolveBrowserPath('/definitely/not/a/browser'), /does not exist/);
  if (previous === undefined) delete process.env[CHROME_ENV];
  else process.env[CHROME_ENV] = previous;
});

test('system Chrome is used when no override is set', () => {
  const previous = process.env[CHROME_ENV];
  delete process.env[CHROME_ENV];
  const system = findSystemChrome();
  const resolved = resolveBrowserPath();
  if (system) {
    assert.equal(resolved.executablePath, system);
    assert.equal(resolved.source, 'system');
  }
  const options = browserOptions();
  assert.equal(options.headless, true);
  assert.ok(options.args.includes('--force-color-profile=srgb'));
  if (previous !== undefined) process.env[CHROME_ENV] = previous;
});
