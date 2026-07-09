import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { getMessages, localeToHtmlLang } from "../../lib/i18n";
import type { Locale } from "../../lib/i18n";

const locales: Locale[] = ["zh", "en"];
const themes = ["light", "dark"] as const;
const visualProjects = new Set(["chromium-390", "chromium-1440"]);
const mobileSceneProjects = new Set(["chromium-320", "chromium-390"]);
const visualBaselinePlatforms = new Set<NodeJS.Platform>(["darwin", "linux"]);
const interactiveSelector =
  'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])';

async function box(locator: Locator) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  return bounds!;
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

async function waitForVisualReady(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

async function expectFirstViewportLayout(page: Page) {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const header = await box(page.locator("header").first());
  const hero = await box(page.locator(".hero"));
  const media = await box(page.locator(".hero__media"));
  const meta = await box(page.locator(".hero__meta"));
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
  if (viewport!.width <= 767) {
    expect(media.y + media.height).toBeLessThanOrEqual(meta.y + 1);
  }
}

async function expectProductImagesLoaded(
  page: Page,
  selector = ".hero__media img, .product-shot img",
) {
  const images = page.locator(selector);
  expect(await images.count()).toBeGreaterThan(0);
  let visibleImages = 0;
  for (const image of await images.all()) {
    if (!(await image.isVisible())) {
      continue;
    }
    visibleImages += 1;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    const dimension = await image.evaluate((element) => {
      const target = element as HTMLImageElement;
      return {
        complete: target.complete,
        naturalWidth: target.naturalWidth,
        naturalHeight: target.naturalHeight,
      };
    });
    expect(dimension.complete).toBe(true);
    expect(dimension.naturalWidth).toBeGreaterThan(0);
    expect(dimension.naturalHeight).toBeGreaterThan(0);
  }
  expect(visibleImages).toBeGreaterThan(0);
}

async function renderedPixelStats(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  await waitForVisualReady(page);
  const screenshot = await page.screenshot({
    animations: "disabled",
    clip,
  });

  return page.evaluate(async (dataUrl) => {
    const response = await fetch(dataUrl);
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Unable to inspect rendered hero pixels");
    }
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const rowStep = 2;
    const columnStep = 2;
    let sampledPixels = 0;
    let productPixels = 0;
    let activeRows = 0;
    let sampledRows = 0;

    for (let y = 0; y < canvas.height; y += rowStep) {
      let rowProductPixels = 0;
      let rowPixels = 0;
      for (let x = 0; x < canvas.width; x += columnStep) {
        const offset = (y * canvas.width + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const colorful = Math.max(red, green, blue) - Math.min(red, green, blue) > 20;
        const ink = Math.min(red, green, blue) < 225;
        if (colorful || ink) {
          productPixels += 1;
          rowProductPixels += 1;
        }
        sampledPixels += 1;
        rowPixels += 1;
      }
      if (rowProductPixels / rowPixels > 0.02) {
        activeRows += 1;
      }
      sampledRows += 1;
    }

    return {
      activeRowRatio: activeRows / sampledRows,
      productPixelRatio: productPixels / sampledPixels,
    };
  }, `data:image/png;base64,${screenshot.toString("base64")}`);
}

async function expectMobileProductScene(page: Page) {
  const viewport = page.viewportSize();
  expect([320, 390]).toContain(viewport?.width);
  const media = await box(page.locator(".hero__media"));
  const stats = await renderedPixelStats(page, {
    x: media.x,
    y: media.y,
    width: media.width,
    height: media.height,
  });

  expect(stats.activeRowRatio).toBeGreaterThan(0.45);
  expect(stats.productPixelRatio).toBeGreaterThan(0.06);
}

async function expectInteractiveTargets(page: Page) {
  const targets = await page.locator(interactiveSelector).evaluateAll((elements) => {
    const visibleElements = elements.filter((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        bounds.width > 0 &&
        bounds.height > 0
      );
    });

    return visibleElements.map((element) => {
      const target = element as HTMLElement;
      target.focus({ focusVisible: true } as FocusOptions & { focusVisible: boolean });
      const bounds = element.getBoundingClientRect();
      const focusStyle = getComputedStyle(element);
      return {
        isFocused: document.activeElement === element,
        isFocusVisible: element.matches(":focus-visible"),
        height: bounds.height,
        label:
          element.getAttribute("aria-label") ||
          element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
          element.tagName,
        outlineStyle: focusStyle.outlineStyle,
        outlineWidth: Number.parseFloat(focusStyle.outlineWidth),
        width: bounds.width,
      };
    });
  });

  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(target.width, `${target.label} width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.label} height`).toBeGreaterThanOrEqual(44);
    expect(target.isFocused, target.label).toBe(true);
    expect(target.isFocusVisible, target.label).toBe(true);
    expect(target.outlineStyle, target.label).not.toBe("none");
    expect(target.outlineWidth, target.label).toBeGreaterThanOrEqual(2);
  }
}

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(
    accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
  ).toEqual([]);
}

