import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const CHROME_ENV = 'TRUEMOTION_CHROME';

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

export function findSystemChrome() {
  return CANDIDATES.find((candidate) => fs.existsSync(candidate)) ?? null;
}

const CHROME_ARGS = ['--force-color-profile=srgb', '--disable-lcd-text'];

export function resolveBrowserPath(override) {
  const explicit = override || process.env[CHROME_ENV];
  if (explicit) {
    if (!fs.existsSync(explicit)) throw new Error(`Chrome path does not exist: ${explicit}`);
    return { executablePath: explicit, source: 'explicit' };
  }
  const system = findSystemChrome();
  if (system) return { executablePath: system, source: 'system' };
  try {
    const cached = require('playwright-core').chromium.executablePath();
    if (cached && fs.existsSync(cached)) return { executablePath: cached, source: 'playwright-cache' };
  } catch {}
  return { executablePath: undefined, source: 'none' };
}

export function browserOptions(override) {
  const { executablePath } = resolveBrowserPath(override);
  return { headless: true, args: CHROME_ARGS, ...(executablePath ? { executablePath } : {}) };
}

export async function launchBrowser(override) {
  const resolved = resolveBrowserPath(override);
  if (!resolved.executablePath) {
    throw new Error('No browser found. Install Chrome/Chromium or set TRUEMOTION_CHROME; playwright-core does not download browsers.');
  }
  const { chromium } = await import('playwright-core');
  return chromium.launch({ headless: true, args: CHROME_ARGS, executablePath: resolved.executablePath });
}
