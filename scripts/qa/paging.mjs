// Resting behaviour: the opening shot and the feature chapters.
// Usage: node scripts/qa/paging.mjs   (ENGINE=webkit to check Safari's engine)
import { chapterPages, flick, jump, notches, open, openingRest, scrollY } from './browser.mjs';

const { browser, page } = await open();
const rest = await openingRest(page);
const P = await chapterPages(page);
let failed = 0;
const settle = () => page.waitForTimeout(2800);
const go = async (y) => {
  await jump(page, y);
  await page.waitForTimeout(700);
};
const expectAt = async (label, want) => {
  await settle();
  const y = await scrollY(page);
  const ok = Math.abs(y - want) <= 4;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: y=${y}, expected ${want}`);
};
const expectPast = async (label, edge, dir) => {
  await settle();
  const y = await scrollY(page);
  const ok = dir > 0 ? y > edge + 100 : y < edge - 100;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: y=${y}, edge ${edge}`);
};

// the opening shot
await go(0);
await notches(page, 1, 3);
await expectAt('a nudge down from the headline plays the opening shot', rest);
await notches(page, -1, 3);
await expectAt('a nudge up from the manifesto plays it back', 0);
await page.mouse.wheel(0, 20);
await expectAt('a touch of the wheel falls back to the headline', 0);

// the feature chapters: one gesture moves at most one chapter
await go(P[0]);
await flick(page, 1, 1.6);
await expectAt('a strong flick from chapter 1 stops at chapter 2', P[1]);
await go(P[1]);
await notches(page, 1, 3);
await expectAt('three wheel clicks from chapter 2 reach chapter 3', P[2]);
await go(P[1]);
await notches(page, 1, 1);
await expectAt('one wheel click from chapter 2 reaches chapter 3', P[2]);
await go(P[1]);
await page.mouse.wheel(0, 30);
await page.mouse.wheel(0, 25);
await expectAt('a tiny trackpad move stays on chapter 2', P[1]);
await go(P[2]);
await flick(page, -1, 1.6);
await expectAt('a strong flick up from chapter 3 stops at chapter 2', P[1]);
await go(P[0] - 1300);
await flick(page, 1, 1.4);
await expectAt('a flick down into the section lands on chapter 1', P[0]);
await go(P[0]);
await flick(page, 1, 1.2);
await page.waitForTimeout(1600);
await flick(page, 1, 1.2);
await expectAt('two separate flicks move two chapters', P[2]);
await go(P[3]);
await flick(page, 1, 1.4);
await expectPast('a flick down from chapter 4 leaves the section', P[3], 1);
await go(P[0]);
await flick(page, -1, 1.4);
await expectPast('a flick up from chapter 1 leaves the section', P[0], -1);

console.log(failed ? `${failed} failed` : 'all passed');
await browser.close();
process.exit(failed ? 1 : 0);
