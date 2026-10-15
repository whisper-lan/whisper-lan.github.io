import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FeaturePage } from '../../components/FeaturePage';
import { fetchReleaseInfo } from '@/lib/release';
import { FEATURES, featureBySlug } from '@/lib/features';
import { SITE_LANGS, copyLanguage, featureMetadata, featureStructuredData, isSiteLang } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_LANGS.flatMap((lang) => FEATURES.map((f) => ({ lang, feature: f.slug })));
}

type Props = { params: Promise<{ lang: string; feature: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, feature } = await params;
  const entry = featureBySlug(feature);
  if (!entry || !isSiteLang(lang)) return {};
  return featureMetadata(lang, entry.key, entry.slug);
}

export default async function Feature({ params }: Props) {
  const { lang, feature } = await params;
  const entry = featureBySlug(feature);
  if (!entry || !isSiteLang(lang)) notFound();

  const release = await fetchReleaseInfo();
  // "<" escaped so answer text can never close the script element.
  const jsonLd = JSON.stringify(featureStructuredData(lang, entry.key, entry.slug)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <FeaturePage feature={entry.key} initialLanguage={copyLanguage(lang)} initialRelease={release} />
    </>
  );
}
