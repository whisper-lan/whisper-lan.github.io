'use client';
import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, Reveal, useScrollProgress } from './primitives';

const CODE = ['482', '913'];

function CodePanel({ device, icon, t, delay }: { device: string; icon: string; t: Messages; delay: number }) {
  return (
    <Reveal delay={delay} y={48} className="min-w-0 flex-1 sm:w-[260px] sm:flex-none">
      <div className="rounded-[20px] border border-hair bg-surface p-4 shadow-float sm:rounded-[24px] sm:p-6">
        <div className="flex items-center gap-2 text-[12px] text-muted sm:gap-2.5 sm:text-[13px]">
          <Icon name={icon} className="h-4 w-4 shrink-0" />
          <span className="truncate">{device}</span>
        </div>
        <p className="mt-4 text-[11px] text-faint sm:mt-7 sm:text-[12px]">{t.security.code}</p>
        <p className="mono mt-1 flex gap-2 text-[23px] font-medium tracking-[0.04em] text-ink sm:gap-3 sm:text-[40px] sm:tracking-[0.06em]">
          <span>{CODE[0]}</span>
          <span>{CODE[1]}</span>
        </p>
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-1.5 text-[12px] sm:mt-7 sm:grid-cols-2 sm:gap-2 sm:text-[13px]">
          <span className="rounded-full border border-hair px-3 py-1.5 text-center text-muted sm:py-2">✕</span>
          <span className="truncate rounded-full bg-accent px-2 py-1.5 text-center font-medium text-accent-ink sm:py-2">{t.security.confirm}</span>
        </div>
      </div>
    </Reveal>
  );
}

export function Security({ t }: { t: Messages }) {
  const s = t.security;
  const icons = ['lock', 'router', 'code'];
  // The page dims to black as this section arrives and brightens again as it
  // leaves: one fixed layer behind everything, so there is no visible seam.
  // (The scroll hooks live here because the section's ref must already be
  // attached when they start measuring.)
  const ref = useRef<HTMLElement>(null);
  // late enough that the section before it has mostly left the view
  const enter = useScrollProgress(ref, ['start 0.7', 'start 0.4']);
  const leave = useScrollProgress(ref, ['end 0.8', 'end 0.5']);
  const dim = useTransform([enter, leave], ([a, b]: number[]) => a * (1 - b));
  return (
    // Always dark: a quiet, deliberate change of light for the trust story.
    // Phones get no full-screen dimming, which would veil the sections around
    // it on a small screen; the band fades to black at its own edges instead.
    <section
      ref={ref}
      id="security"
      className="dark relative scroll-mt-16 bg-[linear-gradient(to_bottom,transparent,#000_140px,#000_calc(100%-140px),transparent)] pb-36 pt-40 text-ink md:bg-none md:py-44"
      style={{ colorScheme: 'dark' }}
    >
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 hidden bg-black md:block" style={{ opacity: dim }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(50% 60% at 75% 40%, color-mix(in srgb, var(--ring-a) 16%, transparent), transparent 70%), radial-gradient(40% 50% at 15% 90%, color-mix(in srgb, var(--ring-c) 10%, transparent), transparent 70%)' }}
      />
      <div className="shell relative">
        <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal>
            <p className="kicker">{s.kicker}</p>
            <h2 className="display mt-4 text-ink" style={{ fontSize: 'clamp(30px, 5vw, 68px)' }}>
              {s.title}
            </h2>
            <p className="mt-5 max-w-[30rem] text-[15px] leading-[1.75] text-muted sm:mt-6 sm:text-[17px]">{s.desc}</p>
          </Reveal>

          <div className="flex flex-col items-center">
            <div className="z-10 mb-4 flex items-center gap-1.5 rounded-full border border-hair bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-medium text-ok shadow-card">
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
              {s.match}
            </div>
            <svg viewBox="0 0 300 28" className="hidden h-7 w-[300px] sm:block" fill="none" aria-hidden="true">
              <path d="M150 0v10M150 10H20a8 8 0 0 0-8 8v10M150 10h130a8 8 0 0 1 8 8v10" stroke="var(--hair-2)" strokeWidth="1.5" />
            </svg>
            <div className="flex w-full flex-row items-start justify-center gap-3 sm:gap-4">
              <CodePanel device="MacBook Pro" icon="laptop" t={t} delay={0} />
              <CodePanel device={t.scenes.peers[0].name} icon="phone" t={t} delay={0.12} />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-hair bg-[var(--hair)] sm:mt-20 sm:grid-cols-3">
          {s.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="flex items-start gap-4 bg-bg-2 p-5 sm:block sm:p-7">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-hair bg-surface text-ink sm:h-10 sm:w-10 sm:rounded-[12px]">
                <Icon name={icons[i]} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold text-ink sm:mt-5 sm:text-[17px]">{item.title}</h3>
                <p className="mt-1 text-[14px] leading-[1.65] text-muted sm:mt-2 sm:text-[14.5px] sm:leading-[1.7]">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-5 max-w-[52rem] text-[12px] leading-[1.7] text-faint sm:mt-6 sm:text-[12.5px]">{s.note}</p>
      </div>
    </section>
  );
}
