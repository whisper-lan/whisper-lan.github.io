import { CircleCheck, Code2, Download, FlaskConical } from "lucide-react";
import Image from "next/image";

import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";
import type { ReleaseCatalog } from "@/lib/release/types";

type HeroProps = {
  locale: Locale;
  messages: Messages;
  catalog: ReleaseCatalog;
};

export function Hero({ locale, messages, catalog }: HeroProps) {
  const isReady = catalog.status === "ready";
  const isStable = isReady && catalog.channel === "stable";

  return (
    <section className="hero" aria-labelledby="hero-title" lang={localeToHtmlLang(locale)}>
      <div className="hero__media">
        <Image
          src="/product/file-share.png"
          alt={messages.hero.productAlt}
          fill
          priority
          sizes="100vw"
          className="hero__image"
        />
      </div>
      <div className="hero__content content-shell">
        <div className="hero__copy">
          <div className="hero__meta">
            <Image
              src="/product/app-icon.png"
              alt=""
              width={56}
              height={56}
              className="hero__app-icon"
              priority
            />
            {isReady ? (
              <span
                className={`status-chip ${isStable ? "status-chip--stable" : "status-chip--preview"}`}
                role="status"
              >
                {isStable ? (
                  <CircleCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                ) : (
                  <FlaskConical aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                )}
                {isStable ? messages.release.stable : messages.release.preview} v{catalog.version}
              </span>
            ) : (
              <span className="status-chip" role="status">
                {messages.release.unavailable}
              </span>
            )}
          </div>
          <p className="hero__eyebrow">{messages.hero.eyebrow}</p>
          <h1 id="hero-title" className="hero__name">
            {messages.brand.name}
          </h1>
          <p className="hero__title">{messages.hero.title}</p>
          <p className="hero__description">{messages.hero.description}</p>
          <p className="hero__security">{messages.hero.security}</p>
          <div className="hero__actions">
            <a href="#downloads" className="button button--primary">
              <Download aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              {messages.hero.chooseBuild}
            </a>
            <a href="https://github.com/lawnvi/whisper" className="button button--secondary">
              <Code2 aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              {messages.hero.viewSource}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
