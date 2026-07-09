import { SITE_CONFIG } from "@/lib/constants";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ReleaseCatalog } from "@/lib/release/types";

type StructuredDataProps = {
  locale: Locale;
  catalog: ReleaseCatalog;
};

export default function StructuredData({ locale, catalog }: StructuredDataProps) {
  const messages = getMessages(locale);
  const isReady = catalog.status === "ready";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_CONFIG.title,
    url: `${SITE_CONFIG.baseUrl}/${locale}`,
    description: messages.metadata.description,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Android, macOS, Windows, Linux, iOS",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "lawnvi",
      url: SITE_CONFIG.links.github,
    },
    license: `${SITE_CONFIG.links.github}/blob/main/LICENSE`,
    codeRepository: SITE_CONFIG.links.github,
    softwareVersion: isReady ? catalog.version : undefined,
    datePublished: isReady ? catalog.publishedAt : undefined,
    downloadUrl: isReady ? catalog.releaseUrl : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
