'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { messages, type Language } from '@/lib/i18n';
import { emptyDownloadInfo, fetchReleaseInfo, type DownloadInfo, type PlatformType, type ReleaseData } from '@/lib/release';
import { platformBuilds, PLATFORM_LABEL } from '@/lib/downloads';
import { Nav } from './site/Nav';
import { Prologue, type HeroCta } from './site/Prologue';
import { SmoothScroll } from './site/scroll';
import { Chapters } from './site/Chapters';
import { Details } from './site/Details';
import { Security } from './site/Security';
import { Download, Steps } from './site/Download';
import { Faq, Finale, Footer } from './site/Closing';

const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState<PlatformType>('unknown');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) setDeviceType('android');
    else if (/iphone|ipad|ipod/i.test(ua)) setDeviceType('ios');
    else if (ua.includes('win')) setDeviceType('windows');
    else if (ua.includes('mac')) setDeviceType('mac');
    else if (ua.includes('linux')) setDeviceType('linux');
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
  }, []);
  return { deviceType, isMobile };
};

export function HomePage({ initialLanguage = 'zh-CN', initialRelease = null }: { initialLanguage?: Language; initialRelease?: ReleaseData | null }) {
  const { deviceType, isMobile } = useDeviceDetect();
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeLanguage = mounted ? language : initialLanguage;
  const t = messages[activeLanguage];

  const [toast, setToast] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(initialRelease?.version ?? null);
  const [info, setInfo] = useState<DownloadInfo>(initialRelease?.info ?? emptyDownloadInfo());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = (m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => setMounted(true), []);

  // Next retains the root layout during client navigation between languages.
  useEffect(() => {
    document.documentElement.lang = activeLanguage === 'zh-CN' ? 'zh-CN' : 'en';
  }, [activeLanguage]);

  // Refresh build-time release data because Cloudflare Pages serves prerendered
  // routes without ISR regeneration.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const release = await fetchReleaseInfo();
      if (release && !cancelled) {
        setVersion(release.version);
        setInfo(release.info);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const builds = platformBuilds(info, t);
  const detected = deviceType === 'unknown' ? null : deviceType;
  // Browsers do not reliably expose CPU architecture or Linux distribution, so
  // platforms with several builds scroll to the download section instead.
  const directUrl = !isMobile && detected && info[detected].url && !builds[detected]?.length ? info[detected].url : null;
  const heroCta: HeroCta = {
    label: detected && detected !== 'ios' ? t.hero.downloadFor.replace('{platform}', PLATFORM_LABEL[detected]) : t.hero.download,
    href: directUrl ?? '#download',
    direct: Boolean(directUrl),
  };
  const heroMeta = [version ? `v${version}` : null, t.hero.meta].filter(Boolean).join('  ·  ');

  const isDark = mounted && resolvedTheme === 'dark';
  const isZh = activeLanguage === 'zh-CN';
  const onDirectDownload = () => showMessage(t.download.starting);
  // Switching language changes the words in place. A route change would rebuild
  // the page and replay its opening, so only the address is replaced. The
  // content fades out, swaps while unseen (keeping the block being read where
  // it was, as text lengths differ), and fades back in. Blocks marked
  // `data-anchor` are finer anchors than whole sections.
  const [swapping, setSwapping] = useState(false);
  const pending = useRef<{ el: Element | null; top: number } | null>(null);
  const switchLanguage = () => {
    if (swapping) return;
    const next: Language = activeLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    setSwapping(true);
    window.setTimeout(() => {
      const mid = window.innerHeight / 2;
      const el = [...document.querySelectorAll('[data-anchor], main section, footer')]
        .filter((s) => {
          const r = s.getBoundingClientRect();
          return r.top <= mid && r.bottom > mid;
        })
        .sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0];
      pending.current = { el: el ?? null, top: el ? el.getBoundingClientRect().top : 0 };
      setLanguage(next);
      window.history.replaceState(null, '', `${next === 'zh-CN' ? '/zh' : '/en'}${window.location.hash}`);
      document.title = messages[next].meta.title;
    }, 180);
  };
  useLayoutEffect(() => {
    const a = pending.current;
    if (!a) return;
    pending.current = null;
    const drift = a.el ? a.el.getBoundingClientRect().top - a.top : 0;
    if (Math.abs(drift) > 1) window.scrollTo({ top: window.scrollY + drift, behavior: 'instant' });
    requestAnimationFrame(() => setSwapping(false));
  }, [activeLanguage]);

  return (
    <div className="min-h-screen overflow-x-clip">
      <SmoothScroll />
      <Nav
        t={t}
        isZh={isZh}
        isDark={isDark}
        swapping={swapping}
        onToggleLanguage={switchLanguage}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className={`transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`}>
        <Prologue t={t} isZh={isZh} cta={heroCta} meta={heroMeta} onDirectDownload={onDirectDownload} />
        <Chapters t={t} />
        <Details t={t} />
        <Security t={t} />
        <Steps t={t} />
        <Download t={t} info={info} builds={builds} version={version} detected={deviceType} onDownload={onDirectDownload} />
        <Faq t={t} isZh={isZh} />
        <Finale t={t} ctaHref={heroCta.href} ctaLabel={heroCta.label} direct={heroCta.direct} onDirectDownload={onDirectDownload} />
      </main>
      <div className={`transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`}>
        <Footer t={t} isZh={isZh} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{ x: '-50%' }}
            className="glass fixed bottom-6 left-1/2 z-[70] rounded-full border border-hair px-5 py-2.5 text-[14px] text-ink shadow-float"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return <HomePage />;
}
