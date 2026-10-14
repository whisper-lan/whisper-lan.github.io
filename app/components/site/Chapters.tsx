'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, Reveal, useMediaQuery, useReducedMotion, useScrollProgress, useStill } from './primitives';
import { OPENING_REST } from './Prologue';
import { useSnapGap, useSnapPages } from './scroll';
import { TransferScene } from '../scenes/TransferScene';
import { InputScene } from '../scenes/InputScene';
import { AudioScene } from '../scenes/AudioScene';
import { CastScene } from '../scenes/CastScene';

type ChapterKey = keyof Messages['chapters']['items'];
export type SceneProps = { t: Messages; progress: MotionValue<number> };

// tint: the stage's light for each chapter, as r, g, b
const CHAPTERS: { key: ChapterKey; Scene: ComponentType<SceneProps>; tint: [number, number, number] }[] = [
  { key: 'transfer', Scene: TransferScene, tint: [42, 143, 224] },
  { key: 'input', Scene: InputScene, tint: [59, 179, 164] },
  { key: 'audio', Scene: AudioScene, tint: [143, 212, 67] },
  { key: 'cast', Scene: CastScene, tint: [197, 107, 143] },
];
const N = CHAPTERS.length;

// `parts`: all of it, or the heading and the text separately (phones put the
// scene between them).
function ChapterText({ t, chapter, index, parts = 'all' }: { t: Messages; chapter: ChapterKey; index: number; parts?: 'all' | 'head' | 'body' }) {
  const c = t.chapters.items[chapter];
  const [r, g, b] = CHAPTERS[index].tint;
  const head = (
    <>
      {/* the short rule takes the colour of this chapter's light on the stage */}
      <p className="kicker flex items-center gap-3">
        <span className="mono text-faint">{String(index + 1).padStart(2, '0')}</span>
        <span className="h-[2px] w-7 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
        {c.kicker}
      </p>
      <h3 className="display mt-4 text-ink sm:mt-5" style={{ fontSize: 'clamp(26px, 3.6vw, 48px)' }}>
        <span className="block">{c.title[0]}</span>
        <span className="block">{c.title[1]}</span>
      </h3>
    </>
  );
  const body = (
    <>
      <p className={`${parts === 'all' ? 'mt-6' : ''} max-w-[34rem] text-[15px] leading-[1.75] text-muted sm:text-[17px]`}>{c.desc}</p>
      <ul className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
        {c.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[14px] text-ink-2 sm:text-[15px]">
            <span className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon name="check" className="h-3 w-3" strokeWidth={2.6} />
            </span>
            {point}
          </li>
        ))}
      </ul>
    </>
  );
  if (parts === 'head') return head;
  if (parts === 'body') return body;
  return (
    <>
      {head}
      {body}
    </>
  );
}

