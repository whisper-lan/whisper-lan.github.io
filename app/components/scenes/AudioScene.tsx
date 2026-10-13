'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon, useReducedMotion } from '../site/primitives';
import { Fit } from './frames';

// Deterministic bar heights and phases, so server and client markup match.
const BARS = [0.42, 0.7, 0.55, 0.9, 0.62, 0.8, 0.48, 0.96, 0.66, 0.74, 0.5, 0.86, 0.58, 0.78, 0.44, 0.92, 0.6, 0.72, 0.52, 0.84, 0.46, 0.68];
const delay = (i: number) => `${-((i * 0.37) % 1.1).toFixed(2)}s`;
const SOURCE = { x: 270, y: 270 };

function Bars({ count, height, width = 4, gap = 3 }: { count: number; height: number; width?: number; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex items-end" style={{ height, gap }}>
      {BARS.slice(0, count).map((h, i) => (
        <i
          key={i}
          className="eq-bar block rounded-full"
          style={{
            width,
            height: `${h * 100}%`,
            background: 'linear-gradient(180deg, var(--ring-a), var(--ring-c))',
            animationDelay: delay(i),
            transform: reduce ? 'scaleY(0.8)' : undefined,
          }}
        />
      ))}
    </span>
  );
}

type Output = { name: string; icon: string; role: string; badge: string; y: number };

// One speaker joins the group: its line draws out from the source, then the
// card arrives. Both follow the scroll.
function Link({ o, i, progress }: { o: Output; i: number; progress: MotionValue<number> }) {
  const start = 0.12 + i * 0.12;
  const pathLength = useTransform(progress, [start, start + 0.22], [0, 1]);
  const flow = useTransform(progress, [start + 0.18, start + 0.26], [0, 1]);
  const end = { x: 424, y: o.y + 55 };
  const d = `M ${SOURCE.x} ${SOURCE.y} C ${SOURCE.x + 90} ${SOURCE.y}, ${end.x - 90} ${end.y}, ${end.x} ${end.y}`;
  return (
    <g>
      <motion.path d={d} fill="none" stroke="var(--hair-2)" strokeWidth="1.5" style={{ pathLength }} />
      <motion.path d={d} fill="none" stroke="var(--ring-b)" strokeWidth="2" strokeLinecap="round" className="flow-dash" style={{ opacity: flow }} />
    </g>
  );
}

function Speaker({ o, i, progress }: { o: Output; i: number; progress: MotionValue<number> }) {
  const start = 0.26 + i * 0.12;
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const x = useTransform(progress, [start, start + 0.12], [24, 0]);
  return (
    <motion.div
      className="absolute flex items-center gap-3 rounded-[20px] border border-app-line bg-app-surface px-4 shadow-card"
      style={{ left: 424, top: o.y, width: 236, height: 110, opacity, x }}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-app-muted text-app-text">
        <Icon name={o.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-app-text">{o.name}</span>
        <span className="mt-1 block text-[11px] text-app-text2">{o.role}</span>
        <span className="mt-2.5 block">
          <Bars count={12} height={20} width={3} gap={3} />
        </span>
      </span>
      <span className="mono mt-4 self-start rounded-full border border-app-line px-2 py-0.5 text-[10px] font-medium text-app-text2">{o.badge}</span>
    </motion.div>
  );
}

export function AudioScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const outputs: Output[] = [
    { name: s.peers[0].name, icon: 'phone', role: s.left, badge: 'L', y: 70 },
    { name: s.peers[1].name, icon: 'desktop', role: s.right, badge: 'R', y: 215 },
    { name: s.peers[2].name, icon: 'laptop', role: s.group, badge: 'L+R', y: 360 },
  ];
  // how many speakers have joined, counted as each card lands
  const count = useTransform(progress, (v) => String([0.32, 0.44, 0.56].filter((x) => v >= x).length));

  return (
    <Fit width={680} height={540}>
      <svg viewBox="0 0 680 540" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {outputs.map((o, i) => (
          <Link key={o.badge} o={o} i={i} progress={progress} />
        ))}
      </svg>

      {/* source */}
      <div className="absolute rounded-[22px] border border-app-line bg-app-surface p-5 shadow-float" style={{ left: 24, top: 160, width: 248, height: 220 }}>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-app-muted text-app-text">
            <Icon name="laptop" className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold text-app-text">MacBook Pro</span>
            <span className="text-[11.5px] text-app-text2">
              {s.source} · {s.sourceSub}
            </span>
          </span>
        </div>
        <div className="mt-6 flex justify-center">
          <Bars count={22} height={72} width={5} gap={4} />
        </div>
        <div className="mt-5 flex items-center gap-2 text-[11px] text-app-text2">
          <i className="live-dot relative h-2 w-2 rounded-full bg-ok" />
          {s.group} · <motion.span className="tabular-nums">{count}</motion.span>
        </div>
      </div>

      {outputs.map((o, i) => (
        <Speaker key={o.badge} o={o} i={i} progress={progress} />
      ))}
    </Fit>
  );
}
