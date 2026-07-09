import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";
import type { ReadyReleaseCatalog } from "@/lib/release/types";

type ReleaseFactsProps = {
  catalog: ReadyReleaseCatalog;
  locale: Locale;
  messages: Messages;
};

export function ReleaseFacts({ catalog, locale, messages }: ReleaseFactsProps) {
  const published = new Intl.DateTimeFormat(localeToHtmlLang(locale), {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(catalog.publishedAt));
  const verification = catalog.commit
    ? messages.download.verification[catalog.commit.verification]
    : messages.download.commitUnavailable;

  return (
    <div className="release-facts">
      <p className="sr-only" role="status" aria-live="polite">
        {messages.release.ready}: {catalog.channel === "stable"
          ? messages.release.stable
          : messages.release.preview} v{catalog.version}
      </p>
      <dl>
        <div>
          <dt>{messages.download.labels.channel}</dt>
          <dd>
            <span className={`release-channel release-channel--${catalog.channel}`}>
              {catalog.channel === "stable" ? messages.release.stable : messages.release.preview}
            </span>
            <span>v{catalog.version}</span>
          </dd>
        </div>
        <div>
          <dt>{messages.download.labels.published}</dt>
          <dd>
            <time dateTime={catalog.publishedAt}>{published}</time>
          </dd>
        </div>
        <div>
          <dt>{messages.download.labels.commit}</dt>
          <dd>
            {catalog.commit ? (
              <a href={catalog.commit.url} className="release-commit">
                <code>{catalog.commit.sha.slice(0, 7)}</code>
                <span>{verification}</span>
              </a>
            ) : (
              verification
            )}
          </dd>
        </div>
        <div>
          <dt>{messages.download.labels.installerSignature}</dt>
          <dd>{messages.download.installerSignatureUnknown}</dd>
        </div>
      </dl>
      <a href={catalog.releaseUrl} className="text-link">
        {messages.download.releasePage}
      </a>
    </div>
  );
}
