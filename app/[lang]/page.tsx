import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HomePage } from '../components/HomePage';
import { fetchReleaseInfo } from '@/lib/release';
import { SITE_LANGS, copyLanguage, isSiteLang, pageMetadata, structuredData } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_LANGS.map((lang) => ({ lang }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(isSiteLang(lang) ? lang : 'en');
}

export default async function LocalePage({ params }: Props) {
  const { lang } = await params;
  if (!isSiteLang(lang)) notFound();

  // 构建时预取 Release 数据；浏览器加载后刷新，避免静态页面版本过期
  const release = await fetchReleaseInfo();
  // "<" escaped so answer text can never close the script element.
  const jsonLd = JSON.stringify(structuredData(lang)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <HomePage initialLanguage={copyLanguage(lang)} initialRelease={release} />
    </>
  );
}
