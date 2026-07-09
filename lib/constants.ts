const configuredDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim() || "local-whisper.help";
const baseUrl = configuredDomain.startsWith("http://") || configuredDomain.startsWith("https://")
  ? configuredDomain.replace(/\/$/, "")
  : `https://${configuredDomain.replace(/\/$/, "")}`;

export const SITE_CONFIG = {
  title: "Whisper",
  baseUrl,
  links: {
    github: "https://github.com/lawnvi/whisper",
    releases: "https://github.com/lawnvi/whisper/releases",
  },
} as const;
