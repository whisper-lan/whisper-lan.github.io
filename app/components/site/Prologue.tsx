'use client';
import { memo, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { easeIn, motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { EASE_OUT, Icon, useReducedMotion, useScrollProgress } from './primitives';
import { RingStage } from './RingStage';
import { useSnapShots } from './scroll';

export type HeroCta = { label: string; href: string; direct: boolean };

// The opening is one continuous shot, pinned while it plays: the headline
// lifts away, the camera flies through the ring into the "room", and the
// manifesto lights up inside it. Every frame is a function of the scroll
// position, so it plays the same backwards.

// Chinese reveals character by character but wraps only between clauses;
// other languages reveal and wrap by word.
function clauses(text: string, cjk: boolean): string[][] {
  if (!cjk) return text.split(/\s+/).filter(Boolean).map((word) => [word]);
  const groups: string[][] = [[]];
  let prev = '';
  for (const ch of Array.from(text)) {
    groups[groups.length - 1].push(ch);
    if (/[，。、；：！？]/.test(ch) || (ch === '—' && prev === '—')) groups.push([]);
    prev = ch;
  }
  return groups.filter((g) => g.length);
}

// Each character lights over a span of its neighbours, so the light moves
// through the sentence as a soft wave, and rises a touch as it does.
function Token({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, ['0.12em', '0em']);
  return (
    <motion.span className="inline-block" style={{ opacity, y }}>
      {children}
    </motion.span>
  );
}

const WAVE = 6; // characters lit at once

// The body is a short poem: each "\n" starts a new line and an empty line
// leaves a stanza gap; a line too long for the screen wraps between clauses,
// balanced.
// memo: the opening re-renders once when its ring pauses; the text need not.
const ManifestoText = memo(function ManifestoText({ t, isZh, progress }: { t: Messages; isZh: boolean; progress?: MotionValue<number> }) {
  const lines = t.manifesto.body.split('\n').map((line) => clauses(line, isZh));
  const total = lines.flat().reduce((n, g) => n + g.length, 0);
  const span = 1 / (total + WAVE);
  let index = 0;
  return (
    <div className="mx-auto max-w-[1160px] text-center">
      <p className="display text-ink" style={{ fontSize: isZh ? 'clamp(22px, 3.2vw, 46px)' : 'clamp(20px, 2.7vw, 38px)', lineHeight: isZh ? 1.7 : 1.4, fontWeight: 500 }}>
        {lines.map((groups, l) => (
          <span key={l} className={groups.length ? 'block [text-wrap:balance]' : 'block h-[0.8em]'}>
            {groups.map((group, g) => (
              <span key={g} className={isZh ? 'inline-block' : 'inline-block pr-[0.28em]'}>
                {group.map((token) => {
                  const i = index++;
                  return progress ? (
                    <Token key={i} progress={progress} range={[i * span, (i + WAVE) * span]}>
                      {token}
                    </Token>
                  ) : (
                    <span key={i}>{token}</span>
                  );
                })}
              </span>
            ))}
          </span>
        ))}
      </p>
    </div>
  );
});

// `parts`: the whole block (wide screens), or the headline and the rest
// separately (phones, where the headline sits inside the ring).
const HeroCopy = memo(function HeroCopy({
  t,
  cta,
  meta,
  onDirectDownload,
  parts = 'all',
}: {
  t: Messages;
  cta: HeroCta;
  meta: string;
  onDirectDownload: () => void;
  parts?: 'all' | 'title' | 'body';
}) {
  const reduce = useReducedMotion();
  // A short intro on load only; everything after is driven by scrolling.
  const rise = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE_OUT },
        };

  const title = (
    <motion.h1 {...rise(0.1)} className="display text-ink" style={{ fontSize: 'var(--hero-h1)' }}>
      <span className="block">{t.hero.title[0]}</span>
      <span className="block" style={{ color: 'var(--title-2)' }}>
        {t.hero.title[1]}
      </span>
    </motion.h1>
  );
  if (parts === 'title') return <div className="text-center">{title}</div>;

  return (
    <div className="flex flex-col items-center text-center">
      {parts === 'all' && title}

      <motion.p
        {...rise(0.28)}
        className={`${parts === 'all' ? 'mt-6' : ''} break-keep text-muted [text-wrap:balance]`}
        style={{ fontSize: 'var(--hero-lead)', lineHeight: 1.6, maxWidth: 'var(--hero-copy)' }}
      >
        {t.hero.lead.map((line, i) => (
          <span key={line} className="md:block">
            {/* sentences run on in one paragraph on phones; Latin needs the space */}
            {i > 0 && !/[\u3000-\u9fff]/.test(line) && ' '}
            {line}
          </span>
        ))}
      </motion.p>

      <motion.div {...rise(0.4)} className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-9">
        <a href={cta.href} onClick={cta.direct ? onDirectDownload : undefined} className="btn btn-primary">
          <Icon name="download" className="h-[18px] w-[18px]" strokeWidth={2} />
          {cta.label}
        </a>
        <a href="#download" className="btn btn-quiet">
          {t.hero.allPlatforms}
        </a>
      </motion.div>

      <motion.p {...rise(0.5)} className="mono mt-5 text-[12px] tracking-wide text-faint">
        {meta}
      </motion.p>
    </div>
  );
});

