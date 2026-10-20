// Shared setup for the QA scripts. Playwright is not a project dependency:
// install it anywhere and point PLAYWRIGHT_DIR at that node_modules folder.
//
//   npm i --prefix ~/.cache/whisper-qa playwright@1.61.0
//   npx --prefix ~/.cache/whisper-qa playwright install chromium webkit
//   PLAYWRIGHT_DIR=~/.cache/whisper-qa/node_modules node scripts/qa/frames.mjs
//
// BASE_URL defaults to the static preview from `npm start`.
import { createRequire } from 'node:module';

const dir = process.env.PLAYWRIGHT_DIR;
if (!dir) {
  console.error('Set PLAYWRIGHT_DIR to a node_modules folder containing playwright (see scripts/qa/browser.mjs).');
  process.exit(1);
}
const playwright = createRequire(`${dir.replace(/\/$/, '')}/`)('playwright');

export const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

// ENGINE=chrome (installed Google Chrome, the default), chromium or webkit.
export async function open({ width = 1440, height = 900, scheme = 'light', scale = 1, path = '/zh' } = {}) {
  const engine = process.env.ENGINE || 'chrome';
  const browser =
    engine === 'webkit'
      ? await playwright.webkit.launch(process.env.WEBKIT_EXECUTABLE ? { executablePath: process.env.WEBKIT_EXECUTABLE } : {})
      : await playwright.chromium.launch(engine === 'chrome' ? { channel: 'chrome' } : {});
  const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: scale });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.mouse.move(width / 2, height / 2);
  return { browser, page };
}

export const jump = (page, y) => page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);
export const scrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

// A trackpad flick: a short push, then decaying momentum.
export async function flick(page, dir, strength = 1) {
  for (const d of [20, 45, 70, 90, 90]) {
    await page.mouse.wheel(0, dir * d * strength);
    await page.waitForTimeout(12);
  }
  for (let d = 85; d > 1; d *= 0.9) {
    await page.mouse.wheel(0, dir * d * strength);
    await page.waitForTimeout(12);
  }
}

// Clicks of a notched mouse wheel.
export async function notches(page, dir, count) {
  for (let i = 0; i < count; i++) {
    await page.mouse.wheel(0, dir * 100);
    await page.waitForTimeout(40);
  }
}

// Scroll positions where each feature chapter is centred (its "page").
export const chapterPages = (page) =>
  page.evaluate(() => {
    const frame = document.querySelector('#features [style*="aspect-ratio: 1 / 0.82"]');
    const track = frame.closest('.sticky').parentElement;
    const top = Math.round(track.getBoundingClientRect().top + window.scrollY);
    // one panel per chapter on the stage's strip
    const n = frame.firstElementChild.children.length;
    return Array.from({ length: n }, (_, i) => top + i * window.innerHeight);
  });

// Where the features section title rests (TITLE_AT in Chapters.tsx): the
// first "page" of the section, before chapter 1.
export const titlePage = (page) =>
  page.evaluate(() => {
    const box = document.querySelector('#features h2').parentElement.parentElement.getBoundingClientRect();
    return Math.round(box.top + window.scrollY + box.height / 2 - 0.4 * window.innerHeight);
  });

// Where the opening shot comes to rest (REST in Prologue.tsx).
export const openingRest = (page) =>
  page.evaluate(() => Math.round(0.88 * (document.getElementById('top').offsetHeight - window.innerHeight)));
