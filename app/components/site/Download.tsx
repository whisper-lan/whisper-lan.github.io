'use client';
import type { Messages } from '@/lib/i18n';
import type { BuildOption } from '@/lib/downloads';
import { PLATFORM_LABEL } from '@/lib/downloads';
import type { DownloadInfo, PlatformType } from '@/lib/release';
import { Icon, PlatformMark, Reveal } from './primitives';
import { GITHUB } from './links';

type Platform = Exclude<PlatformType, 'unknown'>;
const ORDER: Platform[] = ['mac', 'windows', 'linux', 'android', 'ios'];

export function Steps({ t }: { t: Messages }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="shell">
        <Reveal>
          <h2 className="display text-ink" style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>
            {t.steps.title}
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {t.steps.items.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
              <span className="mono block text-[13px] text-faint">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-4 block h-px w-full" style={{ background: 'linear-gradient(90deg, var(--ring-a), var(--ring-c) 30%, var(--hair) 30%)' }} />
              <h3 className="display mt-6 text-[32px] text-ink">{step.title}</h3>
              <p className="mt-3 max-w-[22rem] text-[15px] leading-[1.7] text-muted">{step.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BuildButton({ build, primary, onClick }: { build: { label: string; size: string; url: string }; primary: boolean; onClick: () => void }) {
  return (
    <a
      href={build.url}
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-[14px] px-4 py-3 text-[14px] transition-colors ${
        primary ? 'bg-accent text-accent-ink hover:bg-[var(--accent-hover)]' : 'border border-hair bg-surface-2 text-ink hover:border-[var(--hair-2)]'
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        <Icon name="download" className="h-4 w-4" strokeWidth={2} />
        {build.label}
      </span>
      <span className={`mono text-[12px] ${primary ? 'opacity-80' : 'text-muted'}`}>{build.size}</span>
    </a>
  );
}

export function Download({
  t,
  info,
  builds,
  version,
  detected,
  onDownload,
}: {
  t: Messages;
  info: DownloadInfo;
  builds: Partial<Record<PlatformType, BuildOption[]>>;
  version: string | null;
  detected: PlatformType;
  onDownload: () => void;
}) {
  const d = t.download;
  return (
    <section id="download" className="relative scroll-mt-16 pb-24 pt-8 sm:pb-32">
      <div className="shell">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="display text-ink" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>
              {d.title}
            </h2>
            <p className="mt-4 text-[17px] text-muted">{d.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
            {version && (
              <span className="chip">
                <span className="text-muted">{d.version}</span>
                <span className="mono font-medium text-ink">v{version}</span>
              </span>
            )}
            <a href={GITHUB.releases} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
              {d.changelog}
              <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {ORDER.map((platform, i) => {
            const options = builds[platform] ?? [];
            const single = info[platform].url ? [{ label: platform === 'windows' ? d.builds.windows : PLATFORM_LABEL[platform], size: info[platform].size, url: info[platform].url }] : [];
            const list = options.length ? options : single;
            const isDetected = detected === platform;
            const experimental = platform === 'ios';
            const meta = d.platforms[platform];
            // three wide cards on top, two below
            const span = i < 3 ? 'lg:col-span-2' : 'lg:col-span-3';
            return (
              <Reveal key={platform} delay={(i % 3) * 0.06} className={`${span} ${isDetected ? 'gradient-border' : ''}`}>
                <div className={`card relative flex h-full flex-col p-7 ${isDetected ? 'border-transparent' : ''}`}>
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-[14px] border border-hair bg-surface-2 text-ink">
                      <PlatformMark platform={platform} className="h-6 w-6" />
                    </span>
                    {isDetected && <span className="chip border-transparent bg-accent-soft text-accent">{d.detected}</span>}
                    {!isDetected && experimental && <span className="chip">{d.experimental}</span>}
                  </div>
                  <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-ink">{PLATFORM_LABEL[platform]}</h3>
                  <p className="mt-1 text-[14px] text-muted">{meta.req}</p>
                  <p className="mt-4 text-[13.5px] leading-[1.65] text-faint">{meta.note}</p>
                  <div className="mt-auto pt-7">
                    {list.length > 0 ? (
                      <div className={`grid gap-2 ${list.length > 2 && i >= 3 ? 'sm:grid-cols-2' : ''}`}>
                        {list.map((build, j) => (
                          <BuildButton key={build.url} build={build} primary={isDetected && j === 0} onClick={onDownload} />
                        ))}
                      </div>
                    ) : experimental ? (
                      <a href={GITHUB.releases} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[14px] border border-hair bg-surface-2 px-4 py-3 text-[14px] font-medium text-ink hover:border-[var(--hair-2)]">
                        {d.getIpa}
                        <Icon name="arrowUpRight" className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="block rounded-[14px] border border-dashed border-hair px-4 py-3 text-[14px] text-faint">{d.unavailable}</span>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
