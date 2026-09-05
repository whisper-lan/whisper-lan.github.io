import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const source = await readFile(new URL('../public/_worker.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('root redirects by language and preserves query parameters without shared caching', async () => {
  for (const [language, target] of [['zh-CN,en;q=0.9', '/zh'], ['en-US,zh;q=0.9', '/en'], ['', '/en']]) {
    const response = await worker.fetch(new Request('https://whisper.example/?from=desktop', {
      headers: { 'Accept-Language': language },
    }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('Location'), `https://whisper.example${target}?from=desktop`);
    assert.equal(response.headers.get('Vary'), 'Accept-Language');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('localized pages and assets pass through without language redirects', async () => {
  for (const path of ['/zh', '/en', '/_next/static/example.js', '/missing']) {
    const request = new Request(`https://whisper.example${path}`);
    const response = new Response('asset');
    assert.equal(await worker.fetch(request, { ASSETS: { fetch: (received) => {
      assert.equal(received, request);
      return response;
    } } }), response);
  }
});
