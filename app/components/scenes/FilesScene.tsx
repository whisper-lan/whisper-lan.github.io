'use client';
import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import type { Messages } from '@/lib/i18n';
import { Icon } from '../site/primitives';
import { Fit, Landscape, MacWindow } from './frames';

// The phone's camera folder, open in Whisper's file window on the Mac, as
// the app lays it out: a floating sidebar with the devices under Locations
// (the phone mounted, so it has an eject button), the folder as a list.
// Three photos are picked and dragged into Finder's Downloads, where they
// fill in as they arrive; the window's island counts the copy and settles
// on "Copied 3 items". At 1 the copy is done.
// The scene's own progress is spread over 5 % – 92 % of its stretch.
const at = (times: number[]) => times.map((v) => 0.05 + v * 0.87);

const ROWS = [
  { name: 'IMG_0612.HEIC', date: '2026-06-12 18:40', size: '3.1 MB', video: false },
  { name: 'IMG_0613.HEIC', date: '2026-06-13 07:15', size: '2.8 MB', video: false },
  { name: 'IMG_0618.HEIC', date: '2026-06-18 19:02', size: '3.4 MB', video: false },
  { name: 'VID_0620.MOV', date: '2026-06-20 20:31', size: '86.2 MB', video: true },
  { name: 'IMG_0621.HEIC', date: '2026-06-21 09:48', size: '2.9 MB', video: false },
  { name: 'IMG_0624.HEIC', date: '2026-06-24 17:26', size: '3.3 MB', video: false },
  { name: 'IMG_0627.HEIC', date: '2026-06-27 21:05', size: '3.0 MB', video: false },
  { name: 'IMG_0630.HEIC', date: '2026-06-30 06:52', size: '2.7 MB', video: false },
];
const PICK = [0.12, 0.18, 0.24]; // each of the first three rows is selected in turn
const DRAG = [0.3, 0.5];
const COPY = [0.5, 0.86];
const GRID = 'grid-cols-[minmax(0,1fr)_104px_52px_70px]';

function SidebarItem({ icon, label, selected = false, trailing }: { icon: string; label: string; selected?: boolean; trailing?: React.ReactNode }) {
  return (
    <span className={`flex items-center gap-2 rounded-[7px] px-2 py-[5px] text-[11px] ${selected ? 'bg-app-muted font-semibold text-app-text' : 'text-app-text'}`}>
      <Icon name={icon} className="h-3.5 w-3.5 shrink-0 text-app-primary" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </span>
  );
}

function Row({ row, kind, progress, pickAt }: { row: (typeof ROWS)[number]; kind: string; progress: MotionValue<number>; pickAt?: number }) {
  const picked = useTransform(progress, pickAt === undefined ? [0, 1] : at([pickAt, pickAt + 0.02]), [0, pickAt === undefined ? 0 : 1]);
  return (
    <div className="relative">
      <motion.span className="absolute inset-x-1.5 inset-y-0 rounded-[6px] bg-app-primary" style={{ opacity: picked }} />
      <Cells row={row} kind={kind} className="text-app-text" />
      {/* the selected row in white, crossfaded over the plain one */}
      <motion.span className="absolute inset-0" style={{ opacity: picked }}>
        <Cells row={row} kind={kind} className="text-white" muted="text-white/80" />
      </motion.span>
    </div>
  );
}

function Cells({ row, kind, className, muted = 'text-app-text2' }: { row: (typeof ROWS)[number]; kind: string; className: string; muted?: string }) {
  return (
    <span className={`relative grid h-[27px] items-center gap-2 px-3.5 text-[10.5px] ${GRID} ${className}`}>
      <span className="flex min-w-0 items-center gap-2">
        <span className="relative h-[17px] w-[17px] shrink-0 overflow-hidden rounded-[3px]">
          <Landscape className="block h-full w-full" />
          {row.video && <i className="absolute inset-0 grid place-items-center bg-black/25" />}
        </span>
        <span className="truncate">{row.name}</span>
      </span>
      <span className={`mono truncate text-[9.5px] ${muted}`}>{row.date}</span>
      <span className={`text-right ${muted}`}>{row.size}</span>
      <span className={`truncate ${muted}`}>{kind}</span>
    </span>
  );
}

