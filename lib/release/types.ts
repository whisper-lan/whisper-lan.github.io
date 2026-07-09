export type ReleaseChannel = "stable" | "preview";

export type Platform = "windows" | "macos" | "linux" | "android" | "ios";

export type Verification = "verified" | "unsigned" | "unverified" | "unknown";

export type AssetFormat = "exe" | "dmg" | "deb" | "rpm" | "appimage" | "apk" | "ipa";

export type AssetArch =
  | "universal"
  | "x86_64"
  | "amd64"
  | "arm64"
  | "arm64-v8a"
  | "armeabi-v7a";

export type DownloadAsset = {
  id: number;
  name: string;
  url: string;
  bytes: number;
  platform: Platform;
  format: AssetFormat;
  arch: AssetArch;
  digest: string | null;
  recommended: boolean;
};

export type SelectedRelease = {
  channel: ReleaseChannel;
  tag: string;
  version: string;
  releaseUrl: string;
  publishedAt: string;
  assets: unknown[];
};

export type ReadyReleaseCatalog = {
  status: "ready";
  channel: ReleaseChannel;
  tag: string;
  version: string;
  releaseUrl: string;
  publishedAt: string;
  commit: {
    sha: string;
    url: string;
    verification: Verification;
  } | null;
  assets: DownloadAsset[];
};

export type ReleaseCatalog =
  | ReadyReleaseCatalog
  | { status: "unavailable"; releasesUrl: string };

export type RequirementKey =
  | "windowsArchX8664"
  | "windowsMinimumUnpublished"
  | "macosMinimum1015"
  | "linuxArchX8664"
  | "linuxDiscoveryAvahi"
  | "linuxAudioPulse"
  | "linuxRemoteInputX11"
  | "androidSupportedAbis"
  | "androidMinimumUnpublished"
  | "iosMinimum13"
  | "iosUnsignedSideload"
  | "iosNotFormallyTested";
