import type { MetadataRoute } from 'next';
import { SITE_LANGS, languageAlternates, pageUrl } from '@/lib/seo';

export const dynamic = 'force-static';

// Only the pages themselves: "/" is a redirect, so it is listed as the
// x-default alternate rather than as a page.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITE_LANGS.map((lang) => ({
    url: pageUrl(lang),
    lastModified,
    alternates: { languages: languageAlternates },
  }));
}
