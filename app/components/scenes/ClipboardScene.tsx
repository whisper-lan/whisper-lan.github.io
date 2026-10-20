'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { Fit, Phone } from './frames';

// An address is selected in a note on the laptop and copied; a moment later
// the phone pastes it into a map search, and the pin drops. At 1 the address
// is still selected on the laptop and the phone shows where it is.
// The scene's own progress is spread over 5 % – 92 % of its stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

const SCREEN = { left: 20, top: 128, width: 412, height: 258 };
const NOTE = { left: 66, top: 40, width: 280, height: 158 };
const PHONE = { left: 466, top: 58, width: 196, height: 424 };

// A few streets, a river and a park, in the app's own greys.
function MapArt() {
  const road = { stroke: 'var(--app-surface)', fill: 'none', strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 186 330" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect width="186" height="330" style={{ fill: 'var(--app-muted)' }} />
      <rect x="112" y="46" width="62" height="74" rx="10" style={{ fill: 'color-mix(in srgb, var(--app-trusted) 22%, var(--app-muted))' }} />
      <path d="M-10 250C40 236 70 262 112 244s60-30 90-22" style={{ fill: 'none', stroke: 'color-mix(in srgb, var(--app-primary) 26%, var(--app-muted))', strokeWidth: 16 }} />
      <path d="M-10 136H200M64-10v350M-10 40l220 116" style={{ ...road, strokeWidth: 8 }} />
      <path d="M-10 196H200M128 130v220M24-10v130M-10 300l90-40M150-10v40" style={{ ...road, strokeWidth: 4.5 }} />
    </svg>
  );
}