// One of the copied photos in Finder: its icon fills in as it arrives.
function Arrived({ name, progress, i }: { name: string; progress: MotionValue<number>; i: number }) {
  const [from, to] = COPY;
  const start = from + i * 0.06;
  const appear = useTransform(progress, at([from, from + 0.04]), [0, 1]);
  const fill = useTransform(progress, at([start, Math.min(to, start + (to - from) * 0.7)]), [0, 1]);
  const bar = useTransform(fill, (v) => `${v * 100}%`);
  const barOpacity = useTransform(fill, [0.96, 1], [1, 0]);
  const iconOpacity = useTransform(fill, [0, 1], [0.45, 1]);
  return (
    <motion.span className="flex w-[62px] flex-col items-center" style={{ opacity: appear }}>
      <motion.span className="h-[46px] w-[46px] overflow-hidden rounded-[6px] border border-app-line shadow-card" style={{ opacity: iconOpacity }}>
        <Landscape className="block h-full w-full" />
      </motion.span>
      <span className="relative mt-1.5 h-[3px] w-[42px] overflow-hidden rounded-full bg-app-muted">
        <motion.span className="absolute inset-y-0 left-0 rounded-full bg-app-primary" style={{ width: bar, opacity: barOpacity }} />
      </span>
      <span className="mt-1 block w-full truncate text-center text-[9px] text-app-text">{name}</span>
    </motion.span>
  );
}

