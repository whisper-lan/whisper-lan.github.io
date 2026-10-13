'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Messages } from '@/lib/i18n';
import { Icon, Reveal, useReducedMotion } from './primitives';

function Card({ title, desc, children, className = '', visualClass = 'h-[230px]', delay = 0 }: { title: string; desc: string; children: ReactNode; className?: string; visualClass?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`card flex flex-col overflow-hidden ${className}`}>
      <div className={`relative overflow-hidden ${visualClass}`}>{children}</div>
      <div className="px-7 pb-7 pt-1">
        <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        <p className="mt-2 text-[15px] leading-[1.7] text-muted">{desc}</p>
      </div>
    </Reveal>
  );
}

function QuickSendVisual({ t }: { t: Messages }) {
  const d = t.details;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-10 px-6">
      <div className="relative hidden sm:block">
        <div className="w-[176px] rounded-[12px] border border-hair bg-surface p-1.5 text-[13px] shadow-float">
          <div className="rounded-[7px] px-2.5 py-1.5 text-ink-2">{d.menu[0]}</div>
          <div className="rounded-[7px] px-2.5 py-1.5 text-ink-2">{d.menu[1]}</div>
          <div className="mx-2 my-1 h-px bg-[var(--hair)]" />
          <div className="flex items-center justify-between rounded-[7px] bg-accent px-2.5 py-1.5 text-accent-ink">
            {d.menu[2]}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </div>
        </div>
        <div className="absolute left-[168px] top-[78px] w-[140px] rounded-[12px] border border-hair bg-surface p-1.5 text-[13px] shadow-float">
          {t.scenes.peers.slice(0, 2).map((peer, i) => (
            <div key={peer.name} className={`flex items-center gap-2 rounded-[7px] px-2 py-1.5 ${i === 0 ? 'bg-surface-2' : ''}`}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-app-connected text-[10px] font-semibold text-white">{peer.initial}</span>
              <span className="truncate text-ink-2">{peer.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center sm:ml-24">
        <div className="flex gap-2">
          <span className="keycap">⌘</span>
          <span className="keycap">⌥</span>
          <span className="keycap">V</span>
        </div>
        <span className="mt-3 text-[12px] text-muted">{d.hotkey}</span>
      </div>
    </div>
  );
}

function NotifyVisual({ t }: { t: Messages }) {
  const d = t.details;
  const banner = (
    <div className="glass flex w-[280px] gap-3 rounded-[18px] border border-hair p-3 shadow-float">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white" style={{ background: 'linear-gradient(160deg, #4ade80, #16a34a)' }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 4c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4L6 20l3.6-2.1c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.1 8.5-7S16.7 4 12 4Z" />
        </svg>
      </span>
      <span className="min-w-0 flex-1 leading-snug">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold text-ink">{d.notifyApp}</span>
          <span className="text-[11px] text-faint">{d.notifyNow}</span>
        </span>
        <span className="block text-[11.5px] text-muted">{d.notifyFrom}</span>
        <span className="mt-0.5 block text-[13px] text-ink-2">{d.notifyText}</span>
      </span>
    </div>
  );
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative">
        <div className="absolute inset-x-4 -bottom-3 h-full rounded-[18px] border border-hair bg-surface-2 opacity-70" />
        <div className="relative">{banner}</div>
      </div>
    </div>
  );
}

function ClipboardVisual({ t }: { t: Messages }) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2.5 rounded-full border border-hair bg-surface px-3 py-1.5 shadow-card">
        <Icon name="laptop" className="h-4 w-4 text-ink-2" />
        <span className="text-[13px] font-medium text-ink">MacBook Pro</span>
        <span className="flex gap-1">
          <span className="keycap h-6 min-w-6 rounded-[6px] px-1.5 text-[11px]">⌘</span>
          <span className="keycap h-6 min-w-6 rounded-[6px] px-1.5 text-[11px]">C</span>
        </span>
      </div>
      <div className="relative h-12 w-px bg-[var(--hair-2)]">
        {!reduce && (
          <motion.span
            className="absolute -left-[3px] h-[7px] w-[7px] rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--ring-a), var(--ring-c))' }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <div className="flex items-center gap-2.5 rounded-full border border-hair bg-surface px-3 py-1.5 shadow-card">
        <Icon name="phone" className="h-4 w-4 text-ink-2" />
        <span className="text-[13px] font-medium text-ink">{t.scenes.peers[0].name}</span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{t.details.paste}</span>
      </div>
      <span className="rounded-[12px] border border-hair bg-surface-2 px-3 py-1.5 text-[12.5px] text-ink-2">{t.details.snippet}</span>
    </div>
  );
}

function ScreenshotVisual() {
  return (
    <div className="absolute inset-5 overflow-hidden rounded-[16px] border border-hair" style={{ background: 'linear-gradient(135deg, var(--wall-a-1), var(--wall-b-1))' }}>
      <div className="absolute left-[12%] top-[16%] h-[58%] w-[56%] rounded-[10px] border border-app-line bg-app-surface p-3 shadow-card">
        <div className="mb-3 flex gap-1">
          <i className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" />
          <i className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" />
          <i className="h-[6px] w-[6px] rounded-full bg-[#28c840]" />
        </div>
        <i className="block h-[5px] w-4/5 rounded-full bg-app-muted" />
        <i className="mt-2 block h-[5px] w-3/5 rounded-full bg-app-muted" />
      </div>
      <div className="absolute left-[34%] top-[30%] h-[48%] w-[50%] border-[1.5px] border-dashed border-white bg-white/10" style={{ boxShadow: '0 0 0 999px rgba(0,0,0,0.28)' }}>
        {['-left-[4px] -top-[4px]', '-right-[4px] -top-[4px]', '-left-[4px] -bottom-[4px]', '-right-[4px] -bottom-[4px]'].map((pos) => (
          <i key={pos} className={`absolute h-[8px] w-[8px] rounded-full border border-[#2563eb] bg-white ${pos}`} />
        ))}
        <span className="mono absolute -top-6 left-0 rounded-[6px] bg-black/70 px-1.5 py-0.5 text-[10px] text-white">1280 × 720</span>
      </div>
    </div>
  );
}

// A static, deterministic QR-like pattern with the three finder squares.
const QR_SIZE = 21;
const QR_CELLS: [number, number][] = (() => {
  const n = QR_SIZE;
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rand() > 0.52) cells.push([x, y]);
  return cells;
})();

function QrVisual() {
  const reduce = useReducedMotion();
  const n = QR_SIZE;
  const cells = QR_CELLS;
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width="6" height="6" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" fill="currentColor" />
    </g>
  );
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative p-5">
        {['left-0 top-0 border-l-2 border-t-2 rounded-tl-[12px]', 'right-0 top-0 border-r-2 border-t-2 rounded-tr-[12px]', 'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[12px]', 'right-0 bottom-0 border-r-2 border-b-2 rounded-br-[12px]'].map((c) => (
          <i key={c} className={`absolute h-6 w-6 border-ink ${c}`} />
        ))}
        <svg viewBox={`0 0 ${n} ${n}`} className="h-[132px] w-[132px] text-ink" shapeRendering="crispEdges" aria-hidden="true">
          {cells.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
          ))}
          {eye(0, 0)}
          {eye(n - 7, 0)}
          {eye(0, n - 7)}
        </svg>
        {!reduce && (
          <motion.i
            className="absolute inset-x-3 h-[2px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--ring-b), transparent)', boxShadow: '0 0 12px var(--ring-b)' }}
            animate={{ top: ['14%', '86%', '14%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}

function MultiVisual({ t }: { t: Messages }) {
  const peers = t.scenes.peers;
  const icons = ['phone', 'desktop', 'laptop'];
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="flex items-center gap-3 rounded-full border border-hair bg-surface py-2 pl-2 pr-4 shadow-card">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink-2">
          <Icon name="laptop" className="h-[18px] w-[18px]" />
        </span>
        <span className="text-[14px] font-medium text-ink">MacBook Pro</span>
      </div>
      <svg viewBox="0 0 120 150" className="h-[150px] w-[90px] shrink-0 sm:w-[120px]" preserveAspectRatio="none" aria-hidden="true">
        {[22, 75, 128].map((y) => (
          <path key={y} d={`M0 75 C 60 75, 60 ${y}, 120 ${y}`} fill="none" stroke="var(--hair-2)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="space-y-3">
        {peers.map((peer, i) => (
          <div key={peer.name} className="flex items-center gap-3 rounded-full border border-hair bg-surface py-1.5 pl-1.5 pr-4 shadow-card">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-ink-2">
              <Icon name={icons[i]} className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-medium text-ink">{peer.name}</span>
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <i className="h-1.5 w-1.5 rounded-full bg-ok" />
                {t.scenes.connected}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Details({ t }: { t: Messages }) {
  const d = t.details.items;
  return (
    <section className="py-24 sm:py-32">
      <div className="shell">
        <Reveal>
          <h2 className="display max-w-[20ch] whitespace-pre-line text-ink" style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>
            {t.details.title}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card title={d.quickSend.title} desc={d.quickSend.desc} className="md:col-span-2" visualClass="h-[250px]">
            <QuickSendVisual t={t} />
          </Card>
          <Card title={d.notify.title} desc={d.notify.desc} visualClass="h-[250px]" delay={0.05}>
            <NotifyVisual t={t} />
          </Card>
          <Card title={d.clipboard.title} desc={d.clipboard.desc}>
            <ClipboardVisual t={t} />
          </Card>
          <Card title={d.screenshot.title} desc={d.screenshot.desc} delay={0.05}>
            <ScreenshotVisual />
          </Card>
          <Card title={d.qr.title} desc={d.qr.desc} delay={0.1}>
            <QrVisual />
          </Card>
          <Card title={d.multi.title} desc={d.multi.desc} className="md:col-span-2 lg:col-span-3" visualClass="h-[230px]">
            <MultiVisual t={t} />
          </Card>
        </div>
      </div>
    </section>
  );
}
