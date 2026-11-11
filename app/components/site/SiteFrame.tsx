'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { messages, type Language, type Messages } from '@/lib/i18n';
import { emptyDownloadInfo, fetchReleaseInfo, localizeDownloadInfo, type DownloadInfo, type PlatformType, type ReleaseData } from '@/lib/release';
import { platformBuilds, PLATFORM_LABEL, type BuildOption } from '@/lib/downloads';
import { Nav } from './Nav';
import { SmoothScroll } from './scroll';
import { Footer } from './Closing';

// What every page of the site shares: the language switch, theme, nav, footer,
// the release data behind the download buttons, and the toast.

export type Cta = { label: string; href: string; direct: boolean };

export type Site = {
  t: Messages;
  isZh: boolean;
  // Prefix for links to the home page's sections: "" on the home page itself,
  // "/zh" or "/en" on a feature page.
  home: string;
  cta: Cta;
  version: string | null;
  info: DownloadInfo;
  builds: Partial<Record<PlatformType, BuildOption[]>>;
  detected: PlatformType;
  // URL of the build that fits this device, or null when that can't be told
  // (a Mac whose browser doesn't reveal its CPU).
  recommended: string | null;
  onDirectDownload: () => void;
};

type Arch = 'arm' | 'x86';
type UserAgentData = { getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }> };

// Which CPU a Mac has. Chromium browsers say so through client hints. Others
// may name the GPU, and an Apple M-series GPU only comes with Apple silicon.
// Safari reports "Apple GPU" either way, so there it stays unknown.
async function detectArch(): Promise<Arch | null> {
  try {
    const hints = await (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData?.getHighEntropyValues(['architecture']);
    if (hints?.architecture === 'arm' || hints?.architecture === 'x86') return hints.architecture;
  } catch {}
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return null;
    // Firefox puts the (coarsened) GPU name in RENDERER; Chromium and Safari need the extension.
    const plain = String(gl.getParameter(gl.RENDERER));
    const ext = /webkit/i.test(plain) ? gl.getExtension('WEBGL_debug_renderer_info') : null;
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : plain;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (/apple m\d/i.test(renderer)) return 'arm';
    if (/intel|amd|radeon|nvidia|geforce/i.test(renderer)) return 'x86';
  } catch {}
  return null;
}

const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState<PlatformType>('unknown');
  const [isMobile, setIsMobile] = useState(false);
  const [arch, setArch] = useState<Arch | null>(null);
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) setDeviceType('android');
    else if (/iphone|ipad|ipod/i.test(ua)) setDeviceType('ios');
    else if (ua.includes('win')) setDeviceType('windows');
    else if (ua.includes('mac')) setDeviceType('mac');
    else if (ua.includes('linux')) setDeviceType('linux');
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
    if (ua.includes('mac') && !/iphone|ipad|ipod/i.test(ua)) {
      let cancelled = false;
      detectArch().then((a) => !cancelled && setArch(a));
      return () => {
        cancelled = true;
      };
    }
  }, []);
  return { deviceType, isMobile, arch };
};

export function SiteFrame({
  initialLanguage,
  initialRelease,
  path = '',
  title,
  children,
}: {
  initialLanguage: Language;
  initialRelease: ReleaseData | null;
  // The page's address below the language, e.g. "/keyboard-mouse-sharing".
  path?: string;
  title: (t: Messages) => string;
  children: (site: Site) => ReactNode;
}) {
  const { deviceType, isMobile, arch } = useDeviceDetect();
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeLanguage = mounted ? language : initialLanguage;
  const t = messages[activeLanguage];

  const [toast, setToast] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(initialRelease?.version ?? null);
  const [rawInfo, setInfo] = useState<DownloadInfo>(initialRelease?.info ?? emptyDownloadInfo());
  const info = mounted ? localizeDownloadInfo(rawInfo, window.location.hostname) : rawInfo;
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
  const home = path ? t.home : '';
  // Elsewhere the first build is the safe pick (the notes say so); a Mac
  // build for the wrong chip is not, so without the CPU none is singled out.
  const fits = detected === 'mac' ? (arch === 'arm' ? info.macArm64.url : arch === 'x86' ? info.macX64.url : '') : detected ? (builds[detected]?.[0]?.url ?? info[detected].url) : '';
  const recommended = fits || null;
  // Browsers do not reliably expose CPU architecture or Linux distribution, so
  // platforms with several builds scroll to the download section instead.
  const directUrl = !isMobile && detected && info[detected].url && !builds[detected]?.length ? info[detected].url : null;
  const cta: Cta = {
    label: detected && detected !== 'ios' ? t.hero.downloadFor.replace('{platform}', PLATFORM_LABEL[detected]) : t.hero.download,
    href: directUrl ?? `${home}#download`,
    direct: Boolean(directUrl),
  };

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
      window.history.replaceState(null, '', `${messages[next].home}${path}${window.location.hash}`);
      document.title = title(messages[next]);
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

  const site: Site = { t, isZh, home, cta, version, info, builds, detected: deviceType, recommended, onDirectDownload };

  return (
    <div className="min-h-screen overflow-x-clip">
      <SmoothScroll />
      <Nav
        t={t}
        home={home}
        path={path}
        isZh={isZh}
        isDark={isDark}
        swapping={swapping}
        onToggleLanguage={switchLanguage}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className={`transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`}>{children(site)}</main>
      <div className={`transition-opacity duration-200 ${swapping ? 'opacity-0' : 'opacity-100'}`}>
        <Footer t={t} isZh={isZh} home={home} />
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