function StageFrame({ background, children }: { background: MotionValue<string> | string; children: ReactNode }) {
  return (
    <motion.div className="relative overflow-hidden rounded-[32px] border border-hair bg-surface-2" style={{ backgroundImage: background }}>
      <div className="px-[6%] py-[7%]">{children}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Large screens: the chapter text scrolls with the page while the stage
// stays in view beside it. Inside the stage the four scenes sit on one
// vertical strip that slides up — the same direction as the text — whenever
// one chapter hands over to the next, easing in and out of each move. The
// stage itself glides into place and away again (see useCushion), so nothing
// stops or starts abruptly.
// ---------------------------------------------------------------------------

const CUSHION = 220; // px of scroll over which the stage eases in and out of its resting place
const HANDOVER = 0.34; // half-width of a scene change, as a fraction of a chapter's height

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

type Geometry = { titleMid: number; colTop: number; colH: number; stageH: number; vh: number; stickyTop: number };

// Offset for a sticky element so its speed changes smoothly: it keeps moving
// with the page as it reaches its sticky point and slows to rest over
// `CUSHION` px, then picks up speed again before it is released, matching the
// page exactly at both ends.
function cushionOffset(d: number, travel: number) {
  const L = CUSHION;
  if (d <= 0) return 0;
  if (d < L) return -(d - (d * d) / (2 * L));
  if (d < travel - L) return -L / 2;
  if (d < travel) {
    const x = d - (travel - L);
    return -L / 2 - (x * x) / (2 * L);
  }
  return -L;
}

function useStoryClock(playing: boolean, duration = 2.8) {
  const clock = useMotionValue(0);
  useEffect(() => {
    if (playing) {
      clock.set(0);
      const controls = animate(clock, 1, { duration, ease: [0.45, 0, 0.25, 1], delay: 0.1 });
      return () => controls.stop();
    }
    const timer = window.setTimeout(() => clock.set(0), 900);
    return () => window.clearTimeout(timer);
  }, [playing, clock, duration]);
  return clock;
}

// One scene on the strip, with its own light. Its story plays once it has
// settled into the frame and rewinds after it has left.
function Panel({ t, i, playing }: { t: Messages; i: number; playing: boolean }) {
  const clock = useStoryClock(playing);
  const { Scene, tint } = CHAPTERS[i];
  const [r, g, b] = tint;
  return (
    <div
      className={`relative px-[6%] py-[6%] ${i > 0 ? 'border-t border-hair' : ''}`}
      style={{
        height: `${100 / N}%`,
        backgroundImage: `radial-gradient(80% 70% at 70% 20%, rgba(${r}, ${g}, ${b}, 0.15), transparent 70%), radial-gradient(60% 60% at 10% 100%, rgba(${r}, ${g}, ${b}, 0.08), transparent 70%)`,
      }}
    >
      <Scene t={t} progress={clock} />
    </div>
  );
}

// Chapter text in the page flow; it is brightest while it crosses the middle.
function FlowText({ t, i }: { t: Messages; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ['start end', 'end start']);
  const opacity = useTransform(p, [0.12, 0.4, 0.6, 0.88], [0.12, 1, 1, 0.12]);
  return (
    <div ref={ref} data-anchor className="flex h-[100vh] items-center">
      <motion.div style={{ opacity }}>
        <ChapterText t={t} chapter={CHAPTERS[i].key} index={i} />
      </motion.div>
    </div>
  );
}

function Dot({ k, i }: { k: MotionValue<number>; i: number }) {
  const near = useTransform(k, (v) => Math.max(0, 1 - Math.abs(v - i)));
  const width = useTransform(near, [0, 1], [6, 22]);
  const opacity = useTransform(near, [0, 1], [0.25, 1]);
  return <motion.span className="h-1.5 rounded-full bg-ink" style={{ width, opacity }} />;
}

// The section title: one line on wide screens, broken at the comma on small ones.
function SectionTitle({ t, className = '' }: { t: Messages; className?: string }) {
  return (
    <h2 className={`display text-ink ${className}`} style={{ fontSize: 'clamp(26px, 4vw, 56px)' }}>
      <span className="block lg:inline">{t.chapters.title[0]}</span>
      <span className="block lg:inline">{t.chapters.title[1]}</span>
    </h2>
  );
}

// Where the section title rests: a little above the middle, with the top of
// the stage rising into view below it.
const TITLE_AT = 0.4;

function FlowChapters({ t }: { t: Messages }) {
  const intro = useRef<HTMLDivElement>(null);
  const col = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const geo = useRef<Geometry>({ titleMid: 0, colTop: 0, colH: 1, stageH: 1, vh: 900, stickyTop: 200 });
  const [stickyTop, setStickyTop] = useState(200);

  // Measure on layout changes only; reading layout every frame would stall.
  useLayoutEffect(() => {
    const measure = () => {
      const c = col.current;
      const s = stage.current;
      const h = intro.current;
      if (!c || !s || !h) return;
      const vh = window.innerHeight;
      const stageH = s.offsetHeight;
      const rest = Math.max(80, (vh - stageH) / 2 + 28);
      const top = Math.round(rest + CUSHION / 2);
      // the sticky element travels within its own column, not the whole grid
      const track = s.parentElement ?? c;
      const box = h.getBoundingClientRect();
      geo.current = {
        titleMid: box.top + window.scrollY + box.height / 2,
        colTop: track.getBoundingClientRect().top + window.scrollY,
        colH: track.offsetHeight,
        stageH,
        vh,
        stickyTop: top,
      };
      setStickyTop(top);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [intro.current, col.current, stage.current, document.body].forEach((el) => el && observer.observe(el));
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // The section title is the first page, so it is never swept past; then each
  // chapter is a page: its text centred and its scene settled. A flick moves
  // one page at a time, so none is skipped by accident.
  const pages = useCallback(() => {
    const g = geo.current;
    return [g.titleMid - TITLE_AT * g.vh, ...CHAPTERS.map((_, i) => g.colTop + i * g.vh)];
  }, []);
  useSnapPages(pages);
  // Between the lit manifesto and the title there is nothing to stop on: the
  // manifesto leaves as the title arrives, so that stretch is one shot.
  const gap = useCallback(() => {
    const opening = document.getElementById('top');
    if (!opening) return null;
    const top = opening.getBoundingClientRect().top + window.scrollY;
    return [Math.round(top + OPENING_REST * (opening.offsetHeight - window.innerHeight)), Math.round(pages()[0])] as const;
  }, [pages]);
  useSnapGap(gap);

  const offset = useTransform(scrollY, (y) => {
    const g = geo.current;
    return cushionOffset(y - (g.colTop - g.stickyTop), g.colH - g.stageH);
  });
  // Continuous chapter position: 1.5 means halfway from the second scene to the third.
  const k = useTransform(scrollY, (y) => {
    const g = geo.current;
    let v = 0;
    for (let i = 1; i < N; i++) {
      const centre = g.colTop + i * g.vh - g.vh / 2;
      const half = HANDOVER * g.vh;
      v += easeInOutSine(clamp01((y - (centre - half)) / (2 * half)));
    }
    return v;
  });
  const stripY = useTransform(k, (v) => `${(-v * 100) / N}%`);

  const inView = useInView(stage, { amount: 0.4 });
  const [settled, setSettled] = useState(0);
  useMotionValueEvent(k, 'change', (v) => {
    const r = Math.round(v);
    setSettled(Math.abs(v - r) < 0.12 ? r : -1);
  });

  return (
    <>
      <div className="shell-wide">
        <div ref={intro} data-anchor className="mb-[18vh]">
          <Reveal>
            <SectionTitle t={t} />
          </Reveal>
        </div>
      </div>
      <div ref={col} className="shell-wide grid grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-x-16 pb-[8vh]">
        <div>
          {CHAPTERS.map((c, i) => (
            <FlowText key={c.key} t={t} i={i} />
          ))}
          {/* lengthens the row, so the stage stays until the last chapter's text has passed the middle */}
          <div aria-hidden="true" className="h-[50vh]" />
        </div>
        <div className="relative">
          <div ref={stage} className="sticky" style={{ top: stickyTop }}>
            <motion.div style={{ y: offset }}>
              <div className="relative overflow-hidden rounded-[32px] border border-hair bg-surface-2" style={{ aspectRatio: '1 / 0.82' }}>
                <motion.div className="absolute inset-x-0 top-0 will-change-transform" style={{ height: `${N * 100}%`, y: stripY }}>
                  {CHAPTERS.map((c, i) => (
                    <Panel key={c.key} t={t} i={i} playing={inView && settled === i} />
                  ))}
                </motion.div>
              </div>
              <div className="mt-5 flex justify-center gap-2">
                {CHAPTERS.map((c, i) => (
                  <Dot key={c.key} k={k} i={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Small screens: chapters stack, and each scene plays as it crosses the view.
// ---------------------------------------------------------------------------

function StackedChapter({ t, i }: { t: Messages; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const p = useScrollProgress(ref, ['start 0.85', 'end 0.55']);
  const still = useStill(1);
  const { key, Scene, tint } = CHAPTERS[i];
  const [r, g, b] = tint;
  return (
    <div>
      <Reveal>
        <ChapterText t={t} chapter={key} index={i} parts="head" />
      </Reveal>
      <Reveal className="mt-6">
        <div ref={ref}>
          <StageFrame background={`radial-gradient(80% 70% at 70% 20%, rgba(${r}, ${g}, ${b}, 0.15), transparent 70%), radial-gradient(60% 60% at 10% 100%, rgba(${r}, ${g}, ${b}, 0.08), transparent 70%)`}>
            <div className="relative" style={{ aspectRatio: '680 / 540' }}>
              <div className="absolute inset-0">
                <Scene t={t} progress={reduce ? still : p} />
              </div>
            </div>
          </StageFrame>
        </div>
      </Reveal>
      <Reveal className="mt-6">
        <ChapterText t={t} chapter={key} index={i} parts="body" />
      </Reveal>
    </div>
  );
}

export function Chapters({ t }: { t: Messages }) {
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');

  return (
    <section id="features" className="relative scroll-mt-16 pt-20 sm:pt-32">
      {wide && !reduce ? (
        <FlowChapters t={t} />
      ) : (
        <div className="shell-wide space-y-16 pb-16 sm:space-y-24 sm:pb-24">
          <Reveal>
            <SectionTitle t={t} />
          </Reveal>
          {CHAPTERS.map((c, i) => (
            <StackedChapter key={c.key} t={t} i={i} />
          ))}
        </div>
      )}
    </section>
  );
}
