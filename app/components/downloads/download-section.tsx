import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";
import type { Platform, ReleaseCatalog } from "@/lib/release/types";

import { PlatformDownloadCard } from "./platform-download-card";
import { ReleaseFacts } from "./release-facts";

export type DownloadSectionProps = {
  catalog: ReleaseCatalog;
  locale: Locale;
  messages: Messages;
};

const platformOrder: Platform[] = ["windows", "macos", "linux", "android", "ios"];

export function DownloadSection({ catalog, locale, messages }: DownloadSectionProps) {
  if (catalog.status === "unavailable") {
    return (
      <section
        id="downloads"
        className="section-band download-section"
        aria-labelledby="downloads-title"
        lang={localeToHtmlLang(locale)}
      >
        <div className="content-shell">
          <div className="section-heading">
            <p className="section-kicker">{messages.download.eyebrow}</p>
            <h2 id="downloads-title">{messages.download.unavailableTitle}</h2>
          </div>
          <div className="download-unavailable" role="status" aria-live="polite">
            <p>{messages.download.unavailableBody}</p>
            <a href={catalog.releasesUrl} className="button download-fallback">
              {messages.download.openReleases}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="downloads"
      className="section-band download-section"
      aria-labelledby="downloads-title"
      lang={localeToHtmlLang(locale)}
    >
      <div className="content-shell">
        <div className="section-heading">
          <p className="section-kicker">{messages.download.eyebrow}</p>
          <h2 id="downloads-title">{messages.download.title}</h2>
          <p>{messages.download.description}</p>
        </div>
        <ReleaseFacts catalog={catalog} locale={locale} messages={messages} />
        <div className="download-grid">
          {platformOrder.map((platform) => (
            <PlatformDownloadCard
              key={platform}
              platform={platform}
              assets={catalog.assets.filter((asset) => asset.platform === platform)}
              locale={locale}
              messages={messages}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
