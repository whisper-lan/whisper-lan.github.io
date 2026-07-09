import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import manifest from "../app/manifest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import StructuredData from "../app/components/StructuredData";
import { SITE_CONFIG } from "../lib/constants";
import { getMessages } from "../lib/i18n";
import { buildLocalizedMetadata } from "../lib/metadata";
import type { ReadyReleaseCatalog, ReleaseCatalog } from "../lib/release/types";
import nextConfig from "../next.config";
import playwrightConfig from "../playwright.config";

const repositoryRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

const readyCatalog: ReadyReleaseCatalog = {
  status: "ready",
  channel: "preview",
  tag: "dev-v0.0.42",
  version: "0.0.42",
  releaseUrl: "https://github.com/lawnvi/whisper/releases/tag/dev-v0.0.42",
  publishedAt: "2026-07-08T16:27:45Z",
  commit: null,
  assets: [],
};

function jsonLd(catalog: ReleaseCatalog): Record<string, unknown> {
  const html = renderToStaticMarkup(
    <StructuredData locale="en" catalog={catalog} />,
  );
  const match = html.match(/<script[^>]*>(.*)<\/script>/);
  if (!match) {
    throw new Error("Structured data script not found");
  }
  return JSON.parse(match[1]) as Record<string, unknown>;
}

function pngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("localized metadata", () => {
  it("publishes canonical, language alternates, and separate social image routes", () => {
    for (const locale of ["zh", "en"] as const) {
      const metadata = buildLocalizedMetadata(locale);
      const serialized = JSON.stringify(metadata);

      expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.baseUrl}/${locale}`);
      expect(metadata.alternates?.languages).toEqual({
        "x-default": `${SITE_CONFIG.baseUrl}/`,
        "zh-CN": `${SITE_CONFIG.baseUrl}/zh`,
        en: `${SITE_CONFIG.baseUrl}/en`,
      });
      expect(serialized).toContain(`/${locale}/opengraph-image`);
      expect(serialized).toContain(`/${locale}/twitter-image`);
      expect(serialized).toContain("/manifest.webmanifest");
      expect(serialized).not.toContain("og-image.jpg");
      expect(metadata.openGraph).toMatchObject({
        images: [{ alt: getMessages(locale).hero.productAlt }],
      });
      expect(metadata.twitter).toMatchObject({
        images: [{ alt: getMessages(locale).hero.productAlt }],
      });
    }
  });

  it("uses locale-aware structured data without invented proof", () => {
    const ready = jsonLd(readyCatalog);
    expect(ready).toMatchObject({
      "@type": "SoftwareApplication",
      name: "Whisper",
      softwareVersion: "0.0.42",
      datePublished: "2026-07-08T16:27:45Z",
      downloadUrl: readyCatalog.releaseUrl,
    });

    const unavailable = jsonLd({
      status: "unavailable",
      releasesUrl: "https://github.com/lawnvi/whisper/releases",
    });
    expect(unavailable).not.toHaveProperty("softwareVersion");
    expect(unavailable).not.toHaveProperty("datePublished");
    expect(unavailable).not.toHaveProperty("downloadUrl");

    const serialized = JSON.stringify([ready, unavailable]);
    expect(serialized).not.toMatch(/aggregateRating|review|ftp|secure|安全/i);
  });
});

describe("metadata routes and assets", () => {
  it("lists only localized pages without synthetic modification dates", () => {
    const entries = sitemap();
    expect(entries.map(({ url }) => url)).toEqual([
      `${SITE_CONFIG.baseUrl}/zh`,
      `${SITE_CONFIG.baseUrl}/en`,
    ]);
    expect(entries.every(({ lastModified }) => lastModified === undefined)).toBe(true);
    expect(entries.every(({ alternates }) => alternates?.languages?.["x-default"] === `${SITE_CONFIG.baseUrl}/`)).toBe(true);
    expect(readFileSync(join(repositoryRoot, "app/sitemap.ts"), "utf8")).not.toContain(
      "new Date",
    );
  });

  it("uses stable real icon URLs in the web manifest", () => {
    const result = manifest();
    expect(result.icons).toEqual([
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ]);
    expect(pngSize(join(repositoryRoot, "public/icon-192.png"))).toEqual({
      width: 192,
      height: 192,
    });
    expect(pngSize(join(repositoryRoot, "public/icon-512.png"))).toEqual({
      width: 512,
      height: 512,
    });
    expect(pngSize(join(repositoryRoot, "app/icon.png"))).toEqual({
      width: 512,
      height: 512,
    });
    expect(pngSize(join(repositoryRoot, "app/apple-icon.png"))).toEqual({
      width: 512,
      height: 512,
    });
  });

  it("serves robots from one typed route and removes obsolete public metadata", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
      host: SITE_CONFIG.baseUrl,
    });
    for (const path of [
      "public/robots.txt",
      "public/manifest.json",
      "vercel.json",
      "app/favicon.tsx",
      "app/favicon.ico",
      "public/file.svg",
      "public/globe.svg",
      "public/next.svg",
      "public/vercel.svg",
      "public/window.svg",
    ]) {
      expect(existsSync(join(repositoryRoot, path)), path).toBe(false);
    }
  });

  it("has distinct social image handlers backed by the real product assets", () => {
    for (const path of [
      "app/[lang]/opengraph-image/route.tsx",
      "app/[lang]/twitter-image/route.tsx",
    ]) {
      expect(existsSync(join(repositoryRoot, path)), path).toBe(true);
      expect(readFileSync(join(repositoryRoot, path), "utf8")).not.toMatch(
        /export\s+const\s+alt\s*=/,
      );
    }
    expect(existsSync(join(repositoryRoot, "app/[lang]/opengraph-image.tsx"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "app/[lang]/twitter-image.tsx"))).toBe(false);
    const source = readFileSync(join(repositoryRoot, "lib/social-image.tsx"), "utf8");
    expect(source).toContain("public/product/app-icon.png");
    expect(source).toContain("public/product/file-share.png");
  });
});

describe("site delivery configuration", () => {
  it("keeps output tracing in this repository and serves one header policy", async () => {
    expect(nextConfig.outputFileTracingRoot).toBe(repositoryRoot);
    const headers = await nextConfig.headers?.();
    expect(headers).toEqual([
      {
        source: "/:path*",
        headers: expect.arrayContaining([
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ]),
      },
    ]);
  });

  it("documents verification without pinning an application version", () => {
    const readme = readFileSync(join(repositoryRoot, "README.md"), "utf8");
    expect(readme).toContain("npm run check");
    expect(readme).toContain("npm run test:e2e");
    expect(readme).toContain("npx playwright install chromium");
    expect(readme).toContain("Playwright 1.61.1");
    expect(readme).toMatch(/macOS[^\n]*snapshot|snapshot[^\n]*macOS/i);
    expect(readme).not.toMatch(/\b0\.0\.(?:29|42)\b/);
  });

  it("keeps live release assertions independent from fixture asset counts", () => {
    const source = readFileSync(join(repositoryRoot, "tests/e2e/landing.spec.ts"), "utf8");
    expect(source).not.toMatch(/directAssets\.count\(\)\)\.toBe\(10\)/);
    expect(source).toContain('getAttribute("download")');
    expect(source).toContain("toBeNull()");
  });

  it("keeps macOS and Linux visual baselines distinct and executable", () => {
    expect(playwrightConfig.snapshotPathTemplate).toContain("{platform}");
    expect(playwrightConfig.use?.launchOptions?.args).toContain("--disable-gpu");
    const source = readFileSync(join(repositoryRoot, "tests/e2e/landing.spec.ts"), "utf8");
    expect(source).toContain('["darwin", "linux"]');
    expect(source).not.toContain('process.platform !== "darwin"');

    const workflow = readFileSync(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8");
    const runner = readFileSync(join(repositoryRoot, "script/test-e2e-linux.sh"), "utf8");
    expect(runner).toContain("--env CI=1");
    expect(workflow).toContain("options: --ipc=host");
    for (const content of [workflow, runner, readFileSync(join(repositoryRoot, "README.md"), "utf8")]) {
      expect(content).toContain("mcr.microsoft.com/playwright:v1.61.1-noble");
    }
  });
});
