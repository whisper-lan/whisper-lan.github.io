import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "../app/components/site-header";
import { getMessages } from "../lib/i18n";
import { config, middleware } from "../middleware";

const repositoryRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

function source(path: string): string {
  return readFileSync(join(repositoryRoot, path), "utf8");
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("locale server boundaries", () => {
  it("uses the locale segment as the only root layout and page", () => {
    expect(existsSync(join(repositoryRoot, "app/layout.tsx"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "app/page.tsx"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "app/[lang]/layout.tsx"))).toBe(true);

    const layout = source("app/[lang]/layout.tsx");
    expect(layout).toMatch(/params:\s*Promise<\{\s*lang:\s*string\s*\}>/);
    expect(layout).toMatch(/const\s+\{\s*lang\s*\}\s*=\s*await\s+params/);
    expect(layout).toContain("localeToHtmlLang(locale)");
    expect(layout).toContain("notFound()");
  });

  it("keeps the locale page on the server and gets one catalog for its child view", () => {
    const page = source("app/[lang]/page.tsx");

    expect(page).not.toMatch(/^["']use client["']/m);
    expect(page).toContain("const catalog = await getReleaseCatalog()");
    expect(page).toContain("catalog={catalog}");
    expect(page).toContain("locale={locale}");
  });

  it("redirects only the root path using the preferred supported language", () => {
    expect(config).toEqual({ matcher: "/" });

    const zhResponse = middleware(
      new NextRequest("https://local-whisper.help/", {
        headers: { "accept-language": "en;q=0.5, zh-CN;q=0.9" },
      }),
    );
    const enResponse = middleware(
      new NextRequest("https://local-whisper.help/", {
        headers: { "accept-language": "en-US,en;q=0.8" },
      }),
    );
    const nonRootResponse = middleware(
      new NextRequest("https://local-whisper.help/en", {
        headers: { "accept-language": "zh-CN" },
      }),
    );

    expect(zhResponse.headers.get("location")).toBe("https://local-whisper.help/zh");
    expect(enResponse.headers.get("location")).toBe("https://local-whisper.help/en");
    expect(nonRootResponse.headers.get("location")).toBeNull();
  });

  it("renders URL locale links and a stable theme control in the server header", () => {
    const html = renderToStaticMarkup(
      createElement(SiteHeader, { locale: "zh", messages: getMessages("zh") }),
    );

    expect(html).toContain('href="/zh"');
    expect(html).toContain('href="/en"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="正在读取主题"');
  });

  it("limits client boundaries to the theme provider and theme toggle", () => {
    const appRoot = join(repositoryRoot, "app");
    const clientFiles = sourceFiles(appRoot)
      .filter((path) => /^["']use client["'];?/m.test(readFileSync(path, "utf8")))
      .map((path) => relative(repositoryRoot, path))
      .sort();

    expect(clientFiles).toEqual([
      "app/components/ThemeProvider.tsx",
      "app/components/theme-toggle.tsx",
    ]);
  });

  it("removes the duplicate stores and their runtime dependencies", () => {
    const manifest = JSON.parse(source("package.json")) as {
      dependencies?: Record<string, string>;
    };

    expect(manifest.dependencies).not.toHaveProperty("framer-motion");
    expect(manifest.dependencies).not.toHaveProperty("zustand");
    expect(existsSync(join(repositoryRoot, "hooks/useLanguage.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "hooks/useTheme.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "app/components/ThemeToggle.tsx"))).toBe(false);
  });
});
