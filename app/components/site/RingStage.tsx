'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, animate, cubicBezier, motion, useInView, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, PlatformMark, useReducedMotion } from './primitives';

// The hero's signature: the app icon's ring stands for your local network.
// Devices sit on it, and everything they exchange travels along the ring —
// never off it.
//
// Layers are split so the browser can composite them: the blurred glow, the
// ripples and the orbit are drawn once and only moved or faded, and the
// light pulse redraws a small, filter-free SVG.

const R = 420; // ring radius in the -500..500 viewBox
const POS = 42; // the same radius as a percentage of the stage
const VIEW = '-500 -500 1000 1000';

type DeviceKey = 'mac' | 'android' | 'windows' | 'linux';

// Each device is shown by its platform's mark alone; the name is for screen readers.
const DEVICES: { key: DeviceKey; angle: number }[] = [
  { key: 'mac', angle: 215 },
  { key: 'android', angle: 325 },
  { key: 'windows', angle: 35 },
  { key: 'linux', angle: 145 },
];

// dir: +1 travels clockwise (increasing angle on screen), -1 the other way.
const EVENTS: { from: DeviceKey; to: DeviceKey; dir: 1 | -1; icon: string }[] = [
  { from: 'android', to: 'mac', dir: -1, icon: 'photo' },
  { from: 'mac', to: 'windows', dir: 1, icon: 'clipboard' },
  { from: 'windows', to: 'linux', dir: 1, icon: 'speaker' },
  { from: 'mac', to: 'linux', dir: -1, icon: 'keyboard' },
  { from: 'linux', to: 'android', dir: 1, icon: 'folder' },
];

const TRAVEL = 1.75; // seconds a pulse spends on the ring
const LAG = 0.35; // the tail's tip is where the head was this many seconds ago
const travelEase = cubicBezier(0.5, 0, 0.2, 1);
const CYCLE = 3600; // ms between pulses

const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (deg: number, r = R) => [r * Math.cos(rad(deg)), r * Math.sin(rad(deg))] as const;

const angleOf = (key: DeviceKey) => DEVICES.find((d) => d.key === key)!.angle;

function endAngle(from: number, to: number, dir: 1 | -1) {
  if (dir === 1) return to < from ? to + 360 : to;
  return to > from ? to - 360 : to;
}

function RingGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="-380" y1="-420" x2="380" y2="420">
      <stop offset="0" stopColor="var(--ring-a)" />
      <stop offset="0.5" stopColor="var(--ring-b)" />
      <stop offset="1" stopColor="var(--ring-c)" />
    </linearGradient>
  );
}

// A band along the ring from angle `tip` to angle `head`, widening from nothing
// at the tip to `width` either side of the ring at the head: one filled shape,
// so it tapers smoothly instead of in stacked steps.
function taper(tip: number, head: number, width: number) {
  if (Math.abs(head - tip) < 0.3) return '';
  const n = 28;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = tip + (head - tip) * u;
    const w = width * Math.pow(u, 0.7);
    const [ox, oy] = point(a, R + w);
    const [ix, iy] = point(a, R - w);
    outer.push(`${ox.toFixed(1)} ${oy.toFixed(1)}`);
    inner.unshift(`${ix.toFixed(1)} ${iy.toFixed(1)}`);
  }
  return `M ${outer.join(' L ')} L ${inner.join(' L ')} Z`;
}

// A light pulse with a tapered tail, travelling from one device to the next.
// The tail's tip trails the head by LAG seconds, so the tail is long at speed,
// shortens as the pulse slows, and draws into the head when it arrives.
// It fades along its length through a gradient that follows it, and the glow
// is gradients too: no blur filter.
function Comet({ from, to }: { from: number; to: number }) {
  const uid = useId().replace(/:/g, '');
  const time = useMotionValue(0);
  useEffect(() => {
    const controls = animate(time, TRAVEL + LAG, { duration: TRAVEL + LAG, ease: 'linear' });
    return () => controls.stop();
  }, [time]);

  const at = (s: number) => from + (to - from) * travelEase(Math.min(Math.max(s / TRAVEL, 0), 1));
  const body = useTransform(time, (s) => taper(at(s - LAG), at(s), 2.4));
  const glow = useTransform(time, (s) => taper(at(s - LAG), at(s), 10));
  const halo = useTransform(time, (s) => taper(at(s - LAG), at(s), 5.5));
  const cx = useTransform(time, (s) => point(at(s))[0]);
  const cy = useTransform(time, (s) => point(at(s))[1]);
  const tx = useTransform(time, (s) => point(at(s - LAG))[0]);
  const ty = useTransform(time, (s) => point(at(s - LAG))[1]);

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}>
      <defs>
        {/* runs from the tail's tip to the head; along a short arc that is close enough to following it */}
        <motion.linearGradient id={`ct-${uid}`} gradientUnits="userSpaceOnUse" x1={tx} y1={ty} x2={cx} y2={cy}>
          <stop offset="0" stopColor="var(--comet)" stopOpacity="0" />
          <stop offset="0.4" stopColor="var(--comet)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--comet)" stopOpacity="1" />
        </motion.linearGradient>
        <radialGradient id={`ch-${uid}`}>
          <stop offset="0" stopColor="var(--comet)" stopOpacity="0.32" />
          <stop offset="0.4" stopColor="var(--comet)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--comet)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* two faint widths, so the glow's edge softens rather than stops */}
      <motion.path d={glow} fill={`url(#ct-${uid})`} opacity={0.08} />
      <motion.path d={halo} fill={`url(#ct-${uid})`} opacity={0.14} />
      <motion.path d={body} fill={`url(#ct-${uid})`} />
      <motion.circle cx={cx} cy={cy} r={26} fill={`url(#ch-${uid})`} />
      <motion.circle cx={cx} cy={cy} r={5.5} fill="var(--comet-core)" stroke="var(--comet)" strokeWidth={2.2} />
    </motion.g>
  );
}

