'use client';
import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { Fit, Landscape, MacWindow, Phone } from './frames';

// A folder travelling from the desktop app to a phone: both ends of the same
// conversation, as the real app lays them out. Scrolling plays the
// conversation: messages arrive, then the folder transfers and is verified.

function Avatar({ initial, color }: { initial: string; color: string }) {
  return (
    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white" style={{ background: color }}>
      {initial}
    </span>
  );
}

// A message bubble that arrives during a slice of the scene's progress.
function Arrive({ progress, at, from = 'right', className = '', children }: { progress: MotionValue<number>; at: number; from?: 'left' | 'right'; className?: string; children: React.ReactNode }) {
  const opacity = useTransform(progress, [at, at + 0.07], [0, 1]);
  const y = useTransform(progress, [at, at + 0.09], [14, 0]);
  const x = useTransform(progress, [at, at + 0.09], [from === 'right' ? 10 : -10, 0]);
  return (
    <motion.div className={className} style={{ opacity, y, x }}>
      {children}
    </motion.div>
  );
}

function FolderCard({ t, percent, done, compact = false }: { t: Messages; percent: MotionValue<number>; done: boolean; compact?: boolean }) {
  const width = useTransform(percent, (v) => `${v}%`);
  const label = useTransform(percent, (v) => `${Math.round(v)}%`);
  return (
    <div className={`rounded-[16px] border border-app-line bg-app-out ${compact ? 'w-[132px] p-2.5' : 'w-[236px] p-3'}`}>
      <div className="flex items-center gap-2.5">
        <span className={`grid shrink-0 place-items-center rounded-[10px] bg-app-primary text-white ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}>
          <Icon name="folder" className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className={`block truncate font-semibold text-app-text ${compact ? 'text-[11px]' : 'text-[13px]'}`}>{t.scenes.folderName}</span>
          <span className={`block text-app-text2 ${compact ? 'text-[9.5px]' : 'text-[11px]'}`}>
            {t.scenes.folderMeta} · 3.6 GB
          </span>
        </span>
      </div>
      <div className={`flex items-center gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
        <span className="h-[4px] flex-1 overflow-hidden rounded-full bg-app-muted">
          <motion.span className="block h-full rounded-full transition-colors duration-500" style={{ width, background: done ? 'var(--app-trusted)' : 'var(--app-primary)' }} />
        </span>
        {done ? (
          <span className={`flex items-center gap-0.5 font-medium text-app-trusted ${compact ? 'text-[9.5px]' : 'text-[11px]'}`}>
            <Icon name="check" className="h-3 w-3" strokeWidth={2.6} />
            {t.scenes.verified}
          </span>
        ) : (
          <motion.span className={`mono tabular-nums text-app-text2 ${compact ? 'w-[24px] text-[9.5px]' : 'w-[30px] text-[11px]'}`}>{label}</motion.span>
        )}
      </div>
    </div>
  );
}

export function TransferScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const percent = useTransform(progress, [0.42, 0.86], [0, 100]);
  const [done, setDone] = useState(() => percent.get() >= 100);
  const [moving, setMoving] = useState(() => percent.get() > 0 && percent.get() < 100);
  useMotionValueEvent(percent, 'change', (v) => {
    setDone(v >= 100);
    setMoving(v > 0 && v < 100);
  });
  const bar = useTransform(percent, (v) => `${v}%`);
  const headerPercent = useTransform(percent, (v) => (v >= 100 ? '100%' : `${v.toFixed(1)}%`));
  const peers = t.scenes.peers;
  const avatarColors = ['var(--app-connected)', 'var(--app-connected)', 'var(--app-trusted)'];
  const times = ['21:08', '20:41', '10/12'];

  return (
    <Fit width={680} height={540}>
      <MacWindow title="Whisper" style={{ left: 0, top: 18, width: 532, height: 480 }}>
        <div className="flex h-full">
          {/* device list */}
          <aside className="flex w-[206px] shrink-0 flex-col gap-1 border-r border-app-line p-2.5">
            <div className="mb-1.5 flex gap-1.5">
              <span className="flex h-[30px] flex-1 items-center gap-1.5 rounded-[10px] bg-app-muted px-2.5 text-[11.5px] text-app-text2">
                <Icon name="search" className="h-3.5 w-3.5" />
                {t.scenes.search}
              </span>
              <span className="flex h-[30px] items-center gap-2 rounded-[10px] bg-app-muted px-2 text-app-text2">
                <Icon name="plus" className="h-3.5 w-3.5" />
                <Icon name="speaker" className="h-3.5 w-3.5" />
                <Icon name="keyboard" className="h-3.5 w-3.5" />
              </span>
            </div>
            {peers.map((peer, i) => (
              <div key={peer.name} className={`flex items-center gap-2.5 rounded-[12px] px-2 py-2 ${i === 0 ? 'bg-app-out' : ''}`}>
                <Avatar initial={peer.initial} color={avatarColors[i]} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-baseline justify-between gap-1">
                    <span className="truncate text-[12.5px] font-semibold text-app-text">{peer.name}</span>
                    <span className="text-[9.5px] text-app-text2">{times[i]}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[10.5px] text-app-text2">
                    <i className="h-[6px] w-[6px] rounded-full" style={{ background: i === 2 ? 'var(--app-trusted)' : 'var(--app-connected)' }} />
                    <span className="truncate">{peer.last}</span>
                  </span>
                </span>
              </div>
            ))}
          </aside>

          {/* conversation */}
          <section className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[56px] shrink-0 items-center justify-between px-4">
              <span className="leading-tight">
                <span className="block text-[14.5px] font-semibold text-app-text">{peers[0].name}</span>
                <span className="mt-1 flex items-center gap-1 text-[10.5px] text-app-text2">
                  <i className="h-[6px] w-[6px] rounded-full bg-app-connected" />
                  {t.scenes.connected} · 192.168.1.23:10002
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="mono text-right text-[10px] leading-tight text-app-text2">
                  <span className="block">{moving ? '86.4 MB/s' : '—'}</span>
                  <motion.span className="block tabular-nums">{headerPercent}</motion.span>
                </span>
                <Icon name="wifi" className="h-[18px] w-[18px] text-app-connected" strokeWidth={2} />
                <Icon name="gear" className="h-[17px] w-[17px] text-app-text2" />
              </span>
            </header>
            <div className="h-[2px] shrink-0 bg-app-line">
              <motion.div className="h-full" style={{ width: bar, background: 'linear-gradient(90deg, var(--app-trusted), var(--app-connected))' }} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 pt-4">
              <Arrive progress={progress} at={0.04} from="left" className="max-w-[78%] self-start rounded-[16px] border border-app-line bg-app-in px-3 py-2 text-[12.5px] text-app-text">
                {t.scenes.msgIn}
              </Arrive>
              <Arrive progress={progress} at={0.14} className="max-w-[78%] self-end rounded-[16px] border border-app-line bg-app-out px-3 py-2 text-[12.5px] text-app-text">
                {t.scenes.msgOut}
              </Arrive>
              <Arrive progress={progress} at={0.24} className="shrink-0 self-end overflow-hidden rounded-[16px] border border-app-line bg-app-out">
                <Landscape className="block h-[76px] w-[126px]" />
                <div className="px-2.5 py-1.5 text-[10px] text-app-text2">{t.scenes.photoName} · 4.2 MB</div>
              </Arrive>
              <Arrive progress={progress} at={0.34} className="self-end">
                <FolderCard t={t} percent={percent} done={done} />
              </Arrive>
            </div>

            <div className="m-3 mt-2 flex h-[62px] shrink-0 flex-col justify-between rounded-[16px] border border-app-line px-3.5 py-2.5">
              <span className="text-[12px] text-app-text2">{t.scenes.composer}</span>
              <span className="flex items-center justify-between text-app-text2">
                <Icon name="clipboard" className="h-3.5 w-3.5" />
                <Icon name="plus" className="h-4 w-4" />
              </span>
            </div>
          </section>
        </div>
      </MacWindow>

      <Phone style={{ left: 506, top: 128, width: 172, height: 376 }}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-1.5 px-3 pb-2 pt-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-app-primary" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
              <path d="m15 5-7 7 7 7" />
            </svg>
            <span className="leading-tight">
              <span className="block text-[12px] font-semibold text-app-text">MacBook Pro</span>
              <span className="flex items-center gap-1 text-[9px] text-app-text2">
                <i className="h-[5px] w-[5px] rounded-full bg-app-connected" />
                {t.scenes.connected}
              </span>
            </span>
          </div>
          <div className="h-[2px] bg-app-line">
            <motion.div className="h-full" style={{ width: bar, background: 'linear-gradient(90deg, var(--app-trusted), var(--app-connected))' }} />
          </div>
          <div className="flex flex-1 flex-col gap-2 px-2.5 pt-3">
            <Arrive progress={progress} at={0.05} className="max-w-[86%] self-end rounded-[13px] border border-app-line bg-app-out px-2.5 py-1.5 text-[10.5px] text-app-text">
              {t.scenes.msgIn}
            </Arrive>
            <Arrive progress={progress} at={0.16} from="left" className="max-w-[86%] self-start rounded-[13px] border border-app-line bg-app-in px-2.5 py-1.5 text-[10.5px] text-app-text">
              {t.scenes.msgOut}
            </Arrive>
            <Arrive progress={progress} at={0.26} from="left" className="self-start overflow-hidden rounded-[13px] border border-app-line">
              <Landscape className="block h-[64px] w-[106px]" />
            </Arrive>
            <Arrive progress={progress} at={0.36} from="left" className="self-start">
              <FolderCard t={t} percent={percent} done={done} compact />
            </Arrive>
          </div>
          <div className="mx-2.5 mb-2 flex h-[34px] items-center justify-between rounded-[12px] border border-app-line px-2.5 text-[10px] text-app-text2">
            {t.scenes.composer}
            <Icon name="plus" className="h-3.5 w-3.5" />
          </div>
        </div>
      </Phone>
    </Fit>
  );
}
