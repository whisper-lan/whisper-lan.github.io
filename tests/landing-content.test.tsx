import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Capabilities } from "../app/components/capabilities";
import { Faq } from "../app/components/faq";
import { Hero } from "../app/components/hero";
import { PlatformSupport } from "../app/components/platform-support";
import { ProductGallery } from "../app/components/product-gallery";
import { getMessages } from "../lib/i18n";
import type { ReleaseCatalog } from "../lib/release/types";

const catalog: ReleaseCatalog = {
  status: "ready",
  channel: "preview",
  tag: "dev-v0.0.42",
  version: "0.0.42",
  releaseUrl: "https://github.com/lawnvi/whisper/releases/tag/dev-v0.0.42",
  publishedAt: "2026-07-08T16:27:45Z",
  commit: null,
  assets: [],
};

describe("landing product narrative", () => {
  it("renders one Whisper heading and uses the real product image in the hero", () => {
    const messages = getMessages("zh");
    const html = renderToStaticMarkup(
      <Hero locale="zh" messages={messages} catalog={catalog} />,
    ).replaceAll("%2F", "/");

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Whisper<\/h1>/);
    expect(html).toContain("/product/app-icon.png");
    expect(html).toContain("/product/file-share.png");
    expect(html).toContain(`alt="${messages.hero.productAlt}"`);
    expect(html).toContain('href="#downloads"');
  });

  it("renders all three inspectable screenshots with localized alternative text", () => {
    const messages = getMessages("en");
    const html = renderToStaticMarkup(
      <ProductGallery locale="en" messages={messages} />,
    ).replaceAll("%2F", "/");

    for (const [path, alt] of [
      ["/product/file-share.png", messages.gallery.items.file.alt],
      ["/product/audio-share.png", messages.gallery.items.audio.alt],
      ["/product/keyboard-share.png", messages.gallery.items.input.alt],
    ]) {
      expect(html).toContain(path);
      expect(html).toContain(`alt="${alt}"`);
      expect(html).toContain(`href="${path}"`);
    }
  });

  it("uses native FAQ disclosure and evidence-backed capability and platform copy", () => {
    const messages = getMessages("zh");
    const html = renderToStaticMarkup(
      <>
        <Capabilities locale="zh" messages={messages} />
        <PlatformSupport locale="zh" messages={messages} />
        <Faq locale="zh" messages={messages} />
      </>,
    );

    expect(html.match(/<details\b/g)).toHaveLength(6);
    expect(html).toContain(messages.capabilities.items.notifications.title);
    expect(html).toContain(messages.platforms.items.linux.requirements);
    expect(html).toContain(messages.platforms.items.ios.requirements);
    expect(html).not.toMatch(/\b(?:ftp|alpha|rating|review)\b|安全徽章/i);
  });

  it("keeps visual rules restrained and responsive", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(css).toContain("--radius: 8px");
    expect(css).toContain("grid-template-columns: minmax(0, 2fr) minmax(8rem, 1fr)");
    expect(css).toContain("object-position: left top");
    expect(css).toContain("object-position: right top");
    expect(css).toContain("calc(100svh - 8rem)");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toMatch(/(?:linear|radial)-gradient|backdrop-filter|filter:\s*blur/i);
    expect(css).not.toMatch(/letter-spacing:\s*-/);
    expect(css).not.toMatch(/font-size:[^;]*vw/);
    expect(css).not.toMatch(/border-radius:\s*(?:[9]\d*|[1-9]\d{2,})px/);
  });

  it("does not replace product evidence with a large inline illustration", () => {
    const messages = getMessages("en");
    const html = renderToStaticMarkup(
      <>
        <Hero locale="en" messages={messages} catalog={catalog} />
        <Capabilities locale="en" messages={messages} />
      </>,
    );

    expect(html).not.toMatch(/<svg[^>]*(?:width|height)="(?:[1-9]\d{2,})"/i);
  });
});