export function RingStage({
  t,
  className = '',
  detailOpacity,
  paused = false,
  receipts = true,
}: {
  t: Messages;
  className?: string;
  detailOpacity?: MotionValue<number>;
  paused?: boolean;
  receipts?: boolean;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10% 0px' });
  const running = !reduce && inView && !paused;
  const [step, setStep] = useState(0);
  const [arrived, setArrived] = useState<number | null>(null);

  // Advance only while visible, so the page stays quiet when scrolled away.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setStep((s) => s + 1), CYCLE);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (reduce) {
      setArrived(0);
      return;
    }
    setArrived(null);
    const timer = setTimeout(() => setArrived(step), TRAVEL * 1000 - 80);
    return () => clearTimeout(timer);
  }, [step, reduce]);

  const event = EVENTS[step % EVENTS.length];
  const fromAngle = angleOf(event.from);
  const toAngle = endAngle(fromAngle, angleOf(event.to), event.dir);
  const arrivedEvent = arrived === null ? null : EVENTS[arrived % EVENTS.length];
  const arrivedCopy = arrived === null ? null : t.hero.events[arrived % EVENTS.length];
  const layer = 'pointer-events-none absolute inset-0 h-full w-full overflow-visible';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* glow: drawn once, breathes through the layer's opacity */}
      <div className="breathe absolute inset-0">
        <svg viewBox={VIEW} className={layer} aria-hidden="true">
          <defs>
            <RingGradient id={`glow-g-${uid}`} />
            <filter id={`glow-f-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>
          <circle r={R} fill="var(--ring-b)" fillOpacity="0.03" stroke={`url(#glow-g-${uid})`} strokeWidth="10" filter={`url(#glow-f-${uid})`} />
        </svg>
      </div>

      {/* a slow dashed orbit inside the room */}
      <div className={`absolute inset-0 ${reduce ? '' : 'animate-[spin_120s_linear_infinite]'}`}>
        <svg viewBox={VIEW} className={layer} aria-hidden="true">
          <circle r={R * 0.8} fill="none" stroke="var(--hair-2)" strokeWidth="1" strokeDasharray="1.5 9" />
        </svg>
      </div>

      {/* ripples: the whisper spreading, scaled as whole layers */}
      {!reduce &&
        [0, 3.75].map((delay) => (
          <div key={delay} className="ripple absolute inset-0" style={{ animationDelay: `-${delay}s` }}>
            <svg viewBox={VIEW} className={layer} aria-hidden="true">
              <defs>
                <RingGradient id={`rip-${uid}-${delay}`} />
              </defs>
              <circle r={R} fill="none" stroke={`url(#rip-${uid}-${delay})`} strokeWidth="1.2" />
            </svg>
          </div>
        ))}

      {/* the ring itself, and the pulse travelling on it */}
      <svg viewBox={VIEW} className={layer} aria-hidden="true">
        <defs>
          <RingGradient id={`ring-${uid}`} />
        </defs>
        <circle r={R} fill="none" stroke={`url(#ring-${uid})`} strokeWidth="1.8" />
        <AnimatePresence>{running && <Comet key={step} from={fromAngle} to={toAngle} />}</AnimatePresence>
      </svg>

      {/* devices on the ring */}
      <motion.div className="absolute inset-0" style={detailOpacity ? { opacity: detailOpacity } : undefined}>
        {DEVICES.map((device) => {
          const x = 50 + POS * Math.cos(rad(device.angle));
          const y = 50 + POS * Math.sin(rad(device.angle));
          const above = Math.sin(rad(device.angle)) < 0;
          const sending = running && arrived !== step && event.from === device.key;
          const receiving = !paused && arrivedEvent?.to === device.key;
          return (
            <div key={device.key} className="absolute h-0 w-0" style={{ left: `${x}%`, top: `${y}%` }}>
              <div
                role="img"
                aria-label={t.hero.devices[device.key]}
                className={`absolute left-0 top-0 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-surface text-ink shadow-card transition-colors duration-500 sm:h-12 sm:w-12 ${
                  sending || receiving ? 'border-hair-2' : 'border-hair'
                }`}
              >
                <PlatformMark platform={device.key} className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
                {/* online: on the badge's edge, facing away from the centre, so it never sits on the ring line */}
                <span
                  className="live-dot absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--surface)] bg-ok"
                  style={{ left: `${50 + 50 * Math.cos(rad(device.angle))}%`, top: `${50 + 50 * Math.sin(rad(device.angle))}%` }}
                />
              </div>

              <AnimatePresence>
                {receipts && receiving && arrivedCopy && arrivedEvent && (
                  <motion.div
                    key={arrived}
                    initial={{ opacity: 0, y: above ? 8 : -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ x: '-50%' }}
                    className={`absolute left-0 ${above ? 'bottom-0 mb-9 sm:mb-10' : 'top-0 mt-9 sm:mt-10'}`}
                  >
                    <div className="flex items-center gap-2.5 whitespace-nowrap rounded-2xl border border-hair bg-surface py-2 pl-2 pr-3.5 shadow-card">
                      <span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, var(--ring-a), var(--ring-c))' }}>
                        <Icon name={arrivedEvent.icon} className="h-4 w-4" strokeWidth={1.9} />
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="text-[12.5px] font-medium text-ink">
                          {arrivedCopy.label}
                          <span className="text-muted"> · {arrivedCopy.detail}</span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-ok">
                          <Icon name="check" className="h-3 w-3" strokeWidth={2.4} />
                          {t.hero.received}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
