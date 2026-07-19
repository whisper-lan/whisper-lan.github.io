// Release data from GitHub — fetched server-side with ISR (see app/[lang]/page.tsx),
// with a client-side fallback for the rare render path without server props.
export type PlatformType = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown';

export type PlatformDownloadInfo = { url: string; size: string; version: string };
export type DownloadInfo = { [key in PlatformType]: PlatformDownloadInfo };
export type ReleaseData = { version: string; info: DownloadInfo };

export const RELEASE_API = 'https://api.github.com/repos/lawnvi/whisper/releases/latest';

export const PLATFORM_FILE_SUFFIXES = {
  windows: ['.exe'],
  mac: ['.dmg'],
  linux: ['.deb'],
  android: ['android-universal.apk', 'app-release.apk'],
  ios: ['.ipa.bak'],
} as const;

export const emptyDownloadInfo = (): DownloadInfo => ({
  windows: { url: '', size: '-', version: '' },
  mac: { url: '', size: '-', version: '' },
  linux: { url: '', size: '-', version: '' },
  android: { url: '', size: '-', version: '' },
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
    const res = await fetch(RELEASE_API, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const version = String(data.tag_name || '').replace('dev-v', '').replace('v', '');
    if (!version) return null;
    const info = emptyDownloadInfo();
    (data.assets || []).forEach((asset: { name?: string; size?: number; browser_download_url?: string }) => {
      const name = String(asset.name).toLowerCase();
      (Object.entries(PLATFORM_FILE_SUFFIXES) as [PlatformType, readonly string[]][]).forEach(([plat, suffixes]) => {
        if (suffixes.some((suffix) => name.endsWith(suffix))) {
          info[plat] = { url: asset.browser_download_url || '', size: formatSize(asset.size || 0), version: data.tag_name };
        }
      });
    });
    return { version, info };
  } catch {
    return null;
  }
}
