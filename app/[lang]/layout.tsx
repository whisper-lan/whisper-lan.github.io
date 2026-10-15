import { Document } from '../components/Document';
import { htmlLang, isSiteLang } from '@/lib/seo';

export { viewport } from '@/lib/seo';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <Document lang={htmlLang(isSiteLang(lang) ? lang : 'en')}>{children}</Document>;
}
