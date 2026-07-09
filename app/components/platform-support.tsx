import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";

type PlatformSupportProps = {
  locale: Locale;
  messages: Messages;
};

const platforms = [
  { key: "android", tone: "supported" },
  { key: "macos", tone: "supported" },
  { key: "windows", tone: "supported" },
  { key: "linux", tone: "conditional" },
  { key: "ios", tone: "experimental" },
] as const;

export function PlatformSupport({ locale, messages }: PlatformSupportProps) {
  return (
    <section className="section-band" aria-labelledby="platforms-title" lang={localeToHtmlLang(locale)}>
      <div className="content-shell">
        <div className="section-heading">
          <p className="section-kicker">{messages.platforms.eyebrow}</p>
          <h2 id="platforms-title">{messages.platforms.title}</h2>
          <p>{messages.platforms.description}</p>
        </div>
        <div className="platform-list__header" aria-hidden="true">
          <span>{messages.platforms.labels.platform}</span>
          <span>{messages.platforms.labels.maturity}</span>
          <span>{messages.platforms.labels.requirements}</span>
        </div>
        <ul className="platform-list">
          {platforms.map(({ key, tone }) => {
            const item = messages.platforms.items[key];
            return (
              <li className="platform-row" key={key}>
                <h3>{item.name}</h3>
                <div>
                  <span className="mobile-label">{messages.platforms.labels.maturity}</span>
                  <span className={`platform-status platform-status--${tone}`}>
                    {item.maturity}
                  </span>
                </div>
                <p>
                  <span className="mobile-label">{messages.platforms.labels.requirements}</span>
                  {item.requirements}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
