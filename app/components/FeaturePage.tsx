'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Language, Messages } from '@/lib/i18n';
import type { ReleaseData } from '@/lib/release';
import { PLATFORM_LABEL } from '@/lib/downloads';
import { FEATURES, type FeatureKey } from '@/lib/features';
import { SiteFrame, type Site } from './site/SiteFrame';
import { StageFrame } from './site/Chapters';
import { FEATURE_SCENES } from './scenes/featureScenes';
import { Steps } from './site/Download';
import { Faq, Finale } from './site/Closing';
import { EASE_OUT, Icon, PlatformMark, Reveal, useReducedMotion, useStill, useStoryClock, type Platform } from './site/primitives';
import { GITHUB } from './site/links';

// A closer look at one capability: the home page's chapter for it, opened up.
// Same type, same stage and scene, same calm voice; it adds the steps, the
// details, the platform limits and the questions that only matter here.
// Phones get their own arrangement, as on the home page (DESIGN.md §3.4).

type Copy = Messages['features']['items'][FeatureKey];

const tintOf = (key: FeatureKey) => FEATURES.find((f) => f.key === key)!.tint;

function Hero({ site, copy, feature }: { site: Site; copy: Copy; feature: FeatureKey }) {
  const { t, isZh, cta, onDirectDownload } = site;
  const reduce = useReducedMotion();
  const Scene = FEATURE_SCENES[feature];
  const [r, g, b] = tintOf(feature);
  // The scene plays its story once, after the page has risen in.
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPlay(true), 700);
    return () => window.clearTimeout(timer);
  }, []);
  const clock = useStoryClock(play && !reduce);
  const still = useStill(1);
  const rise = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE_OUT },
        };

  return (
    <section className="pb-4 pt-24 sm:pt-32 lg:pb-8 lg:pt-40">
      <div className="shell-wide grid items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div data-anchor>
          <motion.h1 {...rise(0.05)}>
            {/* the short rule takes the colour of this chapter's light on the home page */}
            <span className="kicker flex items-center gap-3">
              <span className="h-[2px] w-7 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
              {copy.name}
            </span>
            <span className="display mt-4 block text-ink sm:mt-5" style={{ fontSize: 'clamp(30px, 4.4vw, 60px)' }}>
              <span className="block">{copy.title[0]}</span>
              <span className="block">{copy.title[1]}</span>
            </span>
          </motion.h1>
          <motion.p {...rise(0.18)} className={`mt-5 max-w-[34rem] text-[15px] leading-[1.75] text-muted sm:mt-6 sm:text-[17px] ${isZh ? 'break-keep' : ''}`}>
            {copy.lead}
          </motion.p>
          <motion.div {...rise(0.3)} className="mt-7 flex flex-wrap gap-3 sm:mt-9">
            <a href={cta.href} onClick={cta.direct ? onDirectDownload : undefined} className="btn btn-primary">
              <Icon name="download" className="h-[18px] w-[18px]" strokeWidth={2} />
              {cta.label}
            </a>
            <a href={`${isZh ? GITHUB.guide.zh : GITHUB.guide.en}${copy.guideAnchor}`} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              {t.features.guide}
              <Icon name="arrowUpRight" className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
        <motion.div {...rise(0.22)}>
          <StageFrame background={`radial-gradient(80% 70% at 70% 20%, rgba(${r}, ${g}, ${b}, 0.15), transparent 70%), radial-gradient(60% 60% at 10% 100%, rgba(${r}, ${g}, ${b}, 0.08), transparent 70%)`}>
            <div className="relative" style={{ aspectRatio: '680 / 540' }}>
              <div className="absolute inset-0">
                <Scene t={t} progress={reduce ? still : clock} />
              </div>
            </div>
          </StageFrame>
        </motion.div>
      </div>
    </section>
  );
}

