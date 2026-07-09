import type { Metadata } from "next";

import { SITE_CONFIG } from "./constants";
import { getMessages } from "./i18n";
import type { Locale } from "./i18n";

export function buildLocalizedMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const canonical = `${SITE_CONFIG.baseUrl}/${locale}`;
  const openGraphImage = `/${locale}/opengraph-image`;
  const twitterImage = `/${locale}/twitter-image`;

  return {
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    title: messages.metadata.title,
    description: messages.metadata.description,
    authors: [{ name: "lawnvi", url: SITE_CONFIG.links.github }],
    creator: "lawnvi",
    category: "Utilities",
    alternates: {
      canonical,
      languages: {
        "x-default": `${SITE_CONFIG.baseUrl}/`,
        "zh-CN": `${SITE_CONFIG.baseUrl}/zh`,
        en: `${SITE_CONFIG.baseUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_CONFIG.title,
      title: messages.metadata.title,
      description: messages.metadata.description,
      url: canonical,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? ["en_US"] : ["zh_CN"],
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: messages.hero.productAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata.title,
      description: messages.metadata.description,
      images: [{ url: twitterImage, alt: messages.hero.productAlt }],
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