export function ClipboardScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;

  // the laptop: the address is selected, then copied
  const select = useTransform(progress, at([0.04, 0.2]), [0, 1]);
  const keysOpacity = useTransform(progress, at([0.2, 0.25, 0.4, 0.46]), [0, 1, 1, 0]);
  const keysScale = useTransform(progress, at([0.26, 0.28, 0.31]), [1, 0.9, 1]);

  // the clipboard crosses to the phone
  const dotT = at([0.32, 0.42, 0.52]);
  const dotX = useTransform(progress, dotT, [196, 380, 548]);
  const dotY = useTransform(progress, dotT, [262, 150, 116]);
  const dotOpacity = useTransform(progress, at([0.32, 0.34, 0.5, 0.53]), [0, 1, 1, 0]);

  // the phone: tap the search field, paste, and the place appears
  const focus = useTransform(progress, at([0.52, 0.56]), [0, 1]);
  const pillOpacity = useTransform(progress, at([0.55, 0.59, 0.65, 0.68]), [0, 1, 1, 0]);
  const pillScale = useTransform(progress, at([0.62, 0.64, 0.66]), [1, 0.92, 1]);
  const pasted = useTransform(progress, at([0.65, 0.68]), [0, 1]);
  const placeholder = useTransform(pasted, [0, 1], [1, 0]);
  const pinY = useTransform(progress, at([0.72, 0.8]), [-36, 0]);
  const pinOpacity = useTransform(progress, at([0.72, 0.75]), [0, 1]);
  const shadowScale = useTransform(progress, at([0.72, 0.8]), [0.3, 1]);
  const cardY = useTransform(progress, at([0.8, 0.9]), [36, 0]);
  const cardOpacity = useTransform(progress, at([0.8, 0.86]), [0, 1]);

  return (
    <Fit width={680} height={540}>
      {/* the laptop */}
      <div className="absolute overflow-hidden rounded-[12px] border border-app-line shadow-card" style={{ ...SCREEN, background: 'linear-gradient(135deg, var(--wall-a-1), var(--wall-a-2))' }}>
        <span className="absolute left-2.5 top-2.5 rounded-full border border-hair bg-surface px-2.5 py-1 text-[10.5px] font-medium text-ink">{s.screenA}</span>
        <div className="absolute flex flex-col rounded-[10px] border border-app-line bg-app-surface shadow-float" style={NOTE}>
          <div className="flex items-center gap-1 border-b border-app-line px-2.5 py-2">
            <i className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10.5px] font-semibold text-app-text2">{s.note}</span>
          </div>
          <div className="flex-1 px-4 pt-3">
            <span className="block text-[15px] font-semibold text-app-text">{s.clipDay}</span>
            <span className="mt-0.5 block text-[11.5px] text-app-text2">{s.clipTime}</span>
            <span className="mt-2.5 block whitespace-nowrap text-[13px] text-app-text">
              <span className="relative inline-block">
                <motion.span className="absolute -inset-x-[2px] -inset-y-[1px] origin-left rounded-[3px]" style={{ scaleX: select, background: 'color-mix(in srgb, var(--app-primary) 26%, transparent)' }} />
                <span className="relative font-medium">{s.clipAddress}</span>
              </span>
              {s.clipAddressRest}
            </span>
            <div className="mt-3.5 space-y-1.5">
              <i className="block h-[4px] w-4/5 rounded-full bg-app-muted" />
              <i className="block h-[4px] w-1/2 rounded-full bg-app-muted" />
            </div>
          </div>
        </div>
        <motion.span className="absolute flex gap-1.5" style={{ left: 172, top: 214, opacity: keysOpacity, scale: keysScale }}>
          <span className="keycap h-7 min-w-7 rounded-[7px] px-1.5 text-[12px]">⌘</span>
          <span className="keycap h-7 min-w-7 rounded-[7px] px-1.5 text-[12px]">C</span>
        </motion.span>
      </div>
      <div className="absolute rounded-b-[10px] rounded-t-[3px] bg-app-muted" style={{ left: 4, top: SCREEN.top + SCREEN.height, width: SCREEN.width + 40, height: 12 }} />

      {/* the copied text on its way */}
      <motion.span
        className="absolute left-0 top-0 h-[9px] w-[9px] rounded-full"
        style={{ x: dotX, y: dotY, opacity: dotOpacity, marginLeft: -4.5, marginTop: -4.5, background: 'linear-gradient(135deg, var(--ring-a), var(--ring-c))', boxShadow: '0 0 0 5px color-mix(in srgb, var(--ring-b) 18%, transparent)' }}
      />

      {/* the phone */}
      <Phone style={PHONE}>
        <div className="absolute inset-0 overflow-hidden">
          <MapArt />
          {/* the place */}
          <div className="absolute left-1/2 top-[44%]">
            <motion.span className="absolute -left-[9px] -top-[3px] h-[6px] w-[18px] rounded-[50%] bg-black/20" style={{ scale: shadowScale, opacity: pinOpacity }} />
            <motion.svg viewBox="0 0 24 32" className="absolute -left-[13px] -top-[34px] h-[34px] w-[26px] drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)]" style={{ y: pinY, opacity: pinOpacity }} aria-hidden="true">
              <path d="M12 1.5C6.2 1.5 1.5 6 1.5 11.6 1.5 19 12 30.5 12 30.5S22.5 19 22.5 11.6C22.5 6 17.8 1.5 12 1.5Z" style={{ fill: 'var(--app-primary)' }} />
              <circle cx="12" cy="11.5" r="4" fill="#fff" />
            </motion.svg>
          </div>

          {/* the search field, with Android's paste bubble below it */}
          <div className="absolute inset-x-2.5 top-1">
            <div className="relative flex h-[36px] items-center gap-2 rounded-full border border-app-line bg-app-surface px-3 shadow-card">
              <motion.span className="absolute -inset-px rounded-full border-[1.5px] border-app-primary" style={{ opacity: focus }} />
              <Icon name="search" className="h-3.5 w-3.5 shrink-0 text-app-text2" />
              <span className="relative min-w-0 flex-1 text-[11.5px]">
                <motion.span className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-app-text2" style={{ opacity: placeholder }}>
                  {s.mapSearch}
                </motion.span>
                <motion.span className="block truncate font-medium text-app-text" style={{ opacity: pasted }}>
                  {s.clipAddress}
                </motion.span>
              </span>
            </div>
            <motion.span className="absolute left-3 top-[42px] rounded-[9px] bg-app-text px-3 py-1.5 text-[10.5px] font-medium text-app-surface shadow-float" style={{ opacity: pillOpacity, scale: pillScale }}>
              {t.details.paste}
            </motion.span>
          </div>

          {/* the place card */}
          <motion.div className="absolute inset-x-2 bottom-2 rounded-[16px] border border-app-line bg-app-surface p-3 shadow-float" style={{ y: cardY, opacity: cardOpacity }}>
            <span className="block truncate text-[13px] font-semibold text-app-text">{s.clipAddress}</span>
            <span className="mt-0.5 block text-[10px] text-app-text2">{s.mapWalk}</span>
            <span className="mt-2.5 flex h-[28px] items-center justify-center rounded-full bg-app-primary text-[11px] font-semibold text-white">{s.mapRoute}</span>
          </motion.div>
        </div>
      </Phone>
    </Fit>
  );
}