// Phones: one list, an icon beside each line. Wider: a grid of cards.
function Highlights({ copy }: { copy: Copy }) {
  return (
    <section className="py-16 sm:py-32">
      <div className="shell">
        <Reveal>
          <h2 className="display text-ink" style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}>
            {copy.highlightsTitle}
          </h2>
        </Reveal>
        <ul className="mt-8 rounded-[24px] border border-hair bg-surface px-4 md:mt-14 md:grid md:grid-cols-2 md:gap-5 md:rounded-none md:border-0 md:bg-transparent md:px-0 lg:grid-cols-3">
          {copy.highlights.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(i % 3) * 0.05}
              className="flex gap-4 border-b border-hair py-5 last:border-0 md:block md:rounded-[28px] md:border md:border-hair md:bg-surface md:p-7 md:shadow-card md:last:border"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-hair bg-surface-2 text-ink-2 md:h-11 md:w-11">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <div className="md:mt-6">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink md:text-[19px]">{item.title}</h3>
                <p className="mt-1 text-[14px] leading-[1.7] text-muted md:mt-2 md:text-[15px]">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Platforms({ t, copy }: { t: Messages; copy: Copy }) {
  return (
    <section className="pb-16 sm:pb-32">
      <div className="shell">
        <Reveal>
          <h2 className="display text-ink" style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}>
            {t.features.platforms}
          </h2>
        </Reveal>
        <Reveal className="mt-8 rounded-[24px] border border-hair bg-surface px-4 shadow-card sm:mt-14 sm:rounded-[28px] sm:px-8">
          <ul>
            {copy.platforms.map((row) => (
              <li key={row.platform} className="flex items-start gap-4 border-b border-hair py-5 last:border-0 sm:grid sm:grid-cols-[minmax(0,13rem)_minmax(0,12rem)_minmax(0,1fr)] sm:items-center sm:gap-6 sm:py-6">
                <span className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-hair bg-surface-2 text-ink">
                    <PlatformMark platform={row.platform as Platform} className="h-5 w-5" />
                  </span>
                  <span className="hidden text-[17px] font-semibold tracking-[-0.01em] text-ink sm:inline">{PLATFORM_LABEL[row.platform as Platform]}</span>
                </span>
                <div className="min-w-0 sm:contents">
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:block">
                    <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink sm:hidden">{PLATFORM_LABEL[row.platform as Platform]}</span>
                    <span className="text-[14px] text-ink-2 sm:text-[15px]">{row.status}</span>
                  </span>
                  <p className="mt-1 text-[14px] leading-[1.65] text-muted sm:mt-0 sm:text-[15px]">{row.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

// The other feature pages, so each page leads on to the next.
function Others({ t, current }: { t: Messages; current: FeatureKey }) {
  const others = FEATURES.filter((f) => f.key !== current);
  return (
    <section className="pb-8 pt-16 sm:pb-16 sm:pt-32">
      <div className="shell">
        <Reveal>
          <h2 className="display text-ink" style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}>
            {t.features.others}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:mt-14 md:grid-cols-3 md:gap-5">
          {others.map((f, i) => {
            const copy = t.features.items[f.key];
            const [r, g, b] = f.tint;
            return (
              <Reveal key={f.key} delay={i * 0.05}>
                <a
                  href={`${t.home}/${f.slug}`}
                  className="group flex h-full items-center justify-between gap-4 rounded-[24px] border border-hair bg-surface p-5 shadow-card transition-colors hover:border-[var(--hair-2)] md:flex-col md:items-start md:rounded-[28px] md:p-7"
                >
                  <span>
                    <span className="kicker flex items-center gap-3">
                      <span className="h-[2px] w-7 rounded-full" style={{ background: `rgb(${r} ${g} ${b})` }} />
                      {copy.name}
                    </span>
                    <span className="mt-3 block text-[18px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink md:mt-4 md:text-[22px]">
                      <span className="md:block">{copy.title[0]}</span>
                      <span className="md:block">{copy.title[1]}</span>
                    </span>
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair text-ink-2 transition-transform duration-300 group-hover:translate-x-0.5 md:mt-8">
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturePage({ feature, initialLanguage, initialRelease }: { feature: FeatureKey; initialLanguage: Language; initialRelease: ReleaseData | null }) {
  const entry = FEATURES.find((f) => f.key === feature)!;
  return (
    <SiteFrame initialLanguage={initialLanguage} initialRelease={initialRelease} path={`/${entry.slug}`} title={(t) => t.features.items[feature].meta.title}>
      {(site) => {
        const { t, isZh, cta, onDirectDownload } = site;
        const copy = t.features.items[feature];
        return (
          <>
            <Hero site={site} copy={copy} feature={feature} />
            <Steps title={t.features.steps} items={copy.steps} />
            <Highlights copy={copy} />
            <Platforms t={t} copy={copy} />
            <Faq t={t} isZh={isZh} title={t.features.faq} items={copy.faq} />
            <Others t={t} current={feature} />
            <Finale t={t} ctaHref={cta.href} ctaLabel={cta.label} direct={cta.direct} onDirectDownload={onDirectDownload} />
          </>
        );
      }}
    </SiteFrame>
  );
}
