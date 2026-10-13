// Scroll the whole page down and back up with the wheel and report frame times.
// Usage: node scripts/qa/frames.mjs [light|dark] [devicePixelRatio]
import { open } from './browser.mjs';

const [scheme = 'dark', scale = '2'] = process.argv.slice(2);
const { browser, page } = await open({ scheme, scale: Number(scale) });
const end = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const tick = (now) => {
    window.__frames.push([now - last, Math.round(window.scrollY)]);
    last = now;
    if (!window.__stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
for (const dir of [1, -1]) {
  for (let i = 0; i < Math.ceil(end / 40); i++) {
    await page.mouse.wheel(0, 40 * dir);
    await page.waitForTimeout(16);
  }
}
await page.waitForTimeout(500);
const frames = await page.evaluate(() => {
  window.__stop = true;
  return window.__frames.slice(2);
});
const times = frames.map(([d]) => d).sort((a, b) => a - b);
const pct = (q) => times[Math.floor(times.length * q)].toFixed(1);
const long = frames.filter(([d]) => d > 34);
console.log(`${times.length} frames · p50 ${pct(0.5)} ms · p99 ${pct(0.99)} ms · max ${times[times.length - 1].toFixed(0)} ms`);
console.log(`frames over 34 ms: ${long.length}${long.length ? ` (at y = ${long.map(([d, y]) => `${y}:${Math.round(d)}ms`).join(', ')})` : ''}`);
await browser.close();
