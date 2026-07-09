# Whisper Web

Whisper Web is the localized product and download site for [Whisper](https://github.com/lawnvi/whisper), a collaboration app for devices on the same trusted local network.

The site presents the current GitHub Release catalog, direct platform assets, published SHA-256 digests, and the platform limits that can be verified from the repository. Whisper currently has no end-to-end encryption and should not be used to transfer sensitive content on an untrusted network.

## Development

```bash
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root path redirects to `/zh` or `/en` using the browser language preference.

## Verification

```bash
npm run check
npm run test:e2e
```

`npm run check` runs the production dependency audit, ESLint, unit tests, and the production build. End-to-end tests run the production server on `127.0.0.1:4173` and require Playwright Chromium.

Visual snapshots have separate macOS and Linux baselines. The regular command compares the baseline for the current supported platform with the pinned Playwright 1.61.1 Chromium build. CI executes Linux visual assertions inside `mcr.microsoft.com/playwright:v1.61.1-noble`; run the same environment locally with:

```bash
npm run test:e2e:linux
```

Regenerate only the Linux visual baselines with `npm run test:e2e:linux:update`. Windows runs skip pixel snapshots because no Windows baseline is maintained, while all responsive layout, light/dark accessibility, image decoding, metadata, and route checks continue to run.
