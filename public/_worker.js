// Cloudflare Pages worker: root language redirect, GitHub release API proxy,
// and streaming installer proxy restricted to lawnvi/whisper.

const REPO = 'lawnvi/whisper';
const DOWNLOAD_PATH = /^\/download\/((?:dev-|release-)?v\d+\.\d+\.\d+)\/((?:whisper-[\w.-]+|app-release\.apk))$/;
const INSTALLER_EXT = /\.(?:exe|dmg|deb|rpm|appimage|apk|ipa|ipa\.bak)$/i;
const PASS_HEADERS = ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag', 'Last-Modified'];

const errorJson = (message, status, extra = {}) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { method, headers: reqHeaders } = request;
    const isRead = method === 'GET' || method === 'HEAD';

    if (url.pathname === '/') {
      if (!isRead) return errorJson('Method Not Allowed', 405, { Allow: 'GET, HEAD' });
      const language = reqHeaders.get('accept-language')?.split(',')[0].toLowerCase() || 'en';
      url.pathname = language.startsWith('zh') ? '/zh' : '/en';
      return new Response(null, {
        status: 307,
        headers: { Location: url.toString(), Vary: 'Accept-Language', 'Cache-Control': 'no-store' },
      });
    }

    if (url.pathname === '/api/releases' || url.pathname === '/api/releases/latest') {
      if (!isRead) return errorJson('Method Not Allowed', 405, { Allow: 'GET, HEAD' });
      const suffix = url.pathname.endsWith('/latest') ? '/latest' : '?per_page=100&page=1';
      const fetchImpl = env?.fetch ?? fetch;
      const upstream = await fetchImpl(`https://api.github.com/repos/${REPO}/releases${suffix}`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'whisper-web-mirror' },
        cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 300, '400-599': 0 } },
      }).catch(() => null);
      if (!upstream) return errorJson('Upstream unavailable', 502);
      return new Response(method === 'HEAD' ? null : upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
          'Cache-Control': upstream.ok ? 'public, max-age=300' : 'no-store',
        },
      });
    }

    if (url.pathname === '/download' || url.pathname.startsWith('/download/')) {
      if (!isRead) return errorJson('Method Not Allowed', 405, { Allow: 'GET, HEAD' });
      let decoded = '';
      try { decoded = decodeURIComponent(url.pathname); } catch { return errorJson('Bad path', 400); }
      const match = !decoded.includes('..') && DOWNLOAD_PATH.exec(decoded);
      if (!match || !INSTALLER_EXT.test(match[2])) return errorJson('Invalid release asset', 400);
      const [, tag, filename] = match;
      const upstreamHeaders = new Headers({ Accept: 'application/octet-stream', 'User-Agent': 'whisper-web-mirror' });
      for (const h of ['Range', 'If-Range']) if (reqHeaders.get(h)) upstreamHeaders.set(h, reqHeaders.get(h));
      const fetchImpl = env?.fetch ?? fetch;
      const upstream = await fetchImpl(`https://github.com/${REPO}/releases/download/${tag}/${filename}`, {
        method,
        headers: upstreamHeaders,
        redirect: 'follow',
      }).catch(() => null);
      if (!upstream) return errorJson('Upstream unavailable', 502);
      if (upstream.status !== 200 && upstream.status !== 206) {
        const extra = upstream.headers.get('Content-Range') ? { 'Content-Range': upstream.headers.get('Content-Range') } : {};
        return errorJson('Asset unavailable', upstream.status >= 500 ? 502 : upstream.status, extra);
      }
      const headers = new Headers({
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': upstream.status === 200 && !reqHeaders.has('Range') ? 'public, max-age=86400, immutable' : 'no-store',
      });
      for (const h of PASS_HEADERS) if (upstream.headers.get(h)) headers.set(h, upstream.headers.get(h));
      return new Response(method === 'HEAD' ? null : upstream.body, { status: upstream.status, headers });
    }

    return env?.ASSETS ? env.ASSETS.fetch(request) : errorJson('Not Found', 404);
  },
};

export default worker;
