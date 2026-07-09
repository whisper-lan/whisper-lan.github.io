import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { CopyDigest, writeDigestToClipboard } from "../app/components/downloads/copy-digest";
import { DownloadSection } from "../app/components/downloads/download-section";
import { ReleaseFacts } from "../app/components/downloads/release-facts";
import { parseReleaseAssets, selectRelease } from "../lib/release/asset-parser";
import { getMessages } from "../lib/i18n";
import type { ReadyReleaseCatalog, ReleaseCatalog, Verification } from "../lib/release/types";
import commitFixture from "./fixtures/github-commit-dev-v0.0.42.json";
import releaseFixture from "./fixtures/github-release-dev-v0.0.42.json";

function readyCatalog(): ReadyReleaseCatalog {
  const release = selectRelease([releaseFixture]);
  if (!release) {
    throw new Error("Fixture must contain a supported release");
  }

  return {
    status: "ready",
    channel: release.channel,
    tag: release.tag,
    version: release.version,
    releaseUrl: release.releaseUrl,
    publishedAt: release.publishedAt,
    commit: {
      sha: commitFixture.sha,
      url: commitFixture.html_url,
      verification: "unsigned",
    },
    assets: parseReleaseAssets(release.assets),
  };
}

describe("DownloadSection", () => {
  it("renders all ten release assets as direct GitHub anchors without hiding architectures", () => {
    const catalog = readyCatalog();
    const messages = getMessages("en");
    const html = renderToStaticMarkup(
      <DownloadSection catalog={catalog} locale="en" messages={messages} />,
    );

    expect(html.match(/data-download-asset="true"/g)).toHaveLength(10);
    expect(html).toContain('data-platform="windows" data-asset-count="1"');
    expect(html).toContain('data-platform="macos" data-asset-count="1"');
    expect(html).toContain('data-platform="linux" data-asset-count="3"');
    expect(html).toContain('data-platform="android" data-asset-count="4"');
    expect(html).toContain('data-platform="ios" data-asset-count="1"');
    expect(html).toContain("<p>1 build</p>");
    expect(html).not.toContain("<p>1 builds</p>");
    for (const asset of catalog.assets) {
      expect(html).toContain(`href="${asset.url}"`);
      expect(html).toContain(asset.digest);
    }
    expect(html).not.toMatch(/<iframe|<a[^>]*\sdownload(?:=|\s|>)|navigator\.userAgent/i);
  });

  it("shows preview, publication time, commit verification, and separate installer status", () => {
    const catalog = readyCatalog();
    const messages = getMessages("zh");
    const html = renderToStaticMarkup(
      <DownloadSection catalog={catalog} locale="zh" messages={messages} />,
    );

    expect(html).toContain(messages.release.preview);
    expect(html).toMatch(new RegExp(`<time[^>]*dateTime="${catalog.publishedAt}"`));
    expect(html).toContain(`href="${commitFixture.html_url}"`);
    expect(html).toContain(commitFixture.sha.slice(0, 7));
    expect(html).toContain(messages.download.verification.unsigned);
    expect(html).toContain(messages.download.installerSignatureUnknown);
    expect(html).toContain(messages.download.requirements.iosUnsignedSideload);
    expect(html).toContain(messages.download.requirements.iosNotFormallyTested);
  });

  it("uses one honest GitHub fallback when the catalog is unavailable", () => {
    const catalog: ReleaseCatalog = {
      status: "unavailable",
      releasesUrl: "https://github.com/lawnvi/whisper/releases",
    };
    const messages = getMessages("en");
    const html = renderToStaticMarkup(
      <DownloadSection catalog={catalog} locale="en" messages={messages} />,
    );

    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain(`href="${catalog.releasesUrl}"`);
    expect(html).toContain(messages.download.unavailableBody);
    expect(html).not.toMatch(/data-download-asset|v0\.0\.42|<iframe|<a[^>]*\sdownload(?:=|\s|>)/i);
  });

  it("distinguishes every commit state and handles missing commit and digest", () => {
    const messages = getMessages("en");
    const catalog = readyCatalog();
    const states: Array<[Verification, string]> = [
      ["verified", messages.download.verification.verified],
      ["unsigned", messages.download.verification.unsigned],
      ["unverified", messages.download.verification.unverified],
      ["unknown", messages.download.verification.unknown],
    ];

    for (const [verification, label] of states) {
      const html = renderToStaticMarkup(
        <ReleaseFacts
          catalog={{ ...catalog, commit: { ...catalog.commit!, verification } }}
          locale="en"
          messages={messages}
        />,
      );
      expect(html).toContain(label);
    }

    const noCommitHtml = renderToStaticMarkup(
      <ReleaseFacts
        catalog={{ ...catalog, commit: null }}
        locale="en"
        messages={messages}
      />,
    );
    expect(noCommitHtml).toContain(messages.download.commitUnavailable);

    const noDigestHtml = renderToStaticMarkup(
      <DownloadSection
        catalog={{
          ...catalog,
          assets: catalog.assets.map((asset, index) =>
            index === 0 ? { ...asset, digest: null } : asset,
          ),
        }}
        locale="en"
        messages={messages}
      />,
    );
    expect(noDigestHtml).toContain(messages.download.digestUnavailable);
  });

  it("reports clipboard failure instead of claiming success", async () => {
    const digest = "sha256:1bb551b4d9f42bf64905df8f234f480ec53ab336004ab5f9cbcbcf5653f8f471";
    const success = { writeText: vi.fn().mockResolvedValue(undefined) };
    const failure = { writeText: vi.fn().mockRejectedValue(new Error("denied")) };

    await expect(writeDigestToClipboard(digest, success)).resolves.toBe(true);
    await expect(writeDigestToClipboard(digest, failure)).resolves.toBe(false);
    await expect(writeDigestToClipboard(digest, undefined)).resolves.toBe(false);
    expect(success.writeText).toHaveBeenCalledWith(digest);

    const messages = getMessages("en");
    const html = renderToStaticMarkup(
      <CopyDigest
        digest={digest}
        copyLabel={messages.download.copyDigest}
        copiedLabel={messages.download.digestCopied}
        failedLabel={messages.download.digestCopyFailed}
      />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('class="copy-digest__status"');
    expect(html).not.toContain('class="sr-only" role="status"');
  });

  it("defines mobile-safe download controls and wrapping", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.download-asset\s*\{[^}]*min-height:\s*2\.75rem/s);
    expect(css).toMatch(/\.download-asset--recommended\s*\{[^}]*min-height:\s*3rem/s);
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toMatch(/\.download-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  });
});
