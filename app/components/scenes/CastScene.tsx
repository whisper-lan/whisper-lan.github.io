'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { FilmStill, Fit, MacWindow, Phone } from './frames';

// Scrolling plays the cast: the computer is picked on the phone, the link
// draws across, the player window opens and the film runs on.
export function CastScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const pick = useTransform(progress, [0.1, 0.2], [0, 1]);
  const link = useTransform(progress, [0.2, 0.42], [0, 1]);
  const linkFlow = useTransform(progress, [0.38, 0.46], [0, 1]);
  const windowOpacity = useTransform(progress, [0.36, 0.5], [0, 1]);
  const windowScale = useTransform(progress, [0.36, 0.56], [0.94, 1]);
  const windowY = useTransform(progress, [0.36, 0.56], [18, 0]);
  const played = useTransform(progress, [0.5, 1], ['29%', '41%']);
  const clock = useTransform(progress, (v) => {
    const seconds = Math.round(12 * 60 + 4 + Math.max(0, v - 0.5) * 2 * 300);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  return (
    <Fit width={680} height={540}>
      <motion.div className="absolute inset-0" style={{ opacity: windowOpacity, scale: windowScale, y: windowY }}>
        <MacWindow title={s.castWindow} style={{ left: 176, top: 30, width: 494, height: 330 }}>
          <div className="absolute inset-0 bg-black">
            <FilmStill className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-x-3 bottom-3 rounded-[14px] px-3.5 py-2.5 text-white" style={{ background: 'rgba(20, 20, 24, 0.62)' }}>
              <div className="flex items-center gap-3">
                <Icon name="pause" className="h-4 w-4" strokeWidth={2.4} />
                <motion.span className="mono text-[10.5px] tabular-nums opacity-90">{clock}</motion.span>
                <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-white/25">
                  <motion.span className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: played }} />
                </span>
                <span className="mono text-[10.5px] tabular-nums opacity-70">42:10</span>
                <Icon name="speaker" className="h-4 w-4 opacity-90" />
                <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-90" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              </div>
            </div>
          </div>
        </MacWindow>
      </motion.div>

      {/* phone → computer */}
      <svg viewBox="0 0 680 540" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <motion.path d="M 150 220 C 150 120, 190 90, 250 92" fill="none" stroke="var(--hair-2)" strokeWidth="1.5" style={{ pathLength: link }} />
        <motion.path d="M 150 220 C 150 120, 190 90, 250 92" fill="none" stroke="var(--ring-b)" strokeWidth="2" strokeLinecap="round" className="flow-dash" style={{ opacity: linkFlow }} />
      </svg>
      <motion.span
        className="mono absolute rounded-full border border-hair bg-surface px-2.5 py-1 text-[10px] font-medium tracking-wider text-ink-2"
        style={{ left: 104, top: 118, opacity: link }}
      >
        DLNA
      </motion.span>

      <Phone style={{ left: 20, top: 196, width: 176, height: 336 }}>
        <div className="flex h-full flex-col">
          <div className="relative mx-2.5 mt-1 overflow-hidden rounded-[12px]">
            <FilmStill className="block h-[92px] w-full" />
            <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/40 text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M3 8V5h18v14h-8M3 12a7 7 0 0 1 7 7M3 16a3 3 0 0 1 3 3" />
              </svg>
            </span>
          </div>
          <div className="mt-auto rounded-t-[18px] border-t border-app-line bg-app-surface px-3 pb-2 pt-3 shadow-[0_-10px_30px_-18px_rgba(0,0,0,0.35)]">
            <div className="mx-auto mb-2.5 h-[4px] w-8 rounded-full bg-app-muted" />
            <span className="text-[11px] font-semibold text-app-text">{s.castTo}</span>
            <div className="mt-2 space-y-1">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-[10px] px-2 py-2">
                <motion.span className="absolute inset-0 bg-app-out" style={{ opacity: pick }} />
                <Icon name="laptop" className="relative h-4 w-4 text-app-primary" />
                <span className="relative flex-1 truncate text-[10.5px] font-medium text-app-text">{s.castTarget}</span>
                <motion.span className="relative" style={{ opacity: pick, scale: pick }}>
                  <Icon name="check" className="h-3.5 w-3.5 text-app-primary" strokeWidth={2.6} />
                </motion.span>
              </div>
              <div className="flex items-center gap-2 px-2 py-2">
                <Icon name="desktop" className="h-4 w-4 text-app-text2" />
                <span className="flex-1 truncate text-[10.5px] text-app-text2">{s.castOther}</span>
              </div>
            </div>
          </div>
        </div>
      </Phone>
    </Fit>
  );
}
