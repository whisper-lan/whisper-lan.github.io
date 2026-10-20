'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { Fit, Landscape, Phone } from './frames';

// A window leaves the laptop for the phone. The phone's Flow page lists the
// laptop's open windows as a stack of cards, the way the app draws them; a
// tap on the front card grows it into the whole screen while the window
// itself slips off the laptop's display (it keeps running there, out of
// sight). Then the keyboard comes up, the window gets shorter above it, and
// the reply is finished on the phone. At 1 the line is written.
// The scene's own progress is spread over 5 % – 92 % of its stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

const SCREEN = { left: 16, top: 104, width: 420, height: 262 };
const LETTER = { left: 128, top: 74, width: 232, height: 162 };
// The phone's screen below the status bar, and the front card on it: the
// card has the screen's shape, so opening it is one uniform scale.
const VIEW = { width: 186, height: 372 };
const CARD = { left: 88, top: 114, scale: 0.45 };
const KEYBOARD = 128;
const TAP = [0.24, 0.27, 0.33];
const OPEN = [0.3, 0.46];
const KEYS = [0.54, 0.62];
const TYPE = [0.66, 0.94];

function Lights({ size = 6 }: { size?: number }) {
  return (
    <span className="flex gap-[4px]">
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <i key={c} className="rounded-full" style={{ width: size, height: size, background: c }} />
      ))}
    </span>
  );
}

// The reply as the laptop shows it.
function LetterOnLaptop({ s }: { s: Messages['scenes'] }) {
  return (
    <div className="flex h-full flex-col rounded-[10px] border border-app-line bg-app-surface shadow-float">
      <div className="relative flex items-center border-b border-app-line px-2.5 py-2">
        <Lights />
        <span className="absolute inset-x-0 text-center text-[10.5px] font-semibold text-app-text2">{s.letterTitle}</span>
      </div>
      <div className="px-4 pt-3.5">
        <span className="block text-[13px] font-medium text-app-text">{s.letterLine}</span>
        <div className="mt-3 space-y-1.5">
          <i className="block h-[4px] w-4/5 rounded-full bg-app-muted" />
          <i className="block h-[4px] w-3/5 rounded-full bg-app-muted" />
          <i className="block h-[4px] w-2/3 rounded-full bg-app-muted" />
        </div>
      </div>
    </div>
  );
}

// The same window on the phone, sized for its screen. `typed` and `caret`
// only move once it is open; `lift` raises its bottom edge above the keyboard.
function LetterOnPhone({ s, typed, caret, lift }: { s: Messages['scenes']; typed?: MotionValue<string>; caret?: MotionValue<number>; lift?: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-app-surface">
      <div className="relative flex items-center border-b border-app-line px-3.5 py-3">
        <Lights size={8} />
        <span className="absolute inset-x-0 text-center text-[12px] font-semibold text-app-text2">{s.letterTitle}</span>
      </div>
      <div className="px-4 pt-4">
        <span className="block text-[15px] font-medium leading-[1.5] text-app-text">{s.letterLine}</span>
        <span className="flex min-h-[24px] items-center text-[15px] font-medium leading-[1.5] text-app-text">
          {typed && <motion.span>{typed}</motion.span>}
          {caret && (
            // the blink is a CSS animation, which would override an inline opacity on the same element
            <motion.span className="ml-[1px] inline-flex" style={{ opacity: caret }}>
              <i className="inline-block h-[17px] w-[1.5px] bg-app-primary motion-safe:animate-pulse" />
            </motion.span>
          )}
        </span>
        <div className="mt-4 space-y-2">
          <i className="block h-[5px] w-4/5 rounded-full bg-app-muted" />
          <i className="block h-[5px] w-3/5 rounded-full bg-app-muted" />
          <i className="block h-[5px] w-2/3 rounded-full bg-app-muted" />
          <i className="block h-[5px] w-1/2 rounded-full bg-app-muted" />
        </div>
      </div>
      {/* the window's bottom edge: it moves up when the window gets shorter */}
      <motion.div className="absolute inset-x-0 bottom-0 flex h-[30px] items-center border-t border-app-line bg-app-chrome px-3.5 text-[10px] text-app-text2" style={{ y: lift }}>
        <span>{s.letterTitle}</span>
      </motion.div>
    </div>
  );
}

function PhotosCard() {
  return (
    <div className="absolute inset-0 flex flex-col bg-app-surface">
      <div className="flex items-center border-b border-app-line px-3.5 py-3">
        <Lights size={8} />
      </div>
      <Landscape className="block w-full flex-1" />
    </div>
  );
}

