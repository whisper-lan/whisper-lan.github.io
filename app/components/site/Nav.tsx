'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { FEATURES, type FeatureKey } from '@/lib/features';
import { FEATURE_SCENES } from '../scenes/featureScenes';
import { Icon, RingMark, useReducedMotion, useStill, useStoryClock } from './primitives';
import { GITHUB } from './links';

// Feature pages are headed the way the home page heads its chapters: a number
// and the chapter's short rule, then the name. Colour stays in that rule.
function Kicker({ index, tint, children }: { index: number; tint: [number, number, number]; children?: ReactNode }) {
  const [r, g, b] = tint;
  return (
    <span className="kicker flex items-center gap-3">
      <span className="mono text-faint">{String(index + 1).padStart(2, '0')}</span>
      <span className="h-[2px] w-7 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
      {children}
    </span>
  );
}

// A feature's own scene, telling its story once each time it comes on stage.
function ScenePreview({ t, feature }: { t: Messages; feature: FeatureKey }) {
  const reduce = useReducedMotion();
  const clock = useStoryClock(!reduce);
  const still = useStill(1);
  const Scene = FEATURE_SCENES[feature];
  return <Scene t={t} progress={reduce ? still : clock} />;
}

type MenuProps = { t: Messages; home: string; path: string; guide: string; onEnter: () => void; onLeave: () => void; onPick: () => void };

const EASE = [0.22, 1, 0.36, 1] as const;

