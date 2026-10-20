import type { Metadata, Viewport } from 'next';
import { SITE_CONFIG } from './constants';
import { messages, type Language } from './i18n';
import type { FeatureKey } from './features';

// Search metadata for the two localized pages. Every absolute URL comes from
// SITE_CONFIG.baseUrl, so moving the site to another domain is one change.

export const SITE_LANGS = ['zh', 'en'] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

export const isSiteLang = (value: string): value is SiteLang => (SITE_LANGS as readonly string[]).includes(value);
export const copyLanguage = (lang: SiteLang): Language => (lang === 'zh' ? 'zh-CN' : 'en');
// The copy is Simplified Chinese; hreflang stays plain "zh" so every Chinese
// searcher is pointed at it.
export const htmlLang = (lang: SiteLang) => (lang === 'zh' ? 'zh-CN' : 'en');

export const pageUrl = (lang?: SiteLang, slug?: string) => `${SITE_CONFIG.baseUrl}/${lang ?? ''}${slug ? `/${slug}` : ''}`;

// "/" is the edge redirect by browser language, so it is the x-default.
export const languageAlternates = {
  'x-default': pageUrl(),
  zh: pageUrl('zh'),
  en: pageUrl('en'),
};

// A plain .png path: Cloudflare Pages serves extensionless files as
// application/octet-stream, which link previews reject.
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Whisper: files, clipboard, keyboard and mouse, audio and app windows across your local network',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  applicationName: SITE_CONFIG.title,
  authors: [{ name: 'lawnvi', url: 'https://github.com/lawnvi' }],
  creator: 'lawnvi',
  formatDetection: { email: false, address: false, telephone: false },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const featureAlternates = (slug: string) => ({ zh: pageUrl('zh', slug), en: pageUrl('en', slug) });

export function pageMetadata(lang: SiteLang): Metadata {
  return metadataFor(lang, messages[copyLanguage(lang)].meta, pageUrl(lang), languageAlternates);
}

export function featureMetadata(lang: SiteLang, key: FeatureKey, slug: string): Metadata {
  return metadataFor(lang, messages[copyLanguage(lang)].features.items[key].meta, pageUrl(lang, slug), featureAlternates(slug));
}

function metadataFor(
  lang: SiteLang,
  { title, description, keywords }: { title: string; description: string; keywords: string[] },
  url: string,
  languages: Record<string, string>,
): Metadata {
  return {
    ...baseMetadata,
    title,
    description,
    keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'website',
      siteName: SITE_CONFIG.title,
      title,
      description,
      url,
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: lang === 'zh' ? ['en_US'] : ['zh_CN'],
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
  };
}

// The edge redirect page: never served on Cloudflare, but static hosts without
// the worker show the Chinese page here until the browser redirect runs.
export const rootMetadata: Metadata = {
  ...pageMetadata('zh'),
  alternates: { canonical: pageUrl(), languages: languageAlternates },
};

// schema.org graph for one localized page. There are no ratings or reviews,
// so Google shows no rich result; this only tells search engines what the
// product is, who makes it and where the source lives.
export function structuredData(lang: SiteLang) {
  const t = messages[copyLanguage(lang)];
  const site = `${SITE_CONFIG.baseUrl}/#website`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': site, url: pageUrl(), name: SITE_CONFIG.title, inLanguage: ['zh-CN', 'en'] },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_CONFIG.baseUrl}/#app`,
        name: SITE_CONFIG.title,
        url: pageUrl(lang),
        description: t.meta.description,
        inLanguage: htmlLang(lang),
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'macOS, Windows, Linux, Android',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        isAccessibleForFree: true,
        license: 'https://opensource.org/licenses/MIT',
        downloadUrl: SITE_CONFIG.links.releases,
        image: `${SITE_CONFIG.baseUrl}${OG_IMAGE.url}`,
        sameAs: [SITE_CONFIG.links.github],
        author: { '@type': 'Person', name: 'lawnvi', url: 'https://github.com/lawnvi' },
        isPartOf: { '@id': site },
      },
      {
        '@type': 'FAQPage',
        url: pageUrl(lang),
        inLanguage: htmlLang(lang),
        mainEntity: t.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

// A feature page: where it sits under the home page (search results can show
// that path), and its own questions.
export function featureStructuredData(lang: SiteLang, key: FeatureKey, slug: string) {
  const t = messages[copyLanguage(lang)];
  const copy = t.features.items[key];
  const url = pageUrl(lang, slug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        url,
        name: copy.meta.title,
        description: copy.meta.description,
        inLanguage: htmlLang(lang),
        isPartOf: { '@id': `${SITE_CONFIG.baseUrl}/#website` },
        about: { '@id': `${SITE_CONFIG.baseUrl}/#app` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_CONFIG.title, item: pageUrl(lang) },
          { '@type': 'ListItem', position: 2, name: copy.name, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        url,
        inLanguage: htmlLang(lang),
        mainEntity: copy.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}