function pngDimensions(bytes: Buffer) {
  expect(bytes.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

for (const locale of locales) {
  test(`${locale} landing is localized and responsive`, async ({ page }, testInfo) => {
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
    await expect(page.getByRole("img", { name: messages.hero.productAlt })).toHaveCount(1);
    await expect(page.locator('img[alt]:not([alt=""])')).toHaveCount(4);
    await expectProductImagesLoaded(page);

    const directAssets = page.locator('a[data-download-asset="true"]');
    if (await directAssets.count()) {
      expect(await directAssets.count()).toBeGreaterThan(0);
      for (const anchor of await directAssets.all()) {
        await expect(anchor).toHaveAttribute(
          "href",
          /^https:\/\/github\.com\/lawnvi\/whisper\/releases\/download\//,
        );
        expect(await anchor.getAttribute("download")).toBeNull();
      }
    } else {
      await expect(page.getByRole("link", { name: messages.download.openReleases })).toHaveAttribute(
        "href",
        "https://github.com/lawnvi/whisper/releases",
      );
    }

    await scrollToTop(page);
    await expectFirstViewportLayout(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (locale === "zh" && mobileSceneProjects.has(testInfo.project.name)) {
      await expectMobileProductScene(page);
    }
    expect(consoleErrors).toEqual([]);
  });

  test(`${locale} controls and WCAG checks pass in light and dark themes`, async ({ page }) => {
    const messages = getMessages(locale);
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "light");
    });
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });

    for (const theme of themes) {
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expectInteractiveTargets(page);
      await expectNoSeriousAccessibilityViolations(page);
      if (theme === "light") {
        await page.getByRole("button", { name: messages.theme.switchToDark }).click();
      }
    }
    expect(consoleErrors).toEqual([]);
  });

  for (const theme of themes) {
    test(`${locale} ${theme} first viewport visual`, async ({ page }, testInfo) => {
      test.skip(!visualProjects.has(testInfo.project.name));
      test.skip(
        !visualBaselinePlatforms.has(process.platform),
        "Snapshot baselines are maintained on macOS and Linux",
      );
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("theme", selectedTheme);
      }, theme);
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expectProductImagesLoaded(page, ".hero__media img");
      await scrollToTop(page);
      await waitForVisualReady(page);

      await expect(page).toHaveScreenshot(`${locale}-${theme}.png`, {
        animations: "disabled",
        caret: "hide",
        mask: [page.locator(".status-chip")],
        maskColor: "#d9dde3",
        maxDiffPixelRatio: 0.01,
      });
    });
  }
}

test("metadata and public routes are deployable", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-390");

  for (const locale of locales) {
    const messages = getMessages(locale);
    const response = await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://local-whisper.help/${locale}`,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
      "href",
      "https://local-whisper.help/zh",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      new RegExp(`/${locale}/opengraph-image`),
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      messages.hero.productAlt,
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      new RegExp(`/${locale}/twitter-image`),
    );
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
      "content",
      messages.hero.productAlt,
    );
  }

  const endpoints = [
    ["/robots.txt", /^text\/plain/],
    ["/sitemap.xml", /^(?:application|text)\/xml/],
    ["/manifest.webmanifest", /^application\/manifest\+json/],
  ] as const;
  for (const [path, contentType] of endpoints) {
    const endpoint = await request.get(path);
    expect(endpoint.ok(), path).toBe(true);
    expect(endpoint.headers()["content-type"], path).toMatch(contentType);
  }

  for (const locale of locales) {
    for (const kind of ["opengraph-image", "twitter-image"] as const) {
      const path = `/${locale}/${kind}`;
      const image = await request.get(path);
      expect(image.ok(), path).toBe(true);
      expect(image.headers()["content-type"], path).toMatch(/^image\/png/);
      const bytes = await image.body();
      expect(bytes.byteLength, path).toBeGreaterThan(10 * 1024);
      expect(pngDimensions(bytes), path).toEqual({ width: 1200, height: 630 });
      const cacheControl = image.headers()["cache-control"] ?? "";
      expect(cacheControl, path).not.toMatch(/immutable/i);
      expect(cacheControl, path).toMatch(/(?:^|,\s*)max-age=0(?:,|$)/i);
      const sharedMaxAge = Number(cacheControl.match(/(?:^|,\s*)s-maxage=(\d+)/i)?.[1]);
      expect(sharedMaxAge, path).toBeGreaterThan(0);
      expect(sharedMaxAge, path).toBeLessThanOrEqual(86_400);
      expect(cacheControl, path).toMatch(/stale-while-revalidate=\d+/i);
    }
  }

  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.icons).toEqual([
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ]);
});
