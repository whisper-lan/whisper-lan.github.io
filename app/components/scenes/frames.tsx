'use client';
import { CSSProperties, ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';

// Scenes are composed on a fixed canvas and scaled to their container, so the
// product mock-ups keep exact proportions on every screen size.
export function Fit({ width, height, children, className = '' }: { width: number; height: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className={`relative w-full ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div
        className="absolute left-0 top-0 transition-opacity duration-300"
        style={{ width, height, transform: `scale(${scale ?? 1})`, transformOrigin: 'top left', opacity: scale === null ? 0 : 1 }}
      >
        {children}
      </div>
    </div>
  );
}

export function MacWindow({ title, children, className = '', style }: { title?: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute flex flex-col overflow-hidden rounded-[14px] border border-app-line bg-app-surface shadow-float ${className}`} style={style}>
      <div className="relative flex h-[32px] shrink-0 items-center border-b border-app-line bg-app-chrome px-3">
        <span className="flex gap-[7px]">
          <i className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
          <i className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
          <i className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        </span>
        {title && <span className="absolute inset-x-0 text-center text-[12px] font-semibold text-app-text2">{title}</span>}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function Phone({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute rounded-[34px] bg-[#0d0d0f] p-[5px] shadow-float ring-1 ring-[var(--hair-2)] ${className}`} style={style}>
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[29px] bg-app-surface">
        <div className="flex h-[30px] shrink-0 items-center justify-between px-5 text-[10.5px] font-semibold text-app-text">
          <span>9:41</span>
          <span className="absolute left-1/2 top-[7px] h-[16px] w-[52px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 10" className="h-[8px] w-[13px]" fill="currentColor" aria-hidden="true">
              <rect x="0" y="6" width="3" height="4" rx=".6" />
              <rect x="4.3" y="4" width="3" height="6" rx=".6" />
              <rect x="8.6" y="2" width="3" height="8" rx=".6" />
              <rect x="12.9" y="0" width="3" height="10" rx=".6" />
            </svg>
            <span className="inline-block h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]">
              <span className="block h-full w-3/4 rounded-[1.5px] bg-current" />
            </span>
          </span>
        </div>
        <div className="relative min-h-0 flex-1">{children}</div>
        <div className="mx-auto mb-[6px] mt-1 h-[4px] w-[72px] shrink-0 rounded-full bg-app-text opacity-80" />
      </div>
    </div>
  );
}

// A calm alpine lake — stands in for a received photo.
export function Landscape({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`ls-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec5ff" />
          <stop offset="0.6" stopColor="#d6ecff" />
          <stop offset="1" stopColor="#fbe7cf" />
        </linearGradient>
        <linearGradient id={`ls-lake-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5aa7c9" />
          <stop offset="1" stopColor="#2f6f8f" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#ls-sky-${id})`} />
      <circle cx="150" cy="34" r="11" fill="#fff6e5" opacity="0.9" />
      <path d="M0 78 38 34l20 22 26-38 34 46 18-18 30 30 34-12v36H0Z" fill="#6f8fb0" />
      <path d="M84 18 92 30l-6-2-4 8-4-6Z" fill="#f4f8ff" />
      <path d="M0 86 30 64l26 18 30-22 36 26 30-16 48 16v34H0Z" fill="#3f6a6e" />
      <rect y="92" width="200" height="28" fill={`url(#ls-lake-${id})`} />
      <path d="M20 100h40M90 104h56M120 110h44M30 113h30" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// A seaside sunset — stands in for a cast video.
export function FilmStill({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`fs-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2a63" />
          <stop offset="0.45" stopColor="#b5507a" />
          <stop offset="0.75" stopColor="#ff9a6b" />
          <stop offset="1" stopColor="#ffd39a" />
        </linearGradient>
        <linearGradient id={`fs-sea-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b3d73" />
          <stop offset="1" stopColor="#141633" />
        </linearGradient>
        <radialGradient id={`fs-sun-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.6" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#ffb36b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#fs-sky-${id})`} />
      <circle cx="196" cy="104" r="40" fill={`url(#fs-sun-${id})`} />
      <circle cx="196" cy="104" r="17" fill="#fff1cf" />
      <path d="M0 102 40 90l34 8 40-14 44 12 36-6 46 10 40-8 40 10v8H0Z" fill="#3c2652" opacity="0.85" />
      <rect y="108" width="320" height="72" fill={`url(#fs-sea-${id})`} />
      <path d="M176 114h40M168 122h56M182 130h28M160 140h70M188 152h18" stroke="#ffd59a" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 126h50M240 134h60M60 150h40" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
