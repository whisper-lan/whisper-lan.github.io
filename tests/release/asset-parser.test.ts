import { describe, expect, it } from "vitest";

import {
  parseReleaseAssets,
  selectRelease,
} from "../../lib/release/asset-parser";
import { getSystemRequirementKeys } from "../../lib/release/system-requirements";
import releaseFixture from "../fixtures/github-release-dev-v0.0.42.json";

const releaseDownloadBase =
  "https://github.com/lawnvi/whisper/releases/download/dev-v0.0.42";

describe("parseReleaseAssets", () => {
  it("preserves all ten real release assets and their valid digests", () => {
    const assets = parseReleaseAssets(releaseFixture.assets);

    expect(assets).toHaveLength(10);
    expect(assets.filter(({ platform }) => platform === "linux")).toHaveLength(3);
    expect(assets.filter(({ platform }) => platform === "android")).toHaveLength(4);
    expect(assets.filter(({ platform }) => platform === "ios")).toEqual([
      expect.objectContaining({
        name: "whisper-0.0.42-ios-unsigned.ipa",
        recommended: false,
      }),
    ]);
    expect(assets.every(({ digest }) => /^sha256:[a-f0-9]{64}$/.test(digest ?? ""))).toBe(
      true,
    );
    expect(assets.filter(({ recommended }) => recommended).map(({ name }) => name)).toEqual([
      "whisper-0.0.42-windows-x86_64.exe",
      "whisper-0.0.42-macos-x86_64.dmg",
      "whisper-0.0.42-linux-x86_64.AppImage",
      "whisper-0.0.42-android-universal.apk",
    ]);
  });

  it("sorts independently of GitHub's asset order", () => {
    const expected = parseReleaseAssets(releaseFixture.assets);

    expect(parseReleaseAssets([...releaseFixture.assets].reverse())).toEqual(expected);
  });

  it("rejects backups and source archives while retaining an asset with an invalid digest", () => {
    const assets = parseReleaseAssets([
      {
        id: 1,
        name: "whisper-0.0.42-ios-unsigned.ipa.bak",
        size: 10,
        digest: "sha256:bad",
        browser_download_url: `${releaseDownloadBase}/whisper.ipa.bak`,
      },
      {
        id: 2,
        name: "Source code (zip)",
        size: 10,
        digest: null,
        browser_download_url: `${releaseDownloadBase}/source.zip`,
      },
      {
        id: 3,
        name: "whisper-0.0.42-windows-x86_64.exe",
        size: 10,
        digest: "sha256:bad",
        browser_download_url: `${releaseDownloadBase}/whisper.exe`,
      },
    ]);

    expect(assets).toEqual([
      expect.objectContaining({ id: 3, digest: null, platform: "windows" }),
    ]);
  });

  it("supports the legacy generic macOS and Android package names", () => {
    const assets = parseReleaseAssets([
      {
        id: 1,
        name: "whisper.dmg",
        size: 10,
        digest: null,
        browser_download_url: `${releaseDownloadBase}/whisper.dmg`,
      },
      {
        id: 2,
        name: "app-release.apk",
        size: 10,
        digest: null,
        browser_download_url: `${releaseDownloadBase}/app-release.apk`,
      },
    ]);

    expect(assets).toEqual([
      expect.objectContaining({ platform: "macos", arch: "x86_64", recommended: true }),
      expect.objectContaining({ platform: "android", arch: "universal", recommended: true }),
    ]);
  });
});

describe("selectRelease", () => {
  it("prefers a stable tag over a newer preview tag", () => {
    const stable = {
      ...releaseFixture,
      id: 1,
      tag_name: "release-v0.0.40",
      html_url: "https://github.com/lawnvi/whisper/releases/tag/release-v0.0.40",
      published_at: "2026-07-01T00:00:00Z",
    };
    const preview = {
      ...releaseFixture,
      id: 2,
      tag_name: "dev-v0.0.42",
      prerelease: false,
      published_at: "2026-07-08T00:00:00Z",
    };

    expect(selectRelease([preview, stable])).toEqual(
      expect.objectContaining({
        channel: "stable",
        tag: "release-v0.0.40",
        version: "0.0.40",
      }),
    );
  });

  it("derives preview status from the tag even when GitHub marks it non-prerelease", () => {
    expect(selectRelease([releaseFixture])).toEqual(
      expect.objectContaining({
        channel: "preview",
        tag: "dev-v0.0.42",
        version: "0.0.42",
      }),
    );
  });

  it("ignores drafts, unknown tags, and malformed input", () => {
    expect(
      selectRelease([
        { ...releaseFixture, draft: true },
        { ...releaseFixture, tag_name: "v0.0.42" },
      ]),
    ).toBeNull();
    expect(selectRelease({ releases: [] })).toBeNull();
  });
});

describe("getSystemRequirementKeys", () => {
  it("returns only evidence-backed platform requirements", () => {
    expect(getSystemRequirementKeys("linux")).toEqual([
      "linuxArchX8664",
      "linuxDiscoveryAvahi",
      "linuxAudioPulse",
      "linuxRemoteInputX11",
    ]);
    expect(getSystemRequirementKeys("ios")).toEqual([
      "iosMinimum13",
      "iosUnsignedSideload",
      "iosNotFormallyTested",
    ]);
  });
});
