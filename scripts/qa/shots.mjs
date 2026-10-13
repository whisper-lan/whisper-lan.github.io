// Screenshots at given scroll positions, for reviewing a change by eye.
// Usage: node scripts/qa/shots.mjs <outDir> <y,y,...> [light|dark] [width] [height] [/zh|/en]
import { mkdir } from 'node:fs/promises';
import { jump, open } from './browser.mjs';

const [out = 'qa-shots', ys = '0', scheme = 'light', width = '1440', height = '900', path = '/zh'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const { browser, page } = await open({ scheme, width: Number(width), height: Number(height), path });
let i = 0;
for (const y of ys.split(',').map(Number)) {
  await jump(page, y);
  await page.waitForTimeout(Number(process.env.SETTLE || 3000)); // resting points settle and scene stories play
  const file = `${out}/${String(i++).padStart(2, '0')}-${y}.png`;
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
