'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Fit, Phone } from './frames';

// The phone runs through its three modes while the laptop follows: a turn of
// the wrist sweeps the pointer across the desktop, the touchpad brings it to
// a note and clicks, and the keyboard types into it. At 1 the phone is on its
// keyboard and the line is written.
// The scene's own progress is spread over 5 % – 92 % of its stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

const SCREEN = { left: 20, top: 128, width: 412, height: 258 };
const NOTE = { left: 150, top: 66, width: 214, height: 128 };
const POINTER_T = [0, 0.14, 0.3, 0.42, 0.56, 1];
const POINTER_X = [106, 196, 336, 304, 238, 238];
const POINTER_Y = [314, 206, 262, 300, 256, 256];
const MODE_SWITCH = [0.36, 0.62]; // motion → touchpad → keyboard
const TYPE = [0.7, 0.94];

function Segment({ modes, progress }: { modes: string[]; progress: MotionValue<number> }) {
  const [a, b] = MODE_SWITCH;
  const x = useTransform(progress, at([a, a + 0.06, b, b + 0.06]), ['0%', '100%', '100%', '200%']);
  return (
    <div className="relative mt-2.5 grid grid-cols-3 rounded-[10px] bg-app-muted p-[2px] text-center text-[10px]">
      <motion.span className="absolute bottom-[2px] left-[2px] top-[2px] rounded-[8px] bg-app-surface shadow-sm" style={{ width: 'calc((100% - 4px) / 3)', x }} />
      {modes.map((mode) => (
        <span key={mode} className="relative py-[4px] font-medium text-app-text">
          {mode}
        </span>
      ))}
    </div>
  );
}

