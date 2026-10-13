# Whisper Web

Whisper Web is the product introduction site for [Whisper](https://github.com/lawnvi/whisper).

The site tells one story: the app icon's ring stands for your local network,
and everything Whisper moves between devices travels inside it. It opens with a
scroll-driven fly-through of that ring, walks through the main features with
live recreations of the app's own screens, and ends where it began, on the
icon. Capability copy follows the app's `README.md` and user guide.

See [DESIGN.md](DESIGN.md) for the concept, visual tokens, the motion system
(smooth scrolling, resting points, sticky cushions), performance rules, how to
add content, and how to verify that scrolling still feels smooth.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

The site exports static HTML into `out/`. Use `npm start` for a local preview,
or `npm run pages:build` to produce `.vercel/output/static`, preserving the
existing Cloudflare Pages output directory. `npm run test:pages` checks the
root language redirect; `npm run test:release-assets` checks package matching.

Cloudflare only runs the small root-language worker for `/`; localized pages,
icons, and the social image are built ahead of time. GitHub release data is
prefetched at build time and refreshed in the browser. Nothing is deployed by
these commands.

`scripts/qa/` holds browser checks for motion and scroll feel (frame times,
resting behaviour, the speed curve after letting go, screenshots). They need a
separately installed Playwright; see the note at the top of
`scripts/qa/browser.mjs` and the table in DESIGN.md.

Next.js and its ESLint configuration are pinned to 15.5.25, with React 19.1.9.
Lenis is pinned to 1.3.26 and was added to the lockfile by hand, because a plain
`npm install lenis` trips over its optional `@nuxt/kit` peer (see DESIGN.md).
The obsolete `next-on-pages` adapter was removed because its supported Next.js
range ends at 15.5.2. Next's PostCSS dependency is overridden to 8.5.28 to avoid
the vulnerable pinned version while remaining within PostCSS 8.

References: [Next.js security release](https://nextjs.org/blog/august-2026-security-release),
[PostCSS advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp),
[Cloudflare static Next.js deployment](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).