export function FilesScene({ t, progress }: { t: Messages; progress: MotionValue<number> }) {
  const s = t.scenes;
  const [d0, d1] = DRAG;

  // the three photos travel from the list into Finder
  const ghostX = useTransform(progress, at([d0, d1]), [200, 486]);
  const ghostY = useTransform(progress, at([d0, d1]), [126, 372]);
  const ghostOpacity = useTransform(progress, at([d0, d0 + 0.03, d1 - 0.02, d1 + 0.01]), [0, 1, 1, 0]);
  const pointerX = useTransform(progress, at([0.06, 0.12, 0.24, d0, d1, 1]), [330, 236, 236, 236, 522, 522]);
  const pointerY = useTransform(progress, at([0.06, 0.12, 0.18, 0.24, d0, d1, 1]), [210, 101, 128, 155, 140, 396, 396]);
  const finderGlow = useTransform(progress, at([d1 - 0.08, d1, d1 + 0.06]), [0, 1, 0]);

  // the island: counts the copy, then says it is done
  const copied = useTransform(progress, at(COPY), [0, 100]);
  const [done, setDone] = useState(() => copied.get() >= 100);
  useMotionValueEvent(copied, 'change', (v) => setDone(v >= 100));
  const island = useTransform(progress, at([COPY[0], COPY[0] + 0.05]), [0, 1]);
  const islandY = useTransform(progress, at([COPY[0], COPY[0] + 0.05]), [-8, 0]);
  const islandBar = useTransform(copied, (v) => `${v}%`);
  const status = useTransform(progress, at([PICK[2], PICK[2] + 0.02]), [0, 1]);

  return (
    <Fit width={680} height={540}>
      {/* Whisper's file window */}
      <div className="absolute flex overflow-hidden rounded-[14px] border border-app-line bg-app-surface shadow-float" style={{ left: 0, top: 18, width: 548, height: 452 }}>
        <aside className="m-2 flex w-[150px] shrink-0 flex-col rounded-[12px] border border-app-line bg-app-chrome shadow-card">
          <div className="flex items-center gap-[6px] px-3 pt-3">
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <i key={c} className="h-[10px] w-[10px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="px-3 pb-1 pt-3 text-[11.5px] font-bold text-app-text">{s.filesTitle}</span>
          <div className="flex-1 px-1.5">
            <span className="block px-2 pb-1 pt-2 text-[9.5px] font-semibold text-app-text2">{s.favorites}</span>
            <SidebarItem icon="photo" label={s.places[0]} selected />
            <SidebarItem icon="download" label={s.places[1]} />
            <SidebarItem icon="photo" label={s.places[2]} />
            <span className="block px-2 pb-1 pt-3 text-[9.5px] font-semibold text-app-text2">{s.locations}</span>
            <SidebarItem icon="laptop" label={s.thisDevice} />
            <SidebarItem icon="phone" label={s.peers[0].name} trailing={<Icon name="eject" className="h-3 w-3 text-app-text2" />} />
            <SidebarItem icon="desktop" label={s.peers[1].name} />
          </div>
          <div className="border-t border-app-line px-1.5 pb-1.5 pt-1.5">
            <SidebarItem icon="link" label={s.shareLinks} trailing={<span className="text-[10px] text-app-text2">1</span>} />
            <SidebarItem icon="download" label={s.transfers} />
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-[48px] shrink-0 items-center gap-2.5 pl-2 pr-3.5">
            <span className="flex gap-1.5 text-app-text2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="m15 5-7 7 7 7" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-40" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block text-[12.5px] font-semibold text-app-text">{s.places[0]}</span>
              <span className="block text-[9.5px] text-app-text2">{s.peers[0].name}</span>
            </span>
            <span className="ml-auto flex items-center gap-2.5 text-app-text2">
              <span className="flex rounded-[7px] bg-app-muted p-[2px]">
                <span className="grid h-[18px] w-[24px] place-items-center rounded-[5px]">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
                    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
                    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
                    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
                  </svg>
                </span>
                <span className="grid h-[18px] w-[24px] place-items-center rounded-[5px] bg-app-surface text-app-text shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                    <path d="M5 7h14M5 12h14M5 17h14" />
                  </svg>
                </span>
              </span>
              <Icon name="search" className="h-3.5 w-3.5" />
            </span>
          </header>

          <div className={`grid shrink-0 gap-2 border-b border-app-line px-5 pb-1.5 text-[9.5px] font-medium text-app-text2 ${GRID}`}>
            {s.columns.map((c, i) => (
              <span key={c} className={i === 2 ? 'text-right' : ''}>
                {c}
              </span>
            ))}
          </div>
          <div className="flex-1 pt-1">
            {ROWS.map((row, i) => (
              <Row key={row.name} row={row} kind={row.video ? s.kindVideo : s.kindImage} progress={progress} pickAt={PICK[i]} />
            ))}
          </div>
          <motion.div className="shrink-0 border-t border-app-line px-4 py-1.5 text-center text-[9.5px] text-app-text2" style={{ opacity: status }}>
            {s.selected}
          </motion.div>

          {/* the window's island */}
          {/* between the folder's title and the view buttons */}
          <motion.div className="absolute left-[110px] right-[68px] top-[9px] flex justify-center" style={{ opacity: island, y: islandY }}>
            <span className="flex w-[198px] items-center gap-2.5 rounded-full bg-[#0b0b0d] px-3 py-[7px] text-white shadow-float">
              <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${done ? 'bg-[#34c759]' : 'bg-white/15'}`}>
                <Icon name={done ? 'check' : 'download'} className="h-3 w-3" strokeWidth={2.4} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-medium">{done ? s.copied : s.copying}</span>
                <span className="mt-[3px] block h-[2.5px] overflow-hidden rounded-full bg-white/15">
                  <motion.span className="block h-full rounded-full bg-white" style={{ width: islandBar }} />
                </span>
              </span>
            </span>
          </motion.div>
        </section>
      </div>

      {/* Finder's Downloads */}
      <MacWindow title={s.downloads} style={{ left: 432, top: 262, width: 244, height: 168 }}>
        <motion.span className="pointer-events-none absolute inset-1 rounded-[8px] border-2 border-app-primary/60" style={{ opacity: finderGlow }} />
        <div className="flex gap-3 p-4">
          {ROWS.slice(0, 3).map((row, i) => (
            <Arrived key={row.name} name={row.name} progress={progress} i={i} />
          ))}
        </div>
      </MacWindow>

      {/* the three photos being dragged */}
      <motion.div className="absolute left-0 top-0" style={{ x: ghostX, y: ghostY, opacity: ghostOpacity }}>
        <span className="relative block h-[44px] w-[44px]">
          {[2, 1, 0].map((n) => (
            <span key={n} className="absolute inset-0 overflow-hidden rounded-[6px] border border-white/70 shadow-card" style={{ transform: `translate(${n * 4}px, ${-n * 4}px) rotate(${n * 4}deg)` }}>
              <Landscape className="block h-full w-full" />
            </span>
          ))}
          <span className="absolute -right-2.5 -top-3.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#ff3b30] px-1 text-[9.5px] font-semibold text-white">3</span>
        </span>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x: pointerX, y: pointerY }}>
        <svg width="18" height="22" viewBox="0 0 18 22" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" aria-hidden="true">
          <path d="M1.5 1.5v16.2l4.3-4.1 2.8 6.4 2.7-1.2-2.8-6.3 6-.2Z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </Fit>
  );
}
