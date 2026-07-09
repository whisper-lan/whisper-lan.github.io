import { ChevronDown } from "lucide-react";

import type { Locale, Messages } from "@/lib/i18n";
import { localeToHtmlLang } from "@/lib/i18n";

type FaqProps = {
  locale: Locale;
  messages: Messages;
};

const questions = ["start", "encryption", "files", "speed", "linux", "ios"] as const;

export function Faq({ locale, messages }: FaqProps) {
  return (
    <section className="section-band section-band--muted" aria-labelledby="faq-title" lang={localeToHtmlLang(locale)}>
      <div className="content-shell faq-layout">
        <div className="section-heading">
          <p className="section-kicker">{messages.faq.eyebrow}</p>
          <h2 id="faq-title">{messages.faq.title}</h2>
        </div>
        <div className="faq-list">
          {questions.map((key) => {
            const item = messages.faq.items[key];
            return (
              <details key={key}>
                <summary>
                  <span>{item.question}</span>
                  <ChevronDown aria-hidden="true" className="faq-list__icon" strokeWidth={1.8} />
                </summary>
                <p>{item.answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
