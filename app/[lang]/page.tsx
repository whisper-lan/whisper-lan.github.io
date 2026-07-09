import { notFound } from "next/navigation";

import { Capabilities } from "@/app/components/capabilities";
import { DownloadSection } from "@/app/components/downloads/download-section";
import { Faq } from "@/app/components/faq";
import { Hero } from "@/app/components/hero";
import { PlatformSupport } from "@/app/components/platform-support";
import { ProductGallery } from "@/app/components/product-gallery";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import StructuredData from "@/app/components/StructuredData";
import { getMessages, isLocale } from "@/lib/i18n";
import type { Locale, Messages } from "@/lib/i18n";
import { getReleaseCatalog } from "@/lib/release/github";
import type { ReleaseCatalog } from "@/lib/release/types";

type LandingSkeletonProps = {
  locale: Locale;
  messages: Messages;
  catalog: ReleaseCatalog;
};

function LandingSkeleton({ locale, messages, catalog }: LandingSkeletonProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <StructuredData locale={locale} catalog={catalog} />
      <SiteHeader locale={locale} messages={messages} />
      <main>
        <Hero locale={locale} messages={messages} catalog={catalog} />
        <DownloadSection catalog={catalog} locale={locale} messages={messages} />
        <ProductGallery locale={locale} messages={messages} />
        <Capabilities locale={locale} messages={messages} />
        <PlatformSupport locale={locale} messages={messages} />
        <Faq locale={locale} messages={messages} />
      </main>
      <SiteFooter locale={locale} messages={messages} />
    </div>
  );
}

type LocalePageProps = {
  params: Promise<{ lang: string }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const locale = lang;
  const messages = getMessages(locale);
  const catalog = await getReleaseCatalog();

  return <LandingSkeleton locale={locale} messages={messages} catalog={catalog} />;
}
