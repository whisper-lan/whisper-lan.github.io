import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const source = await readFile(new URL('../public/_worker.js', import.meta.url), 'utf8');
const headersFile = await readFile(new URL('../public/_headers', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('mirror _headers sets noindex and root redirects by language', async () => {
  assert.match(headersFile, /X-Robots-Tag:\s*noindex/);
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

test('/api/releases and /download proxy lawnvi/whisper with Range support and reject invalid paths', async () => {
  const apiRes = await worker.fetch(new Request('https://whisper.127014.xyz/api/releases'), {
    fetch: async (url) => {
      assert.equal(url, 'https://api.github.com/repos/lawnvi/whisper/releases?per_page=100&page=1');
      return new Response('[{"tag_name":"dev-v0.0.60"}]', { status: 200 });
    },
  });
  assert.equal(apiRes.status, 200);

  const payload = Buffer.from('0123456789abcdef');
  const dlEnv = {
    fetch: async (url, init) => {
      assert.equal(url, 'https://github.com/lawnvi/whisper/releases/download/dev-v0.0.60/whisper-0.0.60-macos-arm64.dmg');
      assert.equal(init.redirect, 'follow');
      return init.headers.get('Range') === 'bytes=4-7'
        ? new Response(payload.subarray(4, 8), { status: 206, headers: { 'Content-Range': 'bytes 4-7/16' } })
        : new Response(payload, { status: 200, headers: { 'Content-Length': '16' } });
    },
  };

  const full = await worker.fetch(new Request('https://whisper.127014.xyz/download/dev-v0.0.60/whisper-0.0.60-macos-arm64.dmg'), dlEnv);
  assert.equal(full.status, 200);
  assert.deepEqual(Buffer.from(await full.arrayBuffer()), payload);

  const range = await worker.fetch(new Request('https://whisper.127014.xyz/download/dev-v0.0.60/whisper-0.0.60-macos-arm64.dmg', {
    headers: { Range: 'bytes=4-7' },
  }), dlEnv);
  assert.equal(range.status, 206);
  assert.equal(Buffer.from(await range.arrayBuffer()).toString(), '4567');

  for (const bad of ['/download/dev-v0.0.60/..%2Fevil.dmg', '/download/dev-v0.0.60/other.exe', '/download/main/whisper-0.0.60.dmg']) {
    const res = await worker.fetch(new Request(`https://whisper.127014.xyz${bad}`), {
      fetch: async () => assert.fail(`must not call upstream for ${bad}`),
    });
    assert.equal(res.status, 400);
  }
});
