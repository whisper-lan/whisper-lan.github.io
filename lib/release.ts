// Prefetch release data at build time and refresh it in the browser.
export type PlatformType = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown';
export type DownloadKey =
  | PlatformType
  | 'macArm64'
  | 'macX64'
  | 'androidArm64'
  | 'androidArmV7'
  | 'androidX64'
  | 'androidUniversal'
  | 'linuxDeb'
  | 'linuxAppImage'
  | 'linuxRpm';

export type PlatformDownloadInfo = { url: string; size: string; version: string };
export type DownloadInfo = { [key in DownloadKey]: PlatformDownloadInfo };
export type ReleaseData = { version: string; info: DownloadInfo };

export const RELEASE_API = 'https://api.github.com/repos/lawnvi/whisper/releases/latest';
const MIRROR_HOST = 'whisper.127014.xyz';
const GH_DOWNLOAD_PREFIX = 'https://github.com/lawnvi/whisper/releases/download/';

export function localizeDownloadInfo(info: DownloadInfo, hostname?: string): DownloadInfo {
  if (hostname !== MIRROR_HOST) return info;
  const next = { ...info };
  (Object.keys(next) as DownloadKey[]).forEach((key) => {
    const { url } = next[key];
    if (url.startsWith(GH_DOWNLOAD_PREFIX)) {
      next[key] = { ...next[key], url: `/download/${url.slice(GH_DOWNLOAD_PREFIX.length)}` };
    }
  });
  return next;
}

export const PLATFORM_FILE_SUFFIXES = {
  windows: ['.exe'],
  mac: ['macos.dmg'],
  macArm64: ['macos-arm64.dmg'],
  macX64: ['macos-x86_64.dmg'],
  linux: ['linux-amd64.deb', '.deb'],
  linuxDeb: ['linux-amd64.deb'],
  linuxAppImage: ['linux-x86_64.appimage'],
  linuxRpm: ['linux-x86_64.rpm'],
  android: ['android-universal.apk', 'app-release.apk'],
  androidArm64: ['android-arm64-v8a.apk'],
  androidArmV7: ['android-armeabi-v7a.apk'],
  androidX64: ['android-x86_64.apk'],
  androidUniversal: ['android-universal.apk'],
  ios: ['.ipa.bak'],
} as const;

export const emptyDownloadInfo = (): DownloadInfo => ({
  windows: { url: '', size: '-', version: '' },
  mac: { url: '', size: '-', version: '' },
  macArm64: { url: '', size: '-', version: '' },
  macX64: { url: '', size: '-', version: '' },
  linux: { url: '', size: '-', version: '' },
  linuxDeb: { url: '', size: '-', version: '' },
  linuxAppImage: { url: '', size: '-', version: '' },
  linuxRpm: { url: '', size: '-', version: '' },
  android: { url: '', size: '-', version: '' },
  androidArm64: { url: '', size: '-', version: '' },
  androidArmV7: { url: '', size: '-', version: '' },
  androidX64: { url: '', size: '-', version: '' },
  androidUniversal: { url: '', size: '-', version: '' },
  ios: { url: '', size: '-', version: '' },
  unknown: { url: '', size: '-', version: '' },
});

const formatSize = (bytes: number): string => {
  if (!bytes) return '-';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Returns null on failure — callers should hide version-dependent UI rather than
// show placeholder values like "0.0.0".
export async function fetchReleaseInfo(): Promise<ReleaseData | null> {
  try {
    const host = typeof window !== 'undefined' ? window.location.hostname : undefined;
    const res = await fetch(
      host === MIRROR_HOST ? '/api/releases/latest' : RELEASE_API,
      host ? undefined : { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const version = String(data.tag_name || '').replace(/^(?:dev-|release-)?v/, '');
    if (!version) return null;
    const info = emptyDownloadInfo();
    const assets = (data.assets || []) as { name?: string; size?: number; browser_download_url?: string }[];
    (Object.entries(PLATFORM_FILE_SUFFIXES) as [DownloadKey, readonly string[]][]).forEach(([plat, suffixes]) => {
      const asset = suffixes
        .map((suffix) => assets.find((candidate) => String(candidate.name).toLowerCase().endsWith(suffix)))
        .find(Boolean);
      if (asset) {
        info[plat] = { url: asset.browser_download_url || '', size: formatSize(asset.size || 0), version: data.tag_name };
      }
    });
    // Prefer the Apple Silicon package for generic macOS metadata while still
    // exposing both architecture-specific downloads to the platform table.
    if (info.macArm64.url) info.mac = info.macArm64;
    return { version, info: localizeDownloadInfo(info, host) };
  } catch {
    return null;
  }
}
