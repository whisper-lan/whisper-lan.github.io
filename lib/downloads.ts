import type { Messages } from './i18n';
import type { DownloadInfo, DownloadKey, PlatformDownloadInfo, PlatformType } from './release';

export type BuildOption = PlatformDownloadInfo & { label: string; key: DownloadKey };

export const PLATFORM_LABEL: Record<Exclude<PlatformType, 'unknown'>, string> = {
  mac: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
};

// Browsers do not reliably expose CPU architecture or Linux distribution.
// Show explicit build choices instead of guessing an incompatible package.
export function platformBuilds(info: DownloadInfo, t: Messages): Partial<Record<PlatformType, BuildOption[]>> {
  const buildOptions = (options: readonly (readonly [string, DownloadKey])[]): BuildOption[] =>
    options.map(([label, key]) => ({ label, key, ...info[key] })).filter((build) => build.url);
  const b = t.download.builds;
  return {
    mac: buildOptions([
      [b.appleSilicon, 'macArm64'],
      [b.intel, 'macX64'],
    ]),
    android: buildOptions([
      [b.androidArm64, 'androidArm64'],
      [b.androidUniversal, 'androidUniversal'],
      [b.androidArmV7, 'androidArmV7'],
      [b.androidX64, 'androidX64'],
    ]),
    linux: buildOptions([
      [b.linuxDeb, 'linuxDeb'],
      [b.linuxAppImage, 'linuxAppImage'],
      [b.linuxRpm, 'linuxRpm'],
    ]),
  };
}
