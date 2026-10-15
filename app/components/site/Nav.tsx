'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { FEATURES } from '@/lib/features';
import { Icon, RingMark } from './primitives';
import { GITHUB } from './links';

// "功能" opens a short menu of the feature pages, each with its light, plus the
// overview on the home page. Hover opens it on desktop; click and keyboard
// work everywhere.
function FeatureMenu({ t, home, path, label }: { t: Messages; home: string; path: string; label: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const join = (title: string[]) => title.join(/[　-鿿]/.test(title[0]) ? '' : ' ');

  return (
    <div ref={wrap} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="feature-menu"
        className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] text-ink-2 transition-colors hover:text-ink"
      >
        {label}
        <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      {/* the outer layer centres the menu, the inner one animates (framer's
          transform would replace Tailwind's translate on the same element) */}
      <div className="pointer-events-none absolute left-1/2 top-full w-[540px] -translate-x-1/2">
        <AnimatePresence>
          {open && (
            <motion.div
              id="feature-menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto pt-3"
            >
              <div className="overflow-hidden rounded-[20px] border border-hair bg-surface shadow-float">
                <ul className="grid grid-cols-2 gap-1 p-2">
                  {FEATURES.map((f) => {
                    const copy = t.features.items[f.key];
                    const [r, g, b] = f.tint;
                    const current = path === `/${f.slug}`;
                    return (
                      <li key={f.key}>
                        <a
                          href={`${t.home}/${f.slug}`}
                          aria-current={current ? 'page' : undefined}
                          onClick={() => setOpen(false)}
                          className={`block rounded-[14px] px-4 py-3.5 transition-colors hover:bg-surface-2 ${current ? 'bg-surface-2' : ''}`}
                        >
                          <span className="flex items-center gap-2.5 text-[14.5px] font-medium text-ink">
                            <span className="h-[2px] w-5 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
                            {copy.name}
                          </span>
                          <span className="mt-1 block text-[13px] leading-snug text-muted">{join(copy.title)}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <a href={`${home}#features`} onClick={() => setOpen(false)} className="flex items-center justify-between border-t border-hair px-6 py-3.5 text-[13.5px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
                  {t.features.all}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Nav({
  t,
  home,
  path,
  isZh,
  isDark,
  swapping,
  onToggleLanguage,
  onToggleTheme,
}: {
  t: Messages;
  // "" on the home page; "/zh" or "/en" elsewhere, so section links lead back home.
  home: string;
  // the page below the language, "" on the home page
  path: string;
  isZh: boolean;
  isDark: boolean;
  swapping: boolean;
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
    [`${home}#security`, t.nav.security],
    [`${home}#download`, t.nav.download],
    [`${home}#faq`, t.nav.faq],
  ];

  const iconButton =
    'grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-[var(--hair)] hover:text-ink';
  // Words that change with the language fade out and back in; the controls
  // around them keep their size, so nothing in the bar moves.
  const label = `transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? 'border-hair backdrop-blur-xl backdrop-saturate-150' : 'border-transparent'
      }`}
      style={{ backgroundColor: scrolled || open ? 'var(--nav)' : 'transparent' }}
    >
      <div className="shell-wide flex h-16 items-center justify-between">
        <a href={home || '#top'} className="flex items-center gap-2.5" aria-label={t.a11y.home}>
          <RingMark className="h-[22px] w-[22px]" strokeWidth={3} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Whisper</span>
        </a>

        <nav className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex ${label}`} aria-label="Primary">
          <FeatureMenu t={t} home={home} path={path} label={t.nav.features} />
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
          <button type="button" onClick={onToggleLanguage} className={`${iconButton} text-[13px] font-medium`} aria-label={t.a11y.language}>
            <span className={label}>{isZh ? 'EN' : '中'}</span>
          </button>
          <button type="button" onClick={onToggleTheme} className={iconButton} aria-label={t.a11y.theme} aria-pressed={isDark}>
            <Icon name={isDark ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
          </button>
          <a href={`${home}#download`} className="btn btn-primary ml-2 hidden h-9 w-24 justify-center px-0 text-[14px] md:inline-flex">
            <span className={label}>{t.nav.getApp}</span>
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
              {/* the feature pages first, under their heading, then the home page's sections */}
              <div className="border-b border-hair pb-2">
                <a href={`${home}#features`} onClick={() => setOpen(false)} className="flex items-center justify-between py-3 text-[13px] text-faint">
                  {t.nav.features}
                  <span className="flex items-center gap-1 text-ink-2">
                    {t.features.all}
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </span>
                </a>
                {FEATURES.map((f) => {
                  const [r, g, b] = f.tint;
                  return (
                    <a
                      key={f.key}
                      href={`${t.home}/${f.slug}`}
                      aria-current={path === `/${f.slug}` ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-[17px] text-ink"
                    >
                      <span className="h-[2px] w-5 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
                      {t.features.items[f.key].name}
                    </a>
                  );
                })}
              </div>
              {links.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="border-b border-hair py-3.5 text-[17px] text-ink">
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
