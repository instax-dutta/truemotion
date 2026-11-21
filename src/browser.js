import fs from 'node:fs';

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

export function browserOptions(override) {
  const executablePath = override || process.env[CHROME_ENV] || undefined;
  return { headless: true, args: CHROME_ARGS, ...(executablePath ? { executablePath } : {}) };
}

export async function launchBrowser(override) {
  const { chromium } = await import('playwright');
  return chromium.launch(browserOptions(override));
}
