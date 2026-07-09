import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { getMessages, localeToHtmlLang } from "../../lib/i18n";
import type { Locale } from "../../lib/i18n";

const locales: Locale[] = ["zh", "en"];
const visualProjects = new Set(["chromium-390", "chromium-1440"]);

async function box(locator: Locator) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  return bounds!;
}

async function expectFirstViewportLayout(page: Page) {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const header = await box(page.locator("header").first());
  const hero = await box(page.locator(".hero"));
  const name = await box(page.locator(".hero__name"));
  const title = await box(page.locator(".hero__title"));
  const actions = await box(page.locator(".hero__actions"));
  const downloads = await box(page.locator("#downloads"));
  const nextKicker = await box(page.locator("#downloads .section-kicker"));

  expect(header.y + header.height).toBeLessThanOrEqual(hero.y + 1);
  expect(name.y + name.height).toBeLessThanOrEqual(title.y + 1);
  expect(actions.y + actions.height).toBeLessThanOrEqual(hero.y + hero.height + 1);
  expect(downloads.y).toBeGreaterThanOrEqual(hero.y + hero.height - 1);
  expect(nextKicker.y).toBeLessThan(viewport!.height);

  for (const locator of [
    page.locator(".hero__actions a").first(),
    page.locator(".hero__actions a").last(),
    page.locator("header button").first(),
  ]) {
    const bounds = await box(locator);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.width).toBeGreaterThanOrEqual(44);
  }
}

for (const locale of locales) {
  test(`${locale} landing is localized, accessible, and responsive`, async ({ page }) => {
    const messages = getMessages(locale);
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto(`/${locale}`, { waitUntil: "networkidle" });

    await expect(page.locator("html")).toHaveAttribute("lang", localeToHtmlLang(locale));
    await expect(page.getByRole("heading", { level: 1, name: "Whisper" })).toHaveCount(1);
    await expect(page.locator('img[alt]:not([alt=""])')).toHaveCount(4);
    await expect(page.locator(".hero__image")).toHaveJSProperty("complete", true);

    const directAssets = page.locator('a[data-download-asset="true"]');
    if (await directAssets.count()) {
      expect(await directAssets.count()).toBe(10);
      for (const anchor of await directAssets.all()) {
        await expect(anchor).toHaveAttribute(
          "href",
          /^https:\/\/github\.com\/lawnvi\/whisper\/releases\/download\//,
        );
        await expect(anchor).not.toHaveAttribute("download", /.+/);
      }
    } else {
      await expect(page.getByRole("link", { name: messages.download.openReleases })).toHaveAttribute(
        "href",
        "https://github.com/lawnvi/whisper/releases",
      );
    }

    const themeToggle = page.getByRole("button", { name: messages.theme.switchToDark });
    await expect(themeToggle).toBeEnabled();
    await themeToggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("Tab");
    const focusStyle = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) {
        return null;
      }
      const style = getComputedStyle(active);
      return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    expect(focusStyle?.width).toBeGreaterThanOrEqual(2);
    expect(focusStyle?.style).not.toBe("none");

    await page.evaluate(() => window.scrollTo(0, 0));
    await expectFirstViewportLayout(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(
      accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
    ).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${locale} ${theme} first viewport visual`, async ({ page }, testInfo) => {
      test.skip(!visualProjects.has(testInfo.project.name));
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("theme", selectedTheme);
      }, theme);
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page.locator(".hero__image")).toHaveJSProperty("complete", true);
      await page.evaluate(() => window.scrollTo(0, 0));

      await expect(page).toHaveScreenshot(`${locale}-${theme}.png`, {
        animations: "disabled",
        caret: "hide",
        mask: [page.locator(".status-chip")],
        maxDiffPixelRatio: 0.01,
      });
    });
  }
}

test("metadata and public routes are deployable", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-390");

  const response = await page.goto("/en", { waitUntil: "networkidle" });
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://local-whisper.help/en",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    "https://local-whisper.help/zh",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/en\/opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /\/en\/twitter-image/,
  );

  const endpoints = [
    ["/robots.txt", /^text\/plain/],
    ["/sitemap.xml", /^(?:application|text)\/xml/],
    ["/manifest.webmanifest", /^application\/manifest\+json/],
    ["/en/opengraph-image", /^image\/png/],
    ["/en/twitter-image", /^image\/png/],
  ] as const;
  for (const [path, contentType] of endpoints) {
    const endpoint = await request.get(path);
    expect(endpoint.ok(), path).toBe(true);
    expect(endpoint.headers()["content-type"], path).toMatch(contentType);
  }

  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.icons).toEqual([
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ]);
});
