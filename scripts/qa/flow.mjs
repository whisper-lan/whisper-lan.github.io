// Let go after a short scroll from the top and record the scroll speed frame
// by frame. The opening should carry on in one smooth rise and fall — never
// slow to a near stop and then speed up again.
// Usage: node scripts/qa/flow.mjs [mouse|trackpad]
import { notches, open, openingRest } from './browser.mjs';

const kind = process.argv[2] || 'trackpad';
const { browser, page } = await open();
const rest = await openingRest(page);
await page.evaluate(() => {
  window.__ys = [];
  const t0 = performance.now();
  const tick = () => {
    window.__ys.push([performance.now() - t0, window.scrollY]);
    if (window.__ys.length < 420) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
if (kind === 'mouse') await notches(page, 1, 3);
else {
  for (const d of [8, 14, 20, 24, 22, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 1]) {
    await page.mouse.wheel(0, d);
    await page.waitForTimeout(16);
  }
}
await page.waitForTimeout(4000);
const ys = await page.evaluate(() => window.__ys);
const v = ys.slice(1).map((p, i) => ((p[1] - ys[i][1]) / (p[0] - ys[i][0])) * 1000);
let peak = 0;
let dipped = false;
let stall = false;
for (const s of v) {
  peak = Math.max(peak, s);
  if (peak > 300 && s < peak * 0.15 && !dipped) dipped = true;
  if (dipped && s > peak * 0.4 && s < peak) stall = true;
}
const end = Math.round(ys[ys.length - 1][1]);
console.log(`${kind}: rests at y=${end} (expected ${rest}) · peak ${Math.round(peak)} px/s · ${stall ? 'STALLS then restarts' : 'one smooth rise and fall'}`);
console.log('speed every ~100 ms:', v.filter((_, i) => i % 6 === 0).map(Math.round).join(' '));
await browser.close();
