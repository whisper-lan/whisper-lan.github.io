# Whisper Web

Whisper Web is the product introduction site for [Whisper](https://github.com/lawnvi/whisper).

It highlights the latest app capabilities:

- End-to-end encrypted LAN sessions with visible trusted-device state
- Android system share, desktop context-menu send, and global quick-send hotkeys
- QR pairing with endpoint/identity confirmation and connection diagnostics
- Resumable large-file transfers with streaming SHA-256 verification
- Full-screen images, inline audio, system video playback, and multi-select message deletion
- Transfer assistant with folders, full-text search, favorites, and optional clipboard sync
- Bidirectional multi-device clipboard with latest-copy-wins semantics and paste-triggered file transfer
- Unified Android foreground status and notification forwarding
- Desktop system audio sharing
- Multi-device desktop keyboard and mouse sharing with reliable macOS Caps Lock forwarding

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
prefetched at build time and refreshed in the browser. The layout, language
URLs, and download choices are retained. Nothing is deployed by these commands.

Next.js and its ESLint configuration are pinned to 15.5.25, with React 19.1.9.
The obsolete `next-on-pages` adapter was removed because its supported Next.js
range ends at 15.5.2. Next's PostCSS dependency is overridden to 8.5.28 to avoid
the vulnerable pinned version while remaining within PostCSS 8.

References: [Next.js security release](https://nextjs.org/blog/august-2026-security-release),
[PostCSS advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp),
[Cloudflare static Next.js deployment](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).