// Wide screens: the bar opens into a small stage. The four pages are listed
// in large type; the one under the pointer lights up, takes its chapter's
// rule, and its scene plays beside it in that chapter's light. The page
// behind dims a little.
function Flyout({ t, home, path, guide, onEnter, onLeave, onPick }: MenuProps) {
  const here = FEATURES.findIndex((f) => path === `/${f.slug}`);
  const [active, setActive] = useState(Math.max(0, here));
  const feature = FEATURES[active];
  const copy = t.features.items[feature.key];

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onMouseEnter={onLeave}
        onClick={onPick}
        className="absolute inset-x-0 top-full hidden h-screen md:block"
        style={{ background: 'var(--scrim)' }}
      />
      <motion.div
        id="feature-menu"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: EASE }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="absolute inset-x-0 top-full hidden border-b border-hair shadow-float md:block"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="shell-wide grid items-center gap-16 pb-10 pt-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <ul>
              {FEATURES.map((f, i) => {
                const on = i === active;
                const [r, g, b] = f.tint;
                return (
                  <motion.li key={f.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.04 + i * 0.035, ease: EASE }}>
                    <a
                      href={`${t.home}/${f.slug}`}
                      aria-current={i === here ? 'page' : undefined}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={onPick}
                      className="flex items-center gap-4 py-[7px]"
                    >
                      <span className={`mono w-5 text-[12px] transition-colors duration-200 ${on ? 'text-muted' : 'text-faint'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span
                        className="h-[2px] w-7 shrink-0 origin-left rounded-full transition-transform duration-300 ease-out"
                        style={{ background: `rgb(${r} ${g} ${b})`, transform: on ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                      <span className={`display whitespace-nowrap transition-colors duration-200 ${on ? 'text-ink' : 'text-faint'}`} style={{ fontSize: 'clamp(22px, 2.1vw, 30px)' }}>
                        {t.features.items[f.key].name}
                      </span>
                      {/* the page you are on */}
                      {i === here && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} title={t.features.current} />}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-8 flex items-center gap-6 pl-[84px] text-[13.5px]">
              <a href={`${home}#features`} onClick={onPick} className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink">
                {t.features.all}
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </a>
              <a href={guide} target="_blank" rel="noopener noreferrer" onClick={onPick} className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink">
                {t.features.guide}
                <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <motion.a
            href={`${t.home}/${feature.slug}`}
            onClick={onPick}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
            className="group relative hidden overflow-hidden rounded-[28px] border border-hair bg-surface-2 lg:block"
          >
            {/* each page's light, so the stage changes colour as the pointer moves */}
            {FEATURES.map((f, i) => {
              const [r, g, b] = f.tint;
              return (
                <span
                  key={f.key}
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    opacity: i === active ? 1 : 0,
                    backgroundImage: `radial-gradient(70% 80% at 72% 18%, rgba(${r}, ${g}, ${b}, 0.2), transparent 70%), radial-gradient(60% 70% at 8% 100%, rgba(${r}, ${g}, ${b}, 0.1), transparent 70%)`,
                  }}
                />
              );
            })}
            <div className="relative flex h-[288px] items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.36, ease: EASE }}
                  className="w-[340px]"
                >
                  <ScenePreview t={t} feature={feature.key} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative flex items-center justify-between gap-6 border-t border-hair px-7 py-4">
              <span className="truncate text-[14px] text-ink-2">{copy.summary}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-ink">
                {t.features.more}
                <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </>
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
  // "功能" opens the feature menu: on hover, or by click and keyboard.
  const [menu, setMenu] = useState(false);
  const header = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const showMenu = () => {
    window.clearTimeout(timer.current);
    setMenu(true);
  };
  const hideMenu = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMenu(false), 160);
  };
  const closeMenu = () => {
    window.clearTimeout(timer.current);
    setMenu(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    const onDown = (e: PointerEvent) => !header.current?.contains(e.target as Node) && setMenu(false);
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [menu]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const links: [string, string][] = [
    [`${home}#security`, t.nav.security],
    [`${home}#download`, t.nav.download],
    [`${home}#faq`, t.nav.faq],
  ];
  const menuProps: MenuProps = { t, home, path, guide: isZh ? GITHUB.guide.zh : GITHUB.guide.en, onEnter: showMenu, onLeave: hideMenu, onPick: closeMenu };

  const iconButton =
    'grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-[var(--hair)] hover:text-ink';
  // Words that change with the language fade out and back in; the controls
  // around them keep their size, so nothing in the bar moves.
  const label = `transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`;
  const solid = scrolled || open || menu;
  // the menu carries the bar's lower edge while it is open
  const edge = solid && !menu;

  return (
    <header
      ref={header}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? 'backdrop-blur-xl backdrop-saturate-150' : ''
      } ${edge ? 'border-hair' : 'border-transparent'}`}
      // opaque while the menu is open, so nothing shows through either part
      style={{ backgroundColor: menu ? 'var(--bg)' : solid ? 'var(--nav)' : 'transparent' }}
    >
      <div className="shell-wide flex h-16 items-center justify-between">
        <a href={home || '#top'} className="flex items-center gap-2.5" aria-label={t.a11y.home}>
          <RingMark className="h-[22px] w-[22px]" strokeWidth={3} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Whisper</span>
        </a>

        <nav className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex ${label}`} aria-label="Primary">
          <button
            type="button"
            onClick={() => (menu ? closeMenu() : showMenu())}
            onMouseEnter={showMenu}
            onMouseLeave={hideMenu}
            aria-expanded={menu}
            aria-controls="feature-menu"
            className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] transition-colors hover:text-ink ${menu ? 'text-ink' : 'text-ink-2'}`}
          >
            {t.nav.features}
            <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform duration-200 ${menu ? 'rotate-180' : ''}`} strokeWidth={2} />
          </button>
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

      <AnimatePresence>{menu && <Flyout {...menuProps} />}</AnimatePresence>

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
              {/* the feature pages first, headed like the chapters, then the home page's sections */}
              <div className="border-b border-hair pb-3">
                <a href={`${home}#features`} onClick={() => setOpen(false)} className="flex items-center justify-between py-3 text-[13px] text-faint">
                  {t.nav.features}
                  <span className="flex items-center gap-1 text-ink-2">
                    {t.features.all}
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </span>
                </a>
                {FEATURES.map((f, i) => {
                  const copy = t.features.items[f.key];
                  return (
                    <a
                      key={f.key}
                      href={`${t.home}/${f.slug}`}
                      aria-current={path === `/${f.slug}` ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 py-2.5"
                    >
                      <Kicker index={i} tint={f.tint} />
                      <span className="text-[17px] text-ink">{copy.name}</span>
                      <span className="col-start-2 text-[12.5px] text-muted">{copy.summary}</span>
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
