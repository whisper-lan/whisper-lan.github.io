'use client';
import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, Reveal, useScrollProgress } from './primitives';

const CODE = ['482', '913'];

function CodePanel({ device, icon, t, delay }: { device: string; icon: string; t: Messages; delay: number }) {
  return (
    <Reveal delay={delay} y={48} className="w-full sm:w-[260px]">
      <div className="rounded-[24px] border border-hair bg-surface p-6 shadow-float">
        <div className="flex items-center gap-2.5 text-[13px] text-muted">
          <Icon name={icon} className="h-4 w-4" />
          {device}
        </div>
        <p className="mt-7 text-[12px] text-faint">{t.security.code}</p>
        <p className="mono mt-1 flex gap-3 text-[40px] font-medium tracking-[0.06em] text-ink">
          <span>{CODE[0]}</span>
          <span>{CODE[1]}</span>
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2 text-[13px]">
          <span className="rounded-full border border-hair py-2 text-center text-muted">✕</span>
          <span className="rounded-full bg-accent py-2 text-center font-medium text-accent-ink">{t.security.confirm}</span>
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
  const enter = useScrollProgress(ref, ['start 0.8', 'start 0.5']);
  const leave = useScrollProgress(ref, ['end 0.8', 'end 0.5']);
  const dim = useTransform([enter, leave], ([a, b]: number[]) => a * (1 - b));
  return (
    // Always dark: a quiet, deliberate change of light for the trust story.
    <section ref={ref} id="security" className="dark relative scroll-mt-16 py-32 text-ink sm:py-44" style={{ colorScheme: 'dark' }}>
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-black" style={{ opacity: dim }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(50% 60% at 75% 40%, color-mix(in srgb, var(--ring-a) 16%, transparent), transparent 70%), radial-gradient(40% 50% at 15% 90%, color-mix(in srgb, var(--ring-c) 10%, transparent), transparent 70%)' }}
      />
      <div className="shell relative">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal>
            <p className="kicker">{s.kicker}</p>
            <h2 className="display mt-4 text-ink" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>
              {s.title}
            </h2>
            <p className="mt-6 max-w-[30rem] text-[17px] leading-[1.75] text-muted">{s.desc}</p>
          </Reveal>

          <div className="flex flex-col items-center">
            <div className="z-10 mb-4 flex items-center gap-1.5 rounded-full border border-hair bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-medium text-ok shadow-card">
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
              {s.match}
            </div>
            <svg viewBox="0 0 300 28" className="hidden h-7 w-[300px] sm:block" fill="none" aria-hidden="true">
              <path d="M150 0v10M150 10H20a8 8 0 0 0-8 8v10M150 10h130a8 8 0 0 1 8 8v10" stroke="var(--hair-2)" strokeWidth="1.5" />
            </svg>
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <CodePanel device="MacBook Pro" icon="laptop" t={t} delay={0} />
              <CodePanel device={t.scenes.peers[0].name} icon="phone" t={t} delay={0.12} />
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-[24px] border border-hair bg-[var(--hair)] sm:grid-cols-3">
          {s.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="bg-bg-2 p-7">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-hair bg-surface text-ink">
                <Icon name={icons[i]} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.7] text-muted">{item.desc}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 max-w-[52rem] text-[12.5px] leading-[1.7] text-faint">{s.note}</p>
      </div>
    </section>
  );
}
