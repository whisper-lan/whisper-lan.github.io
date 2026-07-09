import { AudioLines, BellRing, MessageSquareText, MousePointer2 } from "lucide-react";

import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";

type CapabilitiesProps = {
  locale: Locale;
  messages: Messages;
};

const capabilities = [
  { key: "transfer", Icon: MessageSquareText },
  { key: "notifications", Icon: BellRing },
  { key: "audio", Icon: AudioLines },
  { key: "input", Icon: MousePointer2 },
] as const;

export function Capabilities({ locale, messages }: CapabilitiesProps) {
  return (
    <section className="section-band section-band--muted" aria-labelledby="capabilities-title" lang={localeToHtmlLang(locale)}>
      <div className="content-shell">
        <div className="section-heading">
          <p className="section-kicker">{messages.capabilities.eyebrow}</p>
          <h2 id="capabilities-title">{messages.capabilities.title}</h2>
          <p>{messages.capabilities.description}</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ key, Icon }) => {
            const item = messages.capabilities.items[key];
            return (
              <article className="capability" key={key}>
                <Icon aria-hidden="true" className="capability__icon" strokeWidth={1.7} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
