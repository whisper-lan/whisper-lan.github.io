import Link from "next/link";

import { SITE_CONFIG } from "@/lib/constants";
import type { Locale, Messages } from "@/lib/i18n";

type SiteFooterProps = {
  locale: Locale;
  messages: Messages;
};

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  return (
    <footer className="border-t border-line bg-panel-alt">
      <div className="content-shell grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center rounded-md font-display text-lg font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {messages.brand.name}
          </Link>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {messages.footer.tagline}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {messages.footer.boundary}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label={messages.navigation.ariaLabel}>
          <a className="min-h-11 content-center text-muted-foreground hover:text-ink" href={SITE_CONFIG.links.github}>
            {messages.footer.source}
          </a>
          <a className="min-h-11 content-center text-muted-foreground hover:text-ink" href={`${SITE_CONFIG.links.github}/issues`}>
            {messages.footer.issues}
          </a>
          <a className="min-h-11 content-center text-muted-foreground hover:text-ink" href={`${SITE_CONFIG.links.github}/blob/main/LICENSE`}>
            {messages.footer.license}
          </a>
        </nav>
      </div>
    </footer>
  );
}
