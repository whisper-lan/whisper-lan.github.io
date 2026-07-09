# Whisper Web

Whisper Web is the localized product and download site for [Whisper](https://github.com/lawnvi/whisper), a collaboration app for devices on the same trusted local network.

The site presents the current GitHub Release catalog, direct platform assets, published SHA-256 digests, and the platform limits that can be verified from the repository. Whisper currently has no end-to-end encryption and should not be used to transfer sensitive content on an untrusted network.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root path redirects to `/zh` or `/en` using the browser language preference.

## Verification

```bash
npm run check
npm run test:e2e
```

`npm run check` runs the production dependency audit, ESLint, unit tests, and the production build. End-to-end tests run the production server on `127.0.0.1:4173` and require Playwright Chromium.
