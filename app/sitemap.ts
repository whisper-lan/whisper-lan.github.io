import type { MetadataRoute } from 'next';
import { FEATURES } from '@/lib/features';
import { SITE_LANGS, featureAlternates, languageAlternates, pageUrl } from '@/lib/seo';

export const dynamic = 'force-static';

// Only the pages themselves: "/" is a redirect, so it is listed as the
// x-default alternate rather than as a page.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITE_LANGS.flatMap((lang) => [
    { url: pageUrl(lang), lastModified, alternates: { languages: languageAlternates } },
    ...FEATURES.map((f) => ({ url: pageUrl(lang, f.slug), lastModified, alternates: { languages: featureAlternates(f.slug) } })),
  ]);
}