export function PhoneScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const [a, b] = MODE_SWITCH;

  const pointerX = useTransform(progress, at(POINTER_T), POINTER_X);
  const pointerY = useTransform(progress, at(POINTER_T), POINTER_Y);
  const click = at([0.54, 0.56, 0.62]);
  const clickOpacity = useTransform(progress, click, [0, 0.8, 0]);
  const clickScale = useTransform(progress, click, [0.4, 0.7, 1.6]);
  const noteFocus = useTransform(progress, at([0.55, 0.58]), [0, 1]);

  // motion: the phone turns in the hand
  const tilt = useTransform(progress, at([0, 0.1, 0.22, 0.32, 0.38]), [0, -6, 5, -2, 0]);
  const dotX = useTransform(progress, at([0, 0.1, 0.22, 0.32, 0.38]), [0, -16, 13, -5, 0]);
  const motionPanel = useTransform(progress, at([a, a + 0.05]), [1, 0]);
  // touchpad: one finger draws the pointer to the note
  const padPanel = useTransform(progress, at([a + 0.02, a + 0.07, b, b + 0.05]), [0, 1, 1, 0]);
  const fingerOpacity = useTransform(progress, at([0.42, 0.44, 0.58, 0.6]), [0, 1, 1, 0]);
  const fingerX = useTransform(progress, at([0.42, 0.56]), [104, 52]);
  const fingerY = useTransform(progress, at([0.42, 0.56]), [96, 64]);
  // keyboard: the line is typed on the phone and appears in the note
  const keysPanel = useTransform(progress, at([b + 0.02, b + 0.07]), [0, 1]);
  const chars = Array.from(s.typed);
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
        <div className="absolute rounded-[8px] border border-app-line bg-app-surface/70 p-2 shadow-card" style={{ left: 40, top: 112, width: 120, height: 84 }}>
          <div className="mb-2 flex gap-1">
            <i className="h-[5px] w-[5px] rounded-full bg-[#ff5f57]" />
            <i className="h-[5px] w-[5px] rounded-full bg-[#febc2e]" />
            <i className="h-[5px] w-[5px] rounded-full bg-[#28c840]" />
          </div>
          <div className="space-y-1.5">
            <i className="block h-[4px] w-4/5 rounded-full bg-app-muted" />
            <i className="block h-[4px] w-3/5 rounded-full bg-app-muted" />
          </div>
        </div>
        <div className="absolute flex flex-col rounded-[10px] border border-app-line bg-app-surface shadow-float" style={NOTE}>
          <div className="flex items-center gap-1 border-b border-app-line px-2.5 py-2">
            <i className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10.5px] font-semibold text-app-text2">{s.note}</span>
          </div>
          <div className="relative flex-1 px-3 pt-3">
            <motion.span className="absolute inset-x-2 top-2 h-[26px] rounded-[6px] border border-app-primary/50" style={{ opacity: noteFocus }} />
            <span className="relative flex h-[18px] items-center text-[13px] font-medium text-app-text">
              <motion.span>{typed}</motion.span>
              {/* the blink is a CSS animation, which would override an inline opacity on the same element */}
              <motion.span className="ml-[1px] inline-flex" style={{ opacity: noteFocus }}>
                <i className="inline-block h-[14px] w-[1.5px] bg-app-primary motion-safe:animate-pulse" />
              </motion.span>
            </span>
            <div className="mt-3 space-y-1.5">
              <i className="block h-[4px] w-4/5 rounded-full bg-app-muted" />
              <i className="block h-[4px] w-2/3 rounded-full bg-app-muted" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute rounded-b-[10px] rounded-t-[3px] bg-app-muted" style={{ left: 4, top: SCREEN.top + SCREEN.height, width: SCREEN.width + 40, height: 12 }} />

      {/* the phone */}
      <motion.div className="absolute" style={{ left: 466, top: 58, width: 196, height: 424, rotate: tilt }}>
        <Phone style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
          <div className="flex h-full flex-col px-3 pb-2.5">
            <div className="pt-1 text-center leading-tight">
              <span className="block text-[12px] font-semibold text-app-text">{s.phoneTitle}</span>
              <span className="text-[9.5px] text-app-text2">{s.screenA}</span>
            </div>
            <Segment modes={s.phoneModes} progress={progress} />

            <div className="relative mt-2.5 flex-1">
              {/* motion */}
              <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: motionPanel }}>
                <span className="relative grid h-[104px] w-[104px] place-items-center rounded-full border border-app-line bg-app-in">
                  <span className="absolute h-[64px] w-[64px] rounded-full border border-app-line" />
                  <motion.span className="h-3.5 w-3.5 rounded-full bg-app-primary shadow-[0_0_0_6px_color-mix(in_srgb,var(--app-primary)_18%,transparent)]" style={{ x: dotX }} />
                </span>
                <span className="mt-3 text-center text-[9.5px] leading-snug text-app-text2">{s.motionHint}</span>
              </motion.div>
              {/* touchpad */}
              <motion.div className="absolute inset-0 overflow-hidden rounded-[14px] border-2 border-app-primary bg-app-in" style={{ opacity: padPanel }}>
                <motion.span
                  className="absolute h-8 w-8 rounded-full"
                  style={{
                    marginLeft: -16,
                    marginTop: -16,
                    x: fingerX,
                    y: fingerY,
                    opacity: fingerOpacity,
                    background: 'radial-gradient(circle, color-mix(in srgb, var(--app-primary) 55%, transparent), transparent 70%)',
                  }}
                />
              </motion.div>
              {/* keyboard */}
              <motion.div className="absolute inset-0 flex flex-col justify-end" style={{ opacity: keysPanel }}>
                <div className="flex h-[34px] items-center rounded-[10px] border border-app-primary/60 bg-app-surface px-2.5 text-[11.5px] text-app-text">
                  <motion.span>{typed}</motion.span>
                  <i className="ml-[1px] inline-block h-[12px] w-[1.5px] bg-app-primary motion-safe:animate-pulse" />
                </div>
                {/* modifiers: tap one, then a key, for a shortcut */}
                <div className="my-2.5 grid grid-cols-5 gap-[3px] text-center text-[8.5px] font-medium text-app-text2">
                  {['Esc', 'Tab', 'Ctrl', 'Alt', '⌘'].map((key) => (
                    <span key={key} className="rounded-[5px] border border-app-line py-[3px]">
                      {key}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-10 gap-[3px]">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <i key={i} className="h-[22px] rounded-[4px] bg-app-muted" />
                  ))}
                </div>
                <div className="mt-[3px] grid grid-cols-[1fr_4fr_1fr] gap-[3px]">
                  <i className="h-[22px] rounded-[4px] bg-app-muted" />
                  <i className="h-[22px] rounded-[4px] bg-app-muted" />
                  <i className="h-[22px] rounded-[4px] bg-app-primary/70" />
                </div>
              </motion.div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <i className="h-[26px] rounded-[9px] bg-app-muted" />
              <i className="h-[26px] rounded-[9px] bg-app-muted" />
            </div>
          </div>
        </Phone>
      </motion.div>

      {/* the pointer on the laptop */}
      <motion.div className="absolute left-0 top-0" style={{ x: pointerX, y: pointerY }}>
        <svg width="18" height="22" viewBox="0 0 18 22" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" aria-hidden="true">
          <path d="M1.5 1.5v16.2l4.3-4.1 2.8 6.4 2.7-1.2-2.8-6.3 6-.2Z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <motion.span className="absolute rounded-full border-2" style={{ left: 224, top: 242, width: 28, height: 28, borderColor: 'var(--app-primary)', opacity: clickOpacity, scale: clickScale }} />
    </Fit>
  );
}
