import type {
  AssetArch,
  AssetFormat,
  DownloadAsset,
  Platform,
  ReleaseChannel,
  SelectedRelease,
} from "./types";

const TAG_PATTERN =
  /^(release|dev)-v((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$/;
const DIGEST_PATTERN = /^sha256:[a-fA-F0-9]{64}$/;

type ParsedAssetKind = {
  platform: Platform;
  format: AssetFormat;
  arch: AssetArch;
  recommended: boolean;
};

type Semver = {
  core: [bigint, bigint, bigint];
  prerelease: string[] | null;
};

type ReleaseCandidate = SelectedRelease & {
  semver: Semver;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGitHubUrl(value: unknown, pathPrefix: string): value is string {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      url.pathname.startsWith(pathPrefix)
    );
  } catch {
    return false;
  }
}

function parseAssetKind(name: string): ParsedAssetKind | null {
  const normalized = name.toLowerCase();

  if (/windows-(?:x86_64|amd64)\.exe$/.test(normalized)) {
    return { platform: "windows", format: "exe", arch: "x86_64", recommended: true };
  }

  const macMatch = normalized.match(/macos-(universal|arm64|x86_64)\.dmg$/);
  if (macMatch) {
    const arch = macMatch[1] as "universal" | "arm64" | "x86_64";
    return { platform: "macos", format: "dmg", arch, recommended: false };
  }
  if (normalized === "whisper.dmg") {
    return { platform: "macos", format: "dmg", arch: "x86_64", recommended: false };
  }

  const linuxMatch = normalized.match(/linux-(amd64|x86_64)\.(appimage|deb|rpm)$/);
  if (linuxMatch) {
    const extension = linuxMatch[2] as "appimage" | "deb" | "rpm";
    const arch: AssetArch = extension === "deb" ? "amd64" : "x86_64";
    return {
      platform: "linux",
      format: extension,
      arch,
      recommended: extension === "appimage",
    };
  }

  const androidMatch = normalized.match(
    /android-(universal|arm64-v8a|armeabi-v7a|x86_64)\.apk$/,
  );
  const legacyAndroidMatch = normalized.match(
    /^app-(?:(universal|arm64-v8a|armeabi-v7a|x86_64)-)?release\.apk$/,
  );
  const androidArch = androidMatch?.[1] ?? legacyAndroidMatch?.[1] ??
    (legacyAndroidMatch ? "universal" : null);
  if (androidArch) {
    const arch = androidArch as "universal" | "arm64-v8a" | "armeabi-v7a" | "x86_64";
    return {
      platform: "android",
      format: "apk",
      arch,
      recommended: arch === "universal",
    };
  }

  if (normalized.endsWith(".ipa")) {
    return { platform: "ios", format: "ipa", arch: "universal", recommended: false };
  }

  return null;
}

function parseAsset(value: unknown): DownloadAsset | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, name, size, digest, browser_download_url: url } = value;
  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof name !== "string" ||
    name.length === 0 ||
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size < 0 ||
    !isGitHubUrl(url, "/lawnvi/whisper/releases/download/")
  ) {
    return null;
  }

  const kind = parseAssetKind(name);
  if (!kind) {
    return null;
  }

  return {
    id,
    name,
    url,
    bytes: size,
    ...kind,
    digest: typeof digest === "string" && DIGEST_PATTERN.test(digest)
      ? digest.toLowerCase()
      : null,
  };
}

const platformRank: Record<Platform, number> = {
  windows: 0,
  macos: 1,
  linux: 2,
  android: 3,
  ios: 4,
};

const formatRank: Record<AssetFormat, number> = {
  exe: 0,
  dmg: 0,
  appimage: 0,
  deb: 1,
  rpm: 2,
  apk: 0,
  ipa: 0,
};

const archRank: Record<AssetArch, number> = {
  universal: 0,
  arm64: 1,
  "arm64-v8a": 1,
  "armeabi-v7a": 2,
  x86_64: 3,
  amd64: 3,
};

function compareAssets(left: DownloadAsset, right: DownloadAsset): number {
  return (
    platformRank[left.platform] - platformRank[right.platform] ||
    Number(right.recommended) - Number(left.recommended) ||
    formatRank[left.format] - formatRank[right.format] ||
    archRank[left.arch] - archRank[right.arch] ||
    left.name.localeCompare(right.name, "en") ||
    left.id - right.id
  );
}

