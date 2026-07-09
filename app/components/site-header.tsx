import { Code2 } from "lucide-react";
import Link from "next/link";

import type { Locale, Messages } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/constants";

import { ThemeToggle } from "./theme-toggle";

type SiteHeaderProps = {
  locale: Locale;
  messages: Messages;
};

const localeLinkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-[current=page]:bg-signal-soft aria-[current=page]:text-signal";

export function SiteHeader({ locale, messages }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="content-shell flex min-h-16 items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <span className="font-display text-lg font-bold text-ink">{messages.brand.name}</span>
          <span className="mono hidden text-xs text-muted-foreground sm:inline">
            {messages.brand.context}
          </span>
        </Link>

        <nav className="flex items-center gap-2" aria-label={messages.navigation.ariaLabel}>
          <a
            href={SITE_CONFIG.links.github}
            className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:inline-flex"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            {messages.navigation.source}
          </a>
          <div
            className="flex rounded-md border border-line bg-panel p-0.5"
            role="group"
            aria-label={messages.navigation.languageLabel}
          >
            <Link
              href="/zh"
              hrefLang="zh-CN"
              aria-current={locale === "zh" ? "page" : undefined}
              className={localeLinkClass}
            >
              {messages.navigation.chinese}
            </Link>
            <Link
              href="/en"
              hrefLang="en"
              aria-current={locale === "en" ? "page" : undefined}
              className={localeLinkClass}
            >
              {messages.navigation.english}
            </Link>
          </div>
          <ThemeToggle labels={messages.theme} />
        </nav>
      </div>
    </header>
  );
}
