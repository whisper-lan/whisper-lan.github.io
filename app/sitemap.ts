import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { locales } from "@/lib/i18n";

const languageAlternates = {
  "x-default": `${SITE_CONFIG.baseUrl}/`,
  "zh-CN": `${SITE_CONFIG.baseUrl}/zh`,
  en: `${SITE_CONFIG.baseUrl}/en`,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_CONFIG.baseUrl}/${locale}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: languageAlternates },
  }));
}