function CalendarCard() {
  return (
    <div className="absolute inset-0 flex flex-col bg-app-surface">
      <div className="flex items-center border-b border-app-line px-3.5 py-3">
        <Lights size={8} />
      </div>
      <div className="grid flex-1 grid-cols-4 gap-[6px] p-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <i key={i} className={`rounded-[6px] ${i === 9 ? 'bg-app-primary/70' : 'bg-app-muted'}`} />
        ))}
      </div>
    </div>
  );
}

// A card behind the front one: smaller the deeper it sits.
function BackCard({ left, depth, children }: { left: number; depth: number; children: React.ReactNode }) {
  const scale = CARD.scale * (1 - 0.025 * depth);
  return (
    <div
      className="absolute overflow-hidden rounded-[26px] border border-app-line shadow-card"
      style={{ left, top: CARD.top + (VIEW.height * (CARD.scale - scale)) / 2, width: VIEW.width, height: VIEW.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {children}
    </div>
  );
}

export function FlowScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;

  // the window slips off the laptop's display as its card opens on the phone
  const letterOpacity = useTransform(progress, at(OPEN), [1, 0]);
  const letterScale = useTransform(progress, at(OPEN), [1, 0.88]);
  const letterX = useTransform(progress, at(OPEN), [0, 46]);

  const tapOpacity = useTransform(progress, at(TAP), [0, 0.8, 0]);
  const tapScale = useTransform(progress, at(TAP), [0.4, 0.7, 1.6]);

  // the front card grows into the whole screen
  const cardScale = useTransform(progress, at(OPEN), [CARD.scale, 1]);
  const cardX = useTransform(progress, at(OPEN), [CARD.left, 0]);
  const cardY = useTransform(progress, at(OPEN), [CARD.top, 0]);
  const page = useTransform(progress, at([OPEN[0] + 0.02, OPEN[0] + 0.12]), [1, 0]);

  // the window's controls show once it is open, then make way for the keyboard
  const capsule = useTransform(progress, at([OPEN[1], OPEN[1] + 0.04, KEYS[0], KEYS[0] + 0.04]), [0, 1, 1, 0]);
  const keyboardY = useTransform(progress, at(KEYS), [KEYBOARD + 8, 0]);
  const lift = useTransform(progress, at(KEYS), [0, -KEYBOARD]);
  const caret = useTransform(progress, at([KEYS[1], KEYS[1] + 0.02]), [0, 1]);
  const chars = Array.from(s.letterTyped);
  const typed = useTransform(progress, (v) => {
    const [from, to] = at(TYPE);
    const n = Math.round(Math.min(1, Math.max(0, (v - from) / (to - from))) * chars.length);
    return chars.slice(0, n).join('');
  });

  return (
    <Fit width={680} height={540}>
      {/* the laptop */}
      <div className="absolute overflow-hidden rounded-[12px] border border-app-line shadow-card" style={{ ...SCREEN, background: 'linear-gradient(135deg, var(--wall-a-1), var(--wall-a-2))' }}>
        <span className="absolute left-2.5 top-2.5 rounded-full border border-hair bg-surface px-2.5 py-1 text-[10.5px] font-medium text-ink">{s.screenA}</span>
        <div className="absolute overflow-hidden rounded-[9px] border border-app-line bg-app-surface shadow-card" style={{ left: 36, top: 54, width: 168, height: 122 }}>
          <div className="border-b border-app-line px-2 py-1.5">
            <Lights size={5} />
          </div>
          <Landscape className="block h-full w-full" />
        </div>
        <div className="absolute rounded-[9px] border border-app-line bg-app-surface p-2 shadow-card" style={{ left: 268, top: 34, width: 132, height: 96 }}>
          <Lights size={5} />
          <div className="mt-2 grid grid-cols-4 gap-[4px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} className={`h-[13px] rounded-[3px] ${i === 9 ? 'bg-app-primary/70' : 'bg-app-muted'}`} />
            ))}
          </div>
        </div>
        <motion.div className="absolute" style={{ ...LETTER, opacity: letterOpacity, scale: letterScale, x: letterX }}>
          <LetterOnLaptop s={s} />
        </motion.div>
      </div>
      <div className="absolute rounded-b-[10px] rounded-t-[3px] bg-app-muted" style={{ left: 0, top: SCREEN.top + SCREEN.height, width: SCREEN.width + 32, height: 12 }} />

      {/* the phone */}
      <Phone style={{ left: 466, top: 58, width: 196, height: 424 }}>
        <div className="absolute inset-0 overflow-hidden">
          {/* the Flow page */}
          <motion.div className="absolute inset-0" style={{ opacity: page }}>
            <div className="flex items-center justify-between px-3 pt-1">
              <span className="flex items-center gap-0.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-app-text" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
                  <path d="m15 5-7 7 7 7" />
                </svg>
                <span className="text-[20px] font-bold tracking-[-0.02em] text-app-text">{s.flowTitle}</span>
              </span>
              <span className="rounded-full bg-app-muted px-2 py-[3px] text-[9.5px] font-medium text-app-text2">{s.flowQuality}</span>
            </div>
            {/* the device shelf scrolls sideways; the next device peeks in at the edge */}
            <div className="mt-2.5 flex gap-1.5 overflow-hidden whitespace-nowrap px-3">
              <span className="flex shrink-0 items-center gap-1 rounded-[9px] border border-app-primary/60 bg-app-out px-2 py-[5px] text-[9.5px] font-semibold text-app-text">
                <Icon name="laptop" className="h-3 w-3" />
                {s.screenA}
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-[9px] border border-app-line px-2 py-[5px] text-[9.5px] font-medium text-app-text2">
                <Icon name="desktop" className="h-3 w-3" />
                {s.peers[1].name}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 px-3">
              <span className="text-[12.5px] font-semibold text-app-text">{s.flowWindows}</span>
              <span className="text-[11px] text-app-text2">3</span>
            </div>
            <BackCard left={6} depth={2}>
              <CalendarCard />
            </BackCard>
            <BackCard left={46} depth={1}>
              <PhotosCard />
            </BackCard>
            <span className="absolute flex items-center gap-1 text-[9.5px] font-medium text-app-text" style={{ left: CARD.left, top: CARD.top - 17 }}>
              <i className="h-3 w-3 rounded-[3.5px] bg-app-primary/80" />
              {s.flowCards[0]}
            </span>
            <div className="absolute flex items-baseline gap-1.5 px-3" style={{ top: CARD.top + VIEW.height * CARD.scale + 18 }}>
              <span className="text-[12.5px] font-semibold text-app-text">{s.flowApps}</span>
            </div>
            <div className="absolute flex gap-2.5 px-3" style={{ top: CARD.top + VIEW.height * CARD.scale + 40 }}>
              {['linear-gradient(160deg, #7cc4ff, #2a8fe0)', 'linear-gradient(160deg, #ffd27a, #f29a38)', 'linear-gradient(160deg, #9be38a, #3bb36a)', 'linear-gradient(160deg, #c9b6ff, #7670e4)'].map((bg) => (
                <i key={bg} className="h-[34px] w-[34px] rounded-[9px]" style={{ background: bg }} />
              ))}
            </div>
          </motion.div>

          {/* the front card, which opens into the window */}
          <motion.div
            className="absolute left-0 top-0 overflow-hidden rounded-[26px] border border-app-line shadow-float"
            style={{ width: VIEW.width, height: VIEW.height, x: cardX, y: cardY, scale: cardScale, transformOrigin: 'top left' }}
          >
            <LetterOnPhone s={s} typed={typed} caret={caret} lift={lift} />
            {/* the window's controls, floating in a capsule */}
            <motion.div className="absolute inset-x-0 bottom-3 flex justify-center" style={{ opacity: capsule }}>
              <span className="flex items-center gap-3.5 rounded-full border border-app-line bg-app-surface px-3.5 py-2 text-app-text2 shadow-float">
                <Icon name="keyboard" className="h-4 w-4" />
                <Icon name="pause" className="h-4 w-4" />
                <Icon name="close" className="h-4 w-4" />
              </span>
            </motion.div>
            {/* the keyboard */}
            <motion.div className="absolute inset-x-0 bottom-0 border-t border-app-line bg-app-chrome px-1.5 pb-2 pt-2" style={{ height: KEYBOARD, y: keyboardY }}>
              <div className="grid grid-cols-10 gap-[3px]">
                {Array.from({ length: 30 }).map((_, i) => (
                  <i key={i} className="h-[24px] rounded-[4px] bg-app-surface" />
                ))}
              </div>
              <div className="mt-[3px] grid grid-cols-[1fr_4fr_1fr] gap-[3px]">
                <i className="h-[24px] rounded-[4px] bg-app-muted" />
                <i className="h-[24px] rounded-[4px] bg-app-surface" />
                <i className="h-[24px] rounded-[4px] bg-app-primary/70" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Phone>
      {/* the tap on the front card */}
      <motion.span
        className="absolute rounded-full border-2"
        style={{ left: 466 + 5 + CARD.left + (VIEW.width * CARD.scale) / 2 - 14, top: 58 + 5 + 30 + CARD.top + (VIEW.height * CARD.scale) / 2 - 14, width: 28, height: 28, borderColor: 'var(--app-primary)', opacity: tapOpacity, scale: tapScale }}
      />
    </Fit>
  );
}
