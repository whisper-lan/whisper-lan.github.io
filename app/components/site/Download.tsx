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
    <section className="py-16 sm:py-32">
      <div className="shell">
        <Reveal>
          <h2 className="display text-ink" style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}>
            {t.steps.title}
          </h2>
        </Reveal>
        {/* phones: a short timeline on a rail; wider screens: three columns */}
        <ol className="mt-8 sm:mt-14 sm:grid sm:grid-cols-3 sm:gap-8">
          {t.steps.items.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="group relative flex gap-4 sm:block">
              <span className="flex flex-col items-center sm:hidden">
                <span className="mono grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hair bg-surface text-[12px] text-ink-2">{i + 1}</span>
                {i < t.steps.items.length - 1 && <span className="w-px flex-1" style={{ background: 'linear-gradient(var(--ring-b), var(--hair))' }} />}
              </span>
              <div className="pb-7 pt-1 group-last:pb-0 sm:pb-0 sm:pt-0">
                <span className="mono hidden text-[13px] text-faint sm:block">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-4 hidden h-px w-full sm:block" style={{ background: 'linear-gradient(90deg, var(--ring-a), var(--ring-c) 30%, var(--hair) 30%)' }} />
                <h3 className="display text-[19px] text-ink sm:mt-6 sm:text-[32px]">{step.title}</h3>
                <p className="mt-1 max-w-[22rem] text-[14px] leading-[1.65] text-muted sm:mt-3 sm:text-[15px] sm:leading-[1.7]">{step.desc}</p>
              </div>
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

function Builds({ t, platform, list, primary, onDownload }: { t: Messages; platform: Platform; list: { label: string; size: string; url: string }[]; primary: boolean; onDownload: () => void }) {
  const d = t.download;
  if (list.length > 0)
    return (
      <div className={`grid gap-2 ${list.length > 2 ? 'grid-cols-2' : ''}`}>
        {list.map((build, j) => (
          <BuildButton key={build.url} build={build} primary={primary && j === 0} onClick={onDownload} />
        ))}
      </div>
    );
  if (platform === 'ios')
    return (
      <a href={GITHUB.releases} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[14px] border border-hair bg-surface-2 px-4 py-3 text-[14px] font-medium text-ink hover:border-[var(--hair-2)]">
        {d.getIpa}
        <Icon name="arrowUpRight" className="h-4 w-4" />
      </a>
    );
  return <span className="block rounded-[14px] border border-dashed border-hair px-4 py-3 text-[14px] text-faint">{d.unavailable}</span>;
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
    <section id="download" className="relative scroll-mt-16 pb-16 pt-4 sm:pb-32 sm:pt-8">
      <div className="shell">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <h2 className="display text-ink" style={{ fontSize: 'clamp(30px, 5vw, 68px)' }}>
              {d.title}
            </h2>
            <p className="mt-3 text-[15px] text-muted sm:mt-4 sm:text-[17px]">{d.subtitle}</p>
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

        {/* Phones: one list, your platform first and open; the rest open on tap.
            A phone mostly downloads for itself, and the rest is for later. */}
        <Reveal className="mt-8 rounded-[24px] border border-hair bg-surface px-4 md:hidden">
          {[...ORDER].sort((a, b) => Number(b === detected) - Number(a === detected)).map((platform) => {
            const options = builds[platform] ?? [];
            const single = info[platform].url ? [{ label: platform === 'windows' ? d.builds.windows : PLATFORM_LABEL[platform], size: info[platform].size, url: info[platform].url }] : [];
            const isDetected = detected === platform;
            return (
              <details key={platform} open={isDetected} className="group border-b border-hair last:border-0">
                <summary className="flex cursor-pointer items-center gap-3.5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-hair bg-surface-2 text-ink">
                    <PlatformMark platform={platform} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                      {PLATFORM_LABEL[platform]}
                      {isDetected && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{d.detected}</span>}
                      {!isDetected && platform === 'ios' && <span className="rounded-full border border-hair px-2 py-0.5 text-[11px] font-medium text-muted">{d.experimental}</span>}
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-muted">{d.platforms[platform].req}</span>
                  </span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faint transition-transform duration-300 group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </summary>
                <div className="pb-5">
                  <p className="mb-3 text-[13px] leading-[1.6] text-faint">{d.platforms[platform].note}</p>
                  <Builds t={t} platform={platform} list={options.length ? options : single} primary={isDetected} onDownload={onDownload} />
                </div>
              </details>
            );
          })}
        </Reveal>

        <div className="mt-12 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-6">
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
                    {list.length > 2 && i < 3 ? (
                      // the three narrow cards on top keep their builds in one column
                      <div className="grid gap-2">
                        {list.map((build, j) => (
                          <BuildButton key={build.url} build={build} primary={isDetected && j === 0} onClick={onDownload} />
                        ))}
                      </div>
                    ) : (
                      <Builds t={t} platform={platform} list={list} primary={isDetected} onDownload={onDownload} />
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
