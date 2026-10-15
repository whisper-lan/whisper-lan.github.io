'use client';
import type { Language } from '@/lib/i18n';
import type { ReleaseData } from '@/lib/release';
import { SiteFrame } from './site/SiteFrame';
import { Prologue } from './site/Prologue';
import { Chapters } from './site/Chapters';
import { Details } from './site/Details';
import { Security } from './site/Security';
import { Download, Steps } from './site/Download';
import { Faq, Finale } from './site/Closing';

export function HomePage({ initialLanguage = 'zh-CN', initialRelease = null }: { initialLanguage?: Language; initialRelease?: ReleaseData | null }) {
  return (
    <SiteFrame initialLanguage={initialLanguage} initialRelease={initialRelease} title={(t) => t.meta.title}>
      {({ t, isZh, cta, version, info, builds, detected, onDirectDownload }) => {
        const heroMeta = [version ? `v${version}` : null, t.hero.meta].filter(Boolean).join('  ·  ');
        return (
          <>
            <Prologue t={t} isZh={isZh} cta={cta} meta={heroMeta} onDirectDownload={onDirectDownload} />
            <Chapters t={t} />
            <Details t={t} />
            <Security t={t} />
            <Steps title={t.steps.title} items={t.steps.items} />
            <Download t={t} info={info} builds={builds} version={version} detected={detected} onDownload={onDirectDownload} />
            <Faq t={t} isZh={isZh} />
            <Finale t={t} ctaHref={cta.href} ctaLabel={cta.label} direct={cta.direct} onDirectDownload={onDirectDownload} />
          </>
        );
      }}
    </SiteFrame>
  );
}

export default function Home() {
  return <HomePage />;
}
