import test from 'node:test';
import assert from 'node:assert/strict';
import { browserOptions, CHROME_ENV, findSystemChrome } from '../src/browser.js';

test('browser options prefer an explicit chrome path', () => {
  const previous = process.env[CHROME_ENV];
  process.env[CHROME_ENV] = '/env/chrome';
  assert.equal(browserOptions('/explicit/chrome').executablePath, '/explicit/chrome');
  assert.equal(browserOptions().executablePath, '/env/chrome');
  if (previous === undefined) delete process.env[CHROME_ENV];
  else process.env[CHROME_ENV] = previous;
});

test('browser options are minimal without a chrome override', () => {
  const previous = process.env[CHROME_ENV];
  delete process.env[CHROME_ENV];
  assert.deepEqual(browserOptions(), { headless: true });
  if (previous !== undefined) process.env[CHROME_ENV] = previous;
});
