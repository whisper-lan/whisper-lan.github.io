// Tells the IndexNow search engines (Bing, Yandex, Seznam, Naver) that the
// site's pages changed. Run after a deploy, by the Pages workflow. The key is
// public by design: an engine fetches https://<domain>/<key>.txt to check the
// request comes from whoever runs the site. Google does not take part.
import { readdirSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || read('lib/constants.ts').match(/NEXT_PUBLIC_SITE_DOMAIN \|\| '([^']+)'/)[1];
const base = `https://${domain}`;
const keyFile = readdirSync(new URL('../public/', import.meta.url)).find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) throw new Error('no IndexNow key file in public/');
const key = keyFile.slice(0, -'.txt'.length);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A fresh deploy can take a minute to reach every Pages edge.
let live = false;
for (let attempt = 0; attempt < 10 && !live; attempt++) {
  if (attempt) await sleep(15_000);
  const res = await fetch(`${base}/${keyFile}`, { cache: 'no-store' }).catch(() => null);
  live = res?.ok === true && (await res.text()).trim() === key;
}
if (!live) throw new Error(`${base}/${keyFile} is not serving the key`);

const sitemap = await (await fetch(`${base}/sitemap.xml`, { cache: 'no-store' })).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) throw new Error('sitemap lists no pages');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: domain, key, keyLocation: `${base}/${keyFile}`, urlList }),
});
// 200 and 202 (key still being checked) both mean the list was taken.
console.log(`indexnow: ${res.status} for ${urlList.length} pages on ${base}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
