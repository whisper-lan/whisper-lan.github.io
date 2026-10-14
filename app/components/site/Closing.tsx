'use client';
import { useId, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, Reveal, RingMark, useReducedMotion, useScrollProgress } from './primitives';
import { GITHUB } from './links';

export function Faq({ t, isZh }: { t: Messages; isZh: boolean }) {
  const f = t.faq;
  return (
    <section id="faq" className="scroll-mt-16 py-16 sm:py-32">
      <div className="shell grid gap-6 sm:gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="display text-ink" style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}>
            {f.title}
          </h2>
          <FaqMore t={t} isZh={isZh} className="mt-6 hidden lg:block" />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="border-t border-hair">
            {f.items.map((item) => (
              <details key={item.q} className="group border-b border-hair">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-[15.5px] font-medium text-ink transition-colors hover:text-ink-2 sm:gap-6 sm:py-6 sm:text-[17px]">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hair text-muted transition-transform duration-300 group-open:rotate-45">
                    <Icon name="plus" className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </summary>
                <p className="-mt-1 max-w-[44rem] pb-5 pr-8 text-[14.5px] leading-[1.75] text-muted sm:pb-7 sm:pr-12 sm:text-[15.5px] sm:leading-[1.8]">{item.a}</p>
              </details>
            ))}
          </div>
          {/* phones: the way out comes after the questions, not before */}
          <FaqMore t={t} isZh={isZh} className="mt-6 lg:hidden" />
        </Reveal>
      </div>
    </section>
  );
}

function FaqMore({ t, isZh, className }: { t: Messages; isZh: boolean; className: string }) {
  const f = t.faq;
  return (
    <div className={className}>
      <p className="text-[14px] text-muted sm:text-[15px]">{f.more}</p>
      <div className="mt-3 flex flex-col items-start gap-2 text-[15px]">
        <a href={isZh ? GITHUB.guide.zh : GITHUB.guide.en} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
          {f.guide}
          <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
        </a>
        <a href={GITHUB.issues} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
          {f.issue}
          <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

// The page ends where the brand begins: a wide ring closes in around the
// wordmark and settles into the app icon — the opening shot in reverse.
function LiveIcon() {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ['start 1', 'center 0.55']);
  const scale = useTransform(p, [0, 1], [2.6, 1]);
  const ringOpacity = useTransform(p, [0, 0.35], [0, 1]);
  const wordOpacity = useTransform(p, [0.55, 1], [0, 1]);
  const svgClass = 'absolute inset-0 h-full w-full overflow-visible';
  const gradient = (gid: string) => (
    <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="-120" y1="-140" x2="120" y2="140">
      <stop offset="0" stopColor="var(--ring-a)" />
      <stop offset="0.5" stopColor="var(--ring-b)" />
      <stop offset="1" stopColor="var(--ring-c)" />
    </linearGradient>
  );
  return (
    <motion.div ref={ref} className="relative mx-auto aspect-square w-[min(300px,58vw)]">
      <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { scale, opacity: ringOpacity }}>
        {/* glow, ripples and line on separate layers, like the opening ring */}
        <div className="breathe absolute inset-0">
          <svg viewBox="-160 -160 320 320" className={svgClass} aria-hidden="true">
            <defs>
              {gradient(`fg-${id}`)}
              <filter id={`fb-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            <circle r="140" fill="none" stroke={`url(#fg-${id})`} strokeWidth="8" filter={`url(#fb-${id})`} />
          </svg>
        </div>
        {!reduce &&
          [0, 3.75].map((delay) => (
            <div key={delay} className="ripple absolute inset-0" style={{ animationDelay: `-${delay}s` }}>
              <svg viewBox="-160 -160 320 320" className={svgClass} aria-hidden="true">
                <defs>{gradient(`fr-${id}-${delay}`)}</defs>
                <circle r="140" fill="none" stroke={`url(#fr-${id}-${delay})`} strokeWidth="1" />
              </svg>
            </div>
          ))}
        <svg viewBox="-160 -160 320 320" className={svgClass} aria-hidden="true">
          <defs>{gradient(`fi-${id}`)}</defs>
          <circle r="140" fill="none" stroke={`url(#fi-${id})`} strokeWidth="2.4" />
        </svg>
      </motion.div>
      <motion.span className="absolute inset-0 grid place-items-center text-[clamp(34px,9vw,46px)] font-light tracking-[0.06em] text-faint" style={reduce ? undefined : { opacity: wordOpacity }}>
        whisper
      </motion.span>
    </motion.div>
  );
}

export function Finale({ t, ctaHref, ctaLabel, direct, onDirectDownload }: { t: Messages; ctaHref: string; ctaLabel: string; direct: boolean; onDirectDownload: () => void }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-40">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(40% 50% at 50% 40%, color-mix(in srgb, var(--ring-b) 8%, transparent), transparent 70%)' }} />
      <div className="shell relative text-center">
        <LiveIcon />
        <Reveal delay={0.1}>
          <h2 className="display mt-10 text-ink sm:mt-14" style={{ fontSize: 'clamp(28px, 4.6vw, 60px)' }}>
            {t.finale.title}
          </h2>
          <p className="mt-4 text-[15px] text-muted sm:mt-5 sm:text-[17px]">{t.finale.desc}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-9">
            <a href={ctaHref} onClick={direct ? onDirectDownload : undefined} className="btn btn-primary">
              <Icon name="download" className="h-[18px] w-[18px]" strokeWidth={2} />
              {ctaLabel}
            </a>
            <a href={GITHUB.repo} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              GitHub
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ t, isZh }: { t: Messages; isZh: boolean }) {
  const f = t.footer;
  const product: [string, string][] = [
    ['#features', t.nav.features],
    ['#security', t.nav.security],
    ['#download', t.nav.download],
    ['#faq', t.nav.faq],
  ];
  const resources: [string, string][] = [
    [GITHUB.repo, f.links.source],
    [GITHUB.releases, f.links.releases],
    [isZh ? GITHUB.guide.zh : GITHUB.guide.en, f.links.guide],
    [GITHUB.issues, f.links.issues],
  ];
  return (
    <footer className="border-t border-hair">
      <div className="shell py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[1.6fr_1fr_1fr] sm:gap-12">
          <div className="col-span-2 sm:col-span-1">
            <a href="#top" className="flex items-center gap-2.5">
              <RingMark className="h-[22px] w-[22px]" strokeWidth={3} />
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Whisper</span>
            </a>
            <p className="mt-4 max-w-[18rem] text-[14px] leading-[1.7] text-muted">{f.tagline}</p>
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-faint">{f.product}</h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              {product.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-ink-2 transition-colors hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-faint">{f.resources}</h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              {resources.map(([href, label]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-ink-2 transition-colors hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-hair pt-6 text-[12px] text-faint sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:text-[12.5px]">
          <span>
            © {new Date().getFullYear()} lawnvi · {f.license}
          </span>
          <span>{f.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
