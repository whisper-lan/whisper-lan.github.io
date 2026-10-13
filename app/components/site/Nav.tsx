'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, RingMark } from './primitives';
import { GITHUB } from './links';

export function Nav({
  t,
  isZh,
  isDark,
  onToggleLanguage,
  onToggleTheme,
}: {
  t: Messages;
  isZh: boolean;
  isDark: boolean;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: [string, string][] = [
    ['#features', t.nav.features],
    ['#security', t.nav.security],
    ['#download', t.nav.download],
    ['#faq', t.nav.faq],
  ];

  const iconButton =
    'grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-[var(--hair)] hover:text-ink';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? 'border-hair backdrop-blur-xl backdrop-saturate-150' : 'border-transparent'
      }`}
      style={{ backgroundColor: scrolled || open ? 'var(--nav)' : 'transparent' }}
    >
      <div className="shell-wide flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label={t.a11y.home}>
          <RingMark className="h-[22px] w-[22px]" strokeWidth={3} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Whisper</span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Primary">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3.5 py-2 text-[14px] text-ink-2 transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a href={GITHUB.repo} target="_blank" rel="noopener noreferrer" className={`${iconButton} hidden sm:grid`} aria-label={t.a11y.github}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
            </svg>
          </a>
          <button type="button" onClick={onToggleLanguage} className={`${iconButton} w-auto px-2.5 text-[13px] font-medium`} aria-label={t.a11y.language}>
            {isZh ? 'EN' : '中'}
          </button>
          <button type="button" onClick={onToggleTheme} className={iconButton} aria-label={t.a11y.theme} aria-pressed={isDark}>
            <Icon name={isDark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
          </button>
          <a href="#download" className="btn btn-primary ml-2 hidden h-9 px-4 text-[14px] md:inline-flex">
            {t.nav.getApp}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`${iconButton} md:hidden`}
            aria-label={open ? t.a11y.close : t.a11y.menu}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="shell-wide flex flex-col pb-5 pt-1">
              {links.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="border-b border-hair py-3.5 text-[17px] text-ink last:border-0">
                  {label}
                </a>
              ))}
              <a href={GITHUB.repo} target="_blank" rel="noopener noreferrer" className="py-3.5 text-[17px] text-ink">
                GitHub
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
