// Cloudflare Pages advanced mode: only the root language redirect needs a worker.
const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      const language = request.headers.get('accept-language')?.split(',')[0].toLowerCase() || 'en';
      url.pathname = language.startsWith('zh') ? '/zh' : '/en';
      return new Response(null, {
        status: 307,
        headers: { Location: url.toString(), Vary: 'Accept-Language', 'Cache-Control': 'no-store' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
