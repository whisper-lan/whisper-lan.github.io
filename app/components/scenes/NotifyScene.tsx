'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Fit, Phone } from './frames';

// A sign-in on the laptop asks for a code; the text message lands on the
// phone, and Whisper shows it on the laptop as a notification, with the code
// already on the clipboard. Pasting fills the boxes. At 1 the notification is
// still up and the code is in.
// The scene's own progress is spread over 5 % – 92 % of its stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

const SCREEN = { left: 20, top: 128, width: 412, height: 258 };
const LOGIN = { left: 34, top: 44, width: 270, height: 170 };
const PHONE = { left: 466, top: 58, width: 196, height: 424 };

// The system Messages app's icon, as on the home page's notification card.
function MessagesIcon({ size }: { size: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[28%] text-white" style={{ width: size, height: size, background: 'linear-gradient(160deg, #4ade80, #16a34a)' }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.56, height: size * 0.56 }} fill="currentColor" aria-hidden="true">
        <path d="M12 4c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4L6 20l3.6-2.1c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.1 8.5-7S16.7 4 12 4Z" />
      </svg>
    </span>
  );
}

function Digit({ value, progress, from }: { value: string; progress: MotionValue<number>; from: number }) {
  const opacity = useTransform(progress, at([from, from + 0.03]), [0, 1]);
  const y = useTransform(progress, at([from, from + 0.04]), [5, 0]);
  return (
    <span className="grid h-[30px] w-[25px] place-items-center rounded-[7px] border border-app-line bg-app-in text-[14px] font-semibold text-app-text">
      <motion.span style={{ opacity, y }}>{value}</motion.span>
    </span>
  );
}

