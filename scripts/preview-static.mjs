import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('out');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const workerSource = await readFile(new URL('../public/_worker.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/') {
      const redirect = await worker.fetch(new Request(url, { headers: request.headers }));
      // Relative Location keeps local previews on their own port.
      const location = new URL(redirect.headers.get('Location'));
      response.writeHead(redirect.status, { Location: location.pathname + location.search, Vary: 'Accept-Language' });
      response.end();
      return;
    }
    const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!path.startsWith(root + sep) || url.pathname.startsWith('/_worker')) {
      response.writeHead(404).end();
      return;
    }
    const candidates = [path, path + '.html', resolve(path, 'index.html')];
    for (const candidate of candidates) {
      if (!(await stat(candidate).catch(() => null))?.isFile()) continue;
      const content = await readFile(candidate);
      response.writeHead(200, { 'Content-Type': types[extname(candidate)] ||
        (['/icon', '/apple-icon', '/opengraph-image'].includes(url.pathname) ? 'image/png' : 'application/octet-stream') });
      response.end(content);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(await readFile(resolve(root, '404.html')));
  } catch {
    response.writeHead(500).end();
  }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Static preview: http://127.0.0.1:${process.env.PORT || 3000}`);
});