function markMacRecommendation(assets: DownloadAsset[]): void {
  const macAssets = assets.filter(({ platform }) => platform === "macos");
  const recommended =
    macAssets.find(({ arch }) => arch === "universal") ??
    macAssets.find(({ arch }) => arch === "x86_64");
  if (recommended) {
    recommended.recommended = true;
  }
}

export function parseReleaseAssets(assets: unknown): DownloadAsset[] {
  if (!Array.isArray(assets)) {
    return [];
  }

  const parsed = assets
    .map(parseAsset)
    .filter((asset): asset is DownloadAsset => asset !== null);
  markMacRecommendation(parsed);
  return parsed.sort(compareAssets);
}

function parseTag(tag: unknown): {
  channel: ReleaseChannel;
  version: string;
  semver: Semver;
} | null {
  if (typeof tag !== "string") {
    return null;
  }

  const match = TAG_PATTERN.exec(tag);
  if (!match) {
    return null;
  }

  return {
    channel: match[1] === "release" ? "stable" : "preview",
    version: match[2],
    semver: {
      core: [BigInt(match[3]), BigInt(match[4]), BigInt(match[5])],
      prerelease: match[6]?.split(".") ?? null,
    },
  };
}

function parseReleaseCandidate(value: unknown): ReleaseCandidate | null {
  if (!isRecord(value) || value.draft !== false || !Array.isArray(value.assets)) {
    return null;
  }

  const tag = typeof value.tag_name === "string" ? value.tag_name : null;
  const parsedTag = parseTag(tag);
  const publishedAt = typeof value.published_at === "string" ? value.published_at : null;
  if (
    !tag ||
    !parsedTag ||
    !publishedAt ||
    !Number.isFinite(Date.parse(publishedAt)) ||
    !isGitHubUrl(value.html_url, "/lawnvi/whisper/releases/")
  ) {
    return null;
  }

  return {
    channel: parsedTag.channel,
    tag,
    version: parsedTag.version,
    releaseUrl: value.html_url,
    publishedAt,
    assets: value.assets,
    semver: parsedTag.semver,
  };
}

function compareSemver(left: Semver, right: Semver): number {
  for (let index = 0; index < left.core.length; index += 1) {
    if (left.core[index] !== right.core[index]) {
      return left.core[index] > right.core[index] ? 1 : -1;
    }
  }

  if (left.prerelease === null || right.prerelease === null) {
    return left.prerelease === right.prerelease ? 0 : left.prerelease === null ? 1 : -1;
  }

  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    if (leftPart === undefined || rightPart === undefined) {
      return leftPart === rightPart ? 0 : leftPart === undefined ? -1 : 1;
    }
    if (leftPart === rightPart) {
      continue;
    }

    const leftNumeric = /^\d+$/.test(leftPart);
    const rightNumeric = /^\d+$/.test(rightPart);
    if (leftNumeric && rightNumeric) {
      return BigInt(leftPart) > BigInt(rightPart) ? 1 : -1;
    }
    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }
    return leftPart > rightPart ? 1 : -1;
  }

  return 0;
}

function compareReleaseCandidates(left: ReleaseCandidate, right: ReleaseCandidate): number {
  const channelDifference = Number(right.channel === "stable") - Number(left.channel === "stable");
  if (channelDifference !== 0) {
    return channelDifference;
  }

  const dateDifference = Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  if (dateDifference !== 0) {
    return dateDifference;
  }

  const versionDifference = compareSemver(right.semver, left.semver);
  if (versionDifference !== 0) {
    return versionDifference;
  }

  return right.tag < left.tag ? -1 : right.tag > left.tag ? 1 : 0;
}

export function selectRelease(releases: unknown): SelectedRelease | null {
  if (!Array.isArray(releases)) {
    return null;
  }

  const selected = releases
    .map(parseReleaseCandidate)
    .filter((release): release is ReleaseCandidate => release !== null)
    .sort(compareReleaseCandidates)[0];

  if (!selected) {
    return null;
  }

  return {
    channel: selected.channel,
    tag: selected.tag,
    version: selected.version,
    releaseUrl: selected.releaseUrl,
    publishedAt: selected.publishedAt,
    assets: selected.assets,
  };
}
