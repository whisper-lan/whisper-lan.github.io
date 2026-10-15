import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// Checks the exported site in out/ (run `npm run build` first). Every absolute
// URL a crawler or link preview follows must point at the live domain: the site
// once shipped canonical, hreflang and sitemap URLs on a domain that no longer
// existed, and nothing noticed.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || read('lib/constants.ts').match(/NEXT_PUBLIC_SITE_DOMAIN \|\| '([^']+)'/)[1];
const base = `https://${domain}`;

const attr = (html, pattern) => [...html.matchAll(pattern)].map((m) => m[1]);
const sameHost = (url, where) => assert.equal(new URL(url).host, domain, `${where}: ${url} is not on ${domain}`);

for (const [file, lang, page] of [['out/zh.html', 'zh-CN', '/zh'], ['out/en.html', 'en', '/en']]) {
  const html = read(file);
  const head = html.split('</head>')[0];
  assert.match(html, new RegExp(`<html lang="${lang}"`), `${file}: html lang should be ${lang}`);
  assert.deepEqual(attr(head, /<link rel="canonical" href="([^"]+)"/g), [`${base}${page}`], `${file}: canonical`);

  const alternates = attr(head, /<link rel="alternate" hrefLang="([^"]+)"/g).sort();
  assert.deepEqual(alternates, ['en', 'x-default', 'zh'], `${file}: hreflang set`);
  for (const url of attr(head, /<link rel="alternate" hrefLang="[^"]+" href="([^"]+)"/g)) sameHost(url, file);

  for (const key of ['og:url', 'og:image']) {
    const [url] = attr(head, new RegExp(`<meta property="${key}" content="([^"]+)"`, 'g'));
    assert.ok(url, `${file}: missing ${key}`);
    sameHost(url, `${file} ${key}`);
  }
  const [image] = attr(head, /<meta property="og:image" content="([^"]+)"/g);
  assert.match(image, /\.png$/, `${file}: og:image needs an extension so Pages sends image/png`);
  assert.ok(existsSync(new URL(`../out${new URL(image).pathname}`, import.meta.url)), `${file}: ${image} not exported`);

  const [ld] = attr(html, /<script type="application\/ld\+json">(.*?)<\/script>/gs);
  const graph = JSON.parse(ld)['@graph'];
  assert.deepEqual(graph.map((node) => node['@type']), ['WebSite', 'SoftwareApplication', 'FAQPage'], `${file}: structured data`);
  sameHost(graph[1].url, `${file} structured data`);
}

const sitemap = read('out/sitemap.xml');
const locs = attr(sitemap, /<loc>([^<]+)<\/loc>/g);
assert.deepEqual(locs, [`${base}/zh`, `${base}/en`], 'sitemap lists only the two pages');
for (const url of attr(sitemap, /href="([^"]+)"/g)) sameHost(url, 'sitemap');

assert.match(read('out/robots.txt'), new RegExp(`Sitemap: ${base}/sitemap.xml`), 'robots.txt sitemap');

console.log(`seo: ok for ${base}`);
