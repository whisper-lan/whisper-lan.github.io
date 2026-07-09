import type { Platform, RequirementKey } from "./types";

const requirements: Record<Platform, readonly RequirementKey[]> = {
  windows: ["windowsArchX8664", "windowsMinimumUnpublished"],
  macos: ["macosMinimum1015"],
  linux: [
    "linuxArchX8664",
    "linuxDiscoveryAvahi",
    "linuxAudioPulse",
    "linuxRemoteInputX11",
  ],
  android: ["androidSupportedAbis", "androidMinimumUnpublished"],
  ios: ["iosMinimum13", "iosUnsignedSideload", "iosNotFormallyTested"],
};

export function getSystemRequirementKeys(platform: Platform): RequirementKey[] {
  return [...requirements[platform]];
}
