import { notFound } from "next/navigation";

import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
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
      <SiteHeader locale={locale} messages={messages} />
      <main>
        <section className="content-shell flex min-h-[62vh] flex-col justify-center py-16" aria-labelledby="hero-title">
          <p className="eyebrow">{messages.hero.eyebrow}</p>
          <h1 id="hero-title" className="mt-4 font-display text-5xl font-bold sm:text-7xl">
            {messages.brand.name}
          </h1>
          <p className="mt-5 max-w-2xl font-display text-2xl font-medium sm:text-3xl">
            {messages.hero.title}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {messages.hero.description}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {messages.hero.security}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#downloads"
              className="inline-flex min-h-12 items-center rounded-md bg-signal px-5 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              {messages.hero.chooseBuild}
            </a>
            <a
              href="https://github.com/lawnvi/whisper"
              className="inline-flex min-h-12 items-center rounded-md border border-line-strong bg-panel px-5 font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              {messages.hero.viewSource}
            </a>
          </div>
        </section>

        <section id="downloads" className="border-y border-line bg-panel-alt py-14" aria-labelledby="downloads-title">
          <div className="content-shell">
            <p className="eyebrow">{messages.release.eyebrow}</p>
            <h2 id="downloads-title" className="mt-3 font-display text-3xl font-semibold">
              {messages.release.title}
            </h2>
            {catalog.status === "ready" ? (
              <div className="mt-5">
                <p role="status" className="text-sm text-muted-foreground">
                  {messages.release.ready}: {catalog.channel === "stable" ? messages.release.stable : messages.release.preview} v{catalog.version}
                  {` · ${catalog.assets.length} ${messages.release.assets}`}
                </p>
                <a
                  href={catalog.releaseUrl}
                  className="mt-4 inline-flex min-h-11 items-center rounded-md text-signal underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {messages.release.visitRelease}
                </a>
              </div>
            ) : (
              <div className="mt-5">
                <p role="status" className="text-sm text-muted-foreground">
                  {messages.release.unavailable}
                </p>
                <a
                  href={catalog.releasesUrl}
                  className="mt-4 inline-flex min-h-11 items-center rounded-md text-signal underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {messages.release.visitReleases}
                </a>
              </div>
            )}
          </div>
        </section>
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