// where the opening shot comes to rest: the manifesto fully lit
export const OPENING_REST = 0.88;
const REST = OPENING_REST;

const STAGE_VARS = { '--stage': 'min(clamp(780px, 90vh, 980px), calc(100vw - 32px))' } as CSSProperties;

export function Prologue({ t, isZh, cta, meta, onDirectDownload }: { t: Messages; isZh: boolean; cta: HeroCta; meta: string; onDirectDownload: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ['start start', 'end end']);
  // From the headline to the fully lit manifesto is one shot: the page never
  // comes to rest in the middle of it.
  useSnapShots(ref, [[0, REST]], !reduce);

  // 0 – 0.16: the headline lifts away
  const copyOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const copyY = useTransform(p, [0, 0.16], [0, -90]);
  // 0 – 0.34: the camera flies through the ring
  const detailOpacity = useTransform(p, [0, 0.08], [1, 0]);
  const ringScale = useTransform(p, [0, 0.34], [1, 3.1], { ease: easeIn });
  const ringOpacity = useTransform(p, [0.2, 0.33], [1, 0]);
  // On phones the ring sits above the middle of the view; it drifts to the
  // centre as the camera flies in.
  const slot = useRef<HTMLDivElement>(null);
  const shift = useRef(0);
  const ringY = useTransform(p, (v) => Math.min(1, v / 0.24) * shift.current);
  // the light goes down as the manifesto leaves, so the pinned view has no edge when it scrolls away
  const roomLight = useTransform(p, [0.08, 0.34, 0.9, 1], [0, 1, 1, 0]);
  const ambientLight = useTransform(p, [0.9, 1], [1, 0]);
  // 0.26 – 0.92: inside, the manifesto lights up word by word
  const manifestoOpacity = useTransform(p, [0.24, 0.36], [0, 1]);
  const manifestoScale = useTransform(p, [0.22, 0.42], [0.92, 1]);
  const reveal = useTransform(p, [0.32, REST - 0.01], [0, 1]);
  // On the way out the manifesto picks up speed before the pin lets go, so it
  // leaves at exactly the page's pace instead of being snatched away.
  const range = useRef(2520);
  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) range.current = Math.max(1, ref.current.offsetHeight - window.innerHeight);
      const s = slot.current;
      if (s) shift.current = ((s.offsetParent as HTMLElement | null)?.clientHeight ?? window.innerHeight) / 2 - (s.offsetTop + s.offsetHeight / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const departure = useTransform(p, (v) => {
    const c = Math.min(0.1, 260 / range.current);
    const x = Math.max(0, v - (1 - c));
    return (-range.current * x * x) / (2 * c);
  });

  // Let the light pulses rest while the ring is out of its resting place.
  const [zoomed, setZoomed] = useState(false);
  useMotionValueEvent(p, 'change', (v) => setZoomed(v > 0.03));

  const ambient = (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(60% 50% at 50% 46%, color-mix(in srgb, var(--ring-b) 9%, transparent), transparent 70%), radial-gradient(40% 30% at 20% 20%, color-mix(in srgb, var(--ring-a) 7%, transparent), transparent 70%), radial-gradient(40% 30% at 80% 85%, color-mix(in srgb, var(--ring-c) 6%, transparent), transparent 70%)',
      }}
    />
  );

  if (reduce) {
    return (
      <>
        <section id="top" className="hero relative overflow-hidden" style={STAGE_VARS}>
          {ambient}
          <div className="relative mx-auto flex max-w-[1360px] flex-col items-center px-5 pb-20 pt-32">
            <HeroCopy t={t} cta={cta} meta={meta} onDirectDownload={onDirectDownload} />
            <div className="relative mt-14 aspect-square w-full max-w-[460px]">
              <RingStage t={t} className="h-full w-full" />
            </div>
          </div>
        </section>
        <section className="shell py-28">
          <ManifestoText t={t} isZh={isZh} />
        </section>
      </>
    );
  }

  return (
    <section ref={ref} id="top" className="hero relative h-[380vh]" style={STAGE_VARS}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: ambientLight }}>
          {ambient}
        </motion.div>
        {/* once inside the ring, the whole view takes on its light */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: roomLight,
            background:
              'radial-gradient(75% 70% at 50% 50%, color-mix(in srgb, var(--ring-b) 11%, transparent), transparent 80%), radial-gradient(50% 50% at 15% 85%, color-mix(in srgb, var(--ring-a) 8%, transparent), transparent 75%), radial-gradient(50% 50% at 85% 15%, color-mix(in srgb, var(--ring-c) 7%, transparent), transparent 75%)',
          }}
        />

        {/* Both layouts are rendered and CSS picks one, so the first paint is
            already right on any screen. The hidden ring is out of view and idle. */}
        <div className="hidden md:contents">
          {/* the ring, with the headline inside it */}
          <div className="absolute left-1/2 top-[calc(50%+32px)] aspect-square w-[var(--stage)] -translate-x-1/2 -translate-y-1/2">
            <motion.div className="h-full w-full will-change-transform" style={{ scale: ringScale, opacity: ringOpacity }}>
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE_OUT }} className="h-full w-full">
                <RingStage t={t} className="h-full w-full" detailOpacity={detailOpacity} paused={zoomed} />
              </motion.div>
            </motion.div>
          </div>
          <motion.div className="absolute inset-0 flex items-center justify-center px-5 pt-16" style={{ opacity: copyOpacity, y: copyY }}>
            <HeroCopy t={t} cta={cta} meta={meta} onDirectDownload={onDirectDownload} />
          </motion.div>
        </div>
        {/* Phones: the ring fills the upper part of the view with the headline
            inside it, as on wide screens; the rest of the copy sits below. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-4 pt-16 md:hidden">
          <div ref={slot} className="relative aspect-square w-[min(86vw,380px)] shrink-0">
            <motion.div className="h-full w-full will-change-transform" style={{ scale: ringScale, opacity: ringOpacity, y: ringY }}>
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE_OUT }} className="h-full w-full">
                <RingStage t={t} className="h-full w-full" detailOpacity={detailOpacity} paused={zoomed} receipts={false} />
              </motion.div>
            </motion.div>
            <motion.div className="absolute inset-0 flex items-center justify-center px-[8%]" style={{ opacity: copyOpacity, y: copyY }}>
              <HeroCopy t={t} cta={cta} meta={meta} onDirectDownload={onDirectDownload} parts="title" />
            </motion.div>
          </div>
          <motion.div className="mt-6 w-full" style={{ opacity: copyOpacity, y: copyY }}>
            <HeroCopy t={t} cta={cta} meta={meta} onDirectDownload={onDirectDownload} parts="body" />
          </motion.div>
        </div>

        {/* inside the ring */}
        <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6" style={{ opacity: manifestoOpacity, scale: manifestoScale, y: departure }}>
          <ManifestoText t={t} isZh={isZh} progress={reveal} />
        </motion.div>

      </div>
    </section>
  );
}
