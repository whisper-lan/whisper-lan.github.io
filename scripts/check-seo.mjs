import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// Checks the exported site in out/ (run `npm run build` first). Every absolute
// URL a crawler or link preview follows must point at the live domain: the site
// once shipped canonical, hreflang and sitemap URLs on a domain that no longer
// existed, and nothing noticed.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || read('lib/constants.ts').match(/NEXT_PUBLIC_SITE_DOMAIN \|\| '([^']+)'/)[1];
const base = `https://${domain}`;

const slugs = [...read('lib/features.ts').matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const pages = ['zh', 'en'].flatMap((lang) => [`/${lang}`, ...slugs.map((slug) => `/${lang}/${slug}`)]);

const attr = (html, pattern) => [...html.matchAll(pattern)].map((m) => m[1]);
const sameHost = (url, where) => assert.equal(new URL(url).host, domain, `${where}: ${url} is not on ${domain}`);

for (const page of pages) {
  const file = `out${page}.html`;
  const lang = page.startsWith('/zh') ? 'zh-CN' : 'en';
  const home = page === '/zh' || page === '/en';
  const html = read(file);
  const head = html.split('</head>')[0];
  assert.match(html, new RegExp(`<html lang="${lang}"`), `${file}: html lang should be ${lang}`);
  assert.deepEqual(attr(head, /<link rel="canonical" href="([^"]+)"/g), [`${base}${page}`], `${file}: canonical`);

  const alternates = attr(head, /<link rel="alternate" hrefLang="([^"]+)"/g).sort();
  assert.deepEqual(alternates, home ? ['en', 'x-default', 'zh'] : ['en', 'zh'], `${file}: hreflang set`);
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
  assert.deepEqual(graph.map((node) => node['@type']), home ? ['WebSite', 'SoftwareApplication', 'FAQPage'] : ['WebPage', 'BreadcrumbList', 'FAQPage'], `${file}: structured data`);
  sameHost(graph[home ? 1 : 0].url, `${file} structured data`);
}

const sitemap = read('out/sitemap.xml');
const locs = attr(sitemap, /<loc>([^<]+)<\/loc>/g);
assert.deepEqual([...locs].sort(), pages.map((page) => `${base}${page}`).sort(), 'sitemap lists exactly the pages');
for (const url of attr(sitemap, /href="([^"]+)"/g)) sameHost(url, 'sitemap');

assert.match(read('out/robots.txt'), new RegExp(`Sitemap: ${base}/sitemap.xml`), 'robots.txt sitemap');

const rootHtml = read('out/index.html');
const rootHead = rootHtml.split('</head>')[0];
assert.match(rootHtml, /<html lang="en"/, 'index.html defaults to en');
assert.deepEqual(attr(rootHead, /<link rel="canonical" href="([^"]+)"/g), [`${base}/en`], 'index.html canonicalizes to /en');
for (const h of [rootHead, read('out/en.html').split('</head>')[0], read('out/zh.html').split('</head>')[0]]) {
  assert.deepEqual(
    attr(h, /<meta name="google-site-verification" content="([^"]+)"/g),
    ['gJ0X0mz1HEMkXhsmp1a7cDFbbS88lOGI2RcLJVxDIuo'],
    'missing google-site-verification meta tag in <head>',
  );
}
for (const iconHref of attr(rootHead, /<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) {
  const iconPath = new URL(iconHref, base).pathname;
  assert.match(iconPath, /\.(?:ico|png)$/, `icon ${iconPath} must have a file extension`);
  assert.ok(existsSync(new URL(`../out${iconPath}`, import.meta.url)), `icon ${iconPath} not exported`);
}

console.log(`seo: ok for ${pages.length} pages on ${base}`);
