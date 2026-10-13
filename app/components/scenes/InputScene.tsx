'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { Fit, Phone } from './frames';

// Scrolling drives the pointer: the desk mouse carries it across the shared
// edge, then the phone's touchpad takes over on the second computer.
const TIMES = [0, 0.2, 0.36, 0.44, 0.52, 0.66, 0.8, 1];
const CURSOR_X = [150, 250, 336, 392, 440, 500, 560, 486];
const CURSOR_Y = [128, 116, 112, 116, 122, 156, 108, 140];
// The scene's own progress is spread over 5 % – 92 % of its scroll stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

function Screen({ x, label, wall, children }: { x: number; label: string; wall: string; children?: React.ReactNode }) {
  return (
    <>
      <div className="absolute overflow-hidden rounded-[12px] border border-app-line shadow-card" style={{ left: x, top: 34, width: 300, height: 186, background: wall }}>
        <span className="absolute left-2.5 top-2.5 rounded-full border border-hair bg-surface px-2.5 py-1 text-[10.5px] font-medium text-ink">{label}</span>
        {children}
      </div>
      <div className="absolute rounded-b-[3px] bg-app-muted" style={{ left: x + 141, top: 220, width: 18, height: 20 }} />
      <div className="absolute rounded-full bg-app-muted" style={{ left: x + 100, top: 238, width: 100, height: 7 }} />
    </>
  );
}

function FauxWindow({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  return (
    <div className="absolute rounded-[8px] border border-app-line bg-app-surface p-2 shadow-card" style={{ left, top, width, height }}>
      <div className="mb-2 flex gap-1">
        <i className="h-[5px] w-[5px] rounded-full bg-[#ff5f57]" />
        <i className="h-[5px] w-[5px] rounded-full bg-[#febc2e]" />
        <i className="h-[5px] w-[5px] rounded-full bg-[#28c840]" />
      </div>
      <div className="space-y-1.5">
        <i className="block h-[4px] w-4/5 rounded-full bg-app-muted" />
        <i className="block h-[4px] w-3/5 rounded-full bg-app-muted" />
        <i className="block h-[4px] w-2/3 rounded-full bg-app-muted" />
      </div>
    </div>
  );
}

export function InputScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const times = at(TIMES);
  const cursorX = useTransform(progress, times, CURSOR_X);
  const cursorY = useTransform(progress, times, CURSOR_Y);
  const mouseX = useTransform(progress, times, [0, 8, 14, 18, 18, 18, 18, 18]);
  const edge = useTransform(progress, at([0, 0.3, 0.36, 0.44]), [0, 0, 0.9, 0]);
  const click = at([0.44, 0.46, 0.54]);
  const clickOpacity = useTransform(progress, click, [0, 0.8, 0]);
  const clickScale = useTransform(progress, click, [0.4, 0.7, 1.6]);
  const touchOpacity = useTransform(progress, at([0.46, 0.52, 1]), [0, 1, 1]);
  const touchLeft = useTransform(progress, times, [74, 74, 74, 74, 46, 76, 106, 66]);
  const touchTop = useTransform(progress, times, [56, 56, 56, 56, 50, 70, 40, 60]);
  const phoneActive = useTransform(progress, at([0.44, 0.52]), [0, 1]);

  return (
    <Fit width={680} height={540}>
      <Screen x={20} label={`${s.screenA} · ${s.host}`} wall="linear-gradient(135deg, var(--wall-a-1), var(--wall-a-2))">
        <FauxWindow left={110} top={62} width={150} height={92} />
      </Screen>
      <Screen x={360} label={s.screenB} wall="linear-gradient(135deg, var(--wall-b-1), var(--wall-b-2))">
        <FauxWindow left={44} top={58} width={170} height={100} />
      </Screen>

      {/* the shared edge lights up as the pointer crosses */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: 336, top: 46, width: 8, height: 162, background: 'linear-gradient(180deg, var(--ring-a), var(--ring-c))', filter: 'blur(3px)', opacity: edge }}
      />

      {/* keyboard and mouse at the desk */}
      <div className="absolute rounded-[12px] border border-app-line bg-app-surface p-2 shadow-card" style={{ left: 64, top: 280, width: 224, height: 72 }}>
        <div className="grid h-full grid-cols-12 grid-rows-4 gap-[3px]">
          {Array.from({ length: 44 }).map((_, i) => (
            <i key={i} className={`rounded-[3px] bg-app-muted ${i === 38 ? 'col-span-5' : ''}`} />
          ))}
        </div>
      </div>
      <motion.div className="absolute rounded-[20px] border border-app-line bg-app-surface shadow-card" style={{ left: 304, top: 284, width: 38, height: 60, x: mouseX }}>
        <i className="absolute left-1/2 top-2 h-3 w-[2px] -translate-x-1/2 rounded-full bg-app-muted" />
      </motion.div>

      <div className="absolute flex items-center gap-2 rounded-full border border-hair bg-surface px-3 py-1.5 text-[11px] text-ink-2" style={{ left: 64, top: 376 }}>
        <Icon name="keyboard" className="h-3.5 w-3.5" />
        {s.exitHint}
      </div>

      {/* the phone as touchpad */}
      <Phone style={{ left: 496, top: 262, width: 168, height: 272 }}>
        <div className="flex h-full flex-col px-2.5 pb-2">
          <div className="pt-1 text-center leading-tight">
            <span className="block text-[11.5px] font-semibold text-app-text">{s.phoneTitle}</span>
            <span className="text-[9px] text-app-text2">{s.screenB}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 rounded-[9px] bg-app-muted p-[2px] text-center text-[9px]">
            {s.phoneModes.map((mode, i) => (
              <span key={mode} className={`rounded-[7px] py-[3px] ${i === 1 ? 'bg-app-surface font-semibold text-app-text shadow-sm' : 'text-app-text2'}`}>
                {mode}
              </span>
            ))}
          </div>
          <div className="relative mt-2 flex-1 overflow-hidden rounded-[14px] border border-app-line bg-app-in">
            <motion.span className="absolute inset-0 rounded-[14px] border-2 border-app-primary" style={{ opacity: phoneActive }} />
            <motion.span
              className="absolute h-7 w-7 rounded-full"
              style={{
                marginLeft: -14,
                marginTop: -14,
                left: touchLeft,
                top: touchTop,
                opacity: touchOpacity,
                background: 'radial-gradient(circle, color-mix(in srgb, var(--app-primary) 55%, transparent), transparent 70%)',
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <i className="h-[22px] rounded-[8px] bg-app-muted" />
            <i className="h-[22px] rounded-[8px] bg-app-muted" />
          </div>
        </div>
      </Phone>

      {/* the pointer */}
      <motion.div className="absolute left-0 top-0" style={{ x: cursorX, y: cursorY }}>
        <svg width="18" height="22" viewBox="0 0 18 22" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" aria-hidden="true">
          <path d="M1.5 1.5v16.2l4.3-4.1 2.8 6.4 2.7-1.2-2.8-6.3 6-.2Z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <motion.span className="absolute rounded-full border-2" style={{ left: 380, top: 104, width: 28, height: 28, borderColor: 'var(--app-primary)', opacity: clickOpacity, scale: clickScale }} />
    </Fit>
  );
}
