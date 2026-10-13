'use client';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion as useMotionPreference, useScroll, useTransform, type MotionValue } from 'framer-motion';

// Match the server markup first, then apply the browser's motion preference.
export function useReducedMotion() {
  const preference = useMotionPreference();
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(Boolean(preference)), [preference]);
  return reduced;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Scroll progress through an element. Smoothing comes from the page scroll
// itself (see scroll.tsx), so values follow it one-to-one with no lag.
export function useScrollProgress(target: React.RefObject<HTMLElement | null>, offset: NonNullable<Parameters<typeof useScroll>[0]>['offset']) {
  return useScroll({ target, offset }).scrollYProgress;
}

// A progress value that never moves, for reduced motion.
export function useStill(value = 1): MotionValue<number> {
  return useMotionValue(value);
}

// Scroll-linked entrance: it rises in as it enters the viewport and sinks
// back out when scrolled away again, so it plays the same in both directions.
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className = '',
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref, ['start 1', 'start 0.78']);
  const start = Math.min(delay * 2.4, 0.45);
  const opacity = useTransform(progress, [start, 1], [0, 1]);
  const translate = useTransform(progress, [start, 1], [y, 0]);
  const Component = motion[as];
  return (
    <Component ref={ref as never} className={className} style={reduce ? undefined : { opacity, y: translate }}>
      {children}
    </Component>
  );
}

// The app icon's ring, as a mark. The gradient id is unique per instance.
export function RingMark({ className = 'h-6 w-6', strokeWidth = 2.4 }: { className?: string; strokeWidth?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`rm-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ring-a)" />
          <stop offset="0.5" stopColor="var(--ring-b)" />
          <stop offset="1" stopColor="var(--ring-c)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r={16 - strokeWidth} fill="none" stroke={`url(#rm-${id})`} strokeWidth={strokeWidth} />
    </svg>
  );
}

const iconPaths: Record<string, ReactNode> = {
  download: <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19.5h14" />,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowDown: <path d="M12 5v14m-5-5 5 5 5-5" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  clipboard: <><rect x="6" y="5" width="12" height="15" rx="2.5" /><path d="M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" /></>,
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />,
  file: <><path d="M7 3.5h7l4.5 4.5v12.5H7Z" /><path d="M14 3.5V8h4.5" /></>,
  photo: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4.5 4 3.5 3-2.5 4.5 4" /></>,
  wifi: <><path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.7a7.5 7.5 0 0 1 11 0M9.6 15.8a3 3 0 0 1 4.8 0" /><circle cx="12" cy="18.8" r=".6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" /></>,
  speaker: <><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4Z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  keyboard: <><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9" /></>,
  bell: <><path d="M18 9.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15.5 18 9.5" /><path d="M13.7 20.5a2 2 0 0 1-3.4 0" /></>,
  share: <><path d="M12 3.5v11M7.5 8 12 3.5 16.5 8" /><path d="M6 11.5H5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 5 20.5h14a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5h-1" /></>,
  scissors: <><path d="M4.5 4.5h4M4.5 4.5v4M19.5 4.5h-4M19.5 4.5v4M4.5 19.5h4M4.5 19.5v-4M19.5 19.5h-4M19.5 19.5v-4" /><rect x="8" y="8" width="8" height="8" rx="1" /></>,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M16 16h2v2" /></>,
  devices: <><rect x="2.5" y="5" width="13" height="10" rx="1.6" /><path d="M1.5 18h15" /><rect x="17.5" y="9" width="5" height="10" rx="1.2" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  router: <><rect x="3.5" y="13" width="17" height="6.5" rx="2" /><path d="M7 16.2h.01M10 16.2h.01M8 13l-2-6M16 13l2-6" /></>,
  code: <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5" />,
  play: <path d="M8 5.5v13l10.5-6.5Z" />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
  laptop: <><rect x="4.5" y="5" width="15" height="10.5" rx="1.5" /><path d="M2.5 18.5h19" /></>,
  phone: <><rect x="7" y="2.8" width="10" height="18.4" rx="2.4" /><path d="M10.8 18.2h2.4" /></>,
  desktop: <><rect x="3" y="4" width="18" height="12" rx="1.8" /><path d="M9 20h6M12 16v4" /></>,
};

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.7 }: { name: keyof typeof iconPaths | string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

// Platform marks: single-colour, drawn in currentColor, used on the hero ring
// and in the download section. The brand marks come from Simple Icons (CC0).
// The Mac is a laptop bearing the Apple logo, so it is never read as iOS.
export type Platform = 'mac' | 'ios' | 'windows' | 'linux' | 'android';

const APPLE = 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

const platformPaths: Record<Exclude<Platform, 'mac'>, string> = {
  ios: APPLE,
  windows: 'M0 0h11.377v11.372H0Zm12.623 0H24v11.372H12.623ZM0 12.623h11.377V24H0Zm12.623 0H24V24H12.623Z',
  android: 'M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z',
  linux: 'M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z',
};

// The marks fill their box unevenly (the Windows panes are a solid square, the
// Android head is a wide half-disc); these scales even out their visual weight.
const platformScale: Partial<Record<Platform, number>> = { windows: 0.8, android: 1.08 };

// A laptop seen from the front: the screen with the Apple logo cut out of it, on its base.
function MacGlyph() {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <mask id={`mac-${id}`}>
        <rect width="24" height="24" fill="#fff" />
        <path d={APPLE} transform="translate(12 9.6) scale(0.37) translate(-12 -12)" fill="#000" />
      </mask>
      <rect x="2" y="2.6" width="20" height="14" rx="2" mask={`url(#mac-${id})`} />
      <rect x="0.5" y="18.2" width="23" height="2.4" rx="1.2" />
    </>
  );
}

export function PlatformMark({ platform, className = 'h-7 w-7' }: { platform: Platform; className?: string }) {
  const scale = platformScale[platform];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {platform === 'mac' ? (
        <MacGlyph />
      ) : (
        <path d={platformPaths[platform]} transform={scale ? `translate(12 12) scale(${scale}) translate(-12 -12)` : undefined} />
      )}
    </svg>
  );
}