export function NotifyScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const d = t.details;
  const code = Array.from((d.notifyText.match(/\d{3}\s?\d{3}/)?.[0] ?? '').replace(/\s/g, ''));

  // the message lands on the phone
  const smsY = useTransform(progress, at([0.1, 0.18]), [-70, 0]);
  const smsOpacity = useTransform(progress, at([0.1, 0.15]), [0, 1]);

  // and crosses to the laptop
  const dotT = at([0.24, 0.33, 0.42]);
  const dotX = useTransform(progress, dotT, [560, 450, 330]);
  const dotY = useTransform(progress, dotT, [126, 92, 160]);
  const dotOpacity = useTransform(progress, at([0.24, 0.26, 0.4, 0.43]), [0, 1, 1, 0]);

  // where Whisper shows it as a notification, code on the clipboard
  const bannerX = useTransform(progress, at([0.42, 0.5]), [40, 0]);
  const bannerOpacity = useTransform(progress, at([0.42, 0.47]), [0, 1]);

  // paste, and the code is in
  const keysOpacity = useTransform(progress, at([0.54, 0.58, 0.74, 0.8]), [0, 1, 1, 0]);
  const keysScale = useTransform(progress, at([0.6, 0.62, 0.65]), [1, 0.9, 1]);
  const ready = useTransform(progress, at([0.74, 0.8]), [0, 1]);

  return (
    <Fit width={680} height={540}>
      {/* the laptop */}
      <div className="absolute overflow-hidden rounded-[12px] border border-app-line shadow-card" style={{ ...SCREEN, background: 'linear-gradient(135deg, var(--wall-a-1), var(--wall-a-2))' }}>
        <div className="absolute flex flex-col rounded-[10px] border border-app-line bg-app-surface shadow-float" style={LOGIN}>
          <div className="flex items-center gap-1 border-b border-app-line px-2.5 py-2">
            <i className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" />
            <i className="h-[6px] w-[6px] rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10.5px] font-semibold text-app-text2">{s.signIn}</span>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 px-3.5 pt-3">
            <span className="flex h-[30px] items-center rounded-[8px] border border-app-line px-2.5 text-[12px] text-app-text">{s.signInPhone}</span>
            <span className="flex items-center justify-between">
              <span className="flex gap-[5px]">
                {code.map((digit, i) => (
                  <Digit key={i} value={digit} progress={progress} from={0.62 + i * 0.012} />
                ))}
              </span>
              <span className="whitespace-nowrap text-[9.5px] text-app-text2">{s.signInResend}</span>
            </span>
            <span className="relative flex h-[30px] items-center justify-center overflow-hidden rounded-[8px] bg-app-muted text-[12px] font-semibold text-app-text2">
              {s.signIn}
              <motion.span className="absolute inset-0 flex items-center justify-center bg-app-primary text-white" style={{ opacity: ready }}>
                {s.signIn}
              </motion.span>
            </span>
          </div>
        </div>

        {/* the notification Whisper raises */}
        <motion.div className="glass absolute right-2 top-2 flex w-[206px] gap-2.5 rounded-[14px] border border-hair p-2.5 shadow-float" style={{ x: bannerX, opacity: bannerOpacity }}>
          <span className="h-[26px] w-[26px] shrink-0 rounded-[7px] bg-app-surface p-[5px] shadow-card">
            <span className="block h-full w-full rounded-full" style={{ background: 'conic-gradient(from 200deg, var(--ring-a), var(--ring-b), var(--ring-c), var(--ring-a))', mask: 'radial-gradient(circle, transparent 52%, #000 54%)', WebkitMask: 'radial-gradient(circle, transparent 52%, #000 54%)' }} />
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11px] font-semibold text-ink">【{d.notifyApp}】{s.smsSender}</span>
              <span className="shrink-0 text-[9.5px] text-faint">{d.notifyNow}</span>
            </span>
            <span className="mt-0.5 block text-[10.5px] text-ink-2">{d.notifyText}</span>
          </span>
        </motion.div>

        <motion.span className="absolute flex gap-1.5" style={{ left: 128, top: 222, opacity: keysOpacity, scale: keysScale }}>
          <span className="keycap h-7 min-w-7 rounded-[7px] px-1.5 text-[12px]">⌘</span>
          <span className="keycap h-7 min-w-7 rounded-[7px] px-1.5 text-[12px]">V</span>
        </motion.span>
      </div>
      <div className="absolute rounded-b-[10px] rounded-t-[3px] bg-app-muted" style={{ left: 4, top: SCREEN.top + SCREEN.height, width: SCREEN.width + 40, height: 12 }} />

      {/* the message on its way */}
      <motion.span
        className="absolute left-0 top-0 h-[9px] w-[9px] rounded-full"
        style={{ x: dotX, y: dotY, opacity: dotOpacity, marginLeft: -4.5, marginTop: -4.5, background: 'linear-gradient(135deg, var(--ring-c), var(--ring-a))', boxShadow: '0 0 0 5px color-mix(in srgb, var(--ring-b) 18%, transparent)' }}
      />

      {/* the phone, its home screen and the message */}
      <Phone style={PHONE}>
        <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--wall-b-1), var(--wall-b-2))' }}>
          <div className="absolute inset-x-4 top-[104px] grid grid-cols-4 gap-x-3 gap-y-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <i key={i} className="aspect-square rounded-[30%] bg-app-surface/60" />
            ))}
          </div>
          <div className="absolute inset-x-5 bottom-3 grid grid-cols-4 gap-3 rounded-[18px] bg-app-surface/40 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <i key={i} className="aspect-square rounded-[30%] bg-app-surface/75" />
            ))}
          </div>
          <motion.div className="absolute inset-x-2 top-1 rounded-[16px] border border-app-line bg-app-surface p-2.5 shadow-float" style={{ y: smsY, opacity: smsOpacity }}>
            <span className="flex items-center gap-1.5 text-[9.5px] text-app-text2">
              <MessagesIcon size={16} />
              {d.notifyApp} · {d.notifyNow}
            </span>
            <span className="mt-1.5 block text-[11px] font-semibold text-app-text">{s.smsSender}</span>
            <span className="mt-0.5 block text-[10.5px] leading-snug text-app-text">{d.notifyText}</span>
          </motion.div>
        </div>
      </Phone>
    </Fit>
  );
}
