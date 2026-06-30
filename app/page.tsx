/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const messages = {
  'zh-CN': {
    nav: { features: '能力', platforms: '平台', faq: '问答', source: '源码' },
    hero: {
      eyebrow: '局域网 · 点对点',
      title: '你的设备之间，一条本地直连',
      desc: '让文本、文件、声音和键鼠在你自己的设备之间直接流动 —— 全程只走局域网，中途不经过云。',
      download: '下载',
      downloadFor: '下载 {platform} 版',
      source: '查看源码',
      port: '端口',
    },
    specbar: {
      lanOnly: '仅局域网',
      noCloud: '不经云端',
      platforms: '5 个平台',
      oss: '开源 · MIT',
      port: '端口 :10002',
    },
    features: {
      title: '它能做些什么',
      subtitle: '一条本地通道，五类协作能力。',
      items: {
        chat: { title: '聊天式传输', description: '像聊天一样发文本、剪贴板和文件，桌面端可直接拖拽收发。' },
        resume: { title: '大文件续传', description: '大文件中途断了也能接着传，依旧只走局域网，照片、视频、安装包都合适。' },
        notification: { title: '通知同步', description: '把安卓设备的通知转发到其他设备，验证码这类短消息再也不会漏看。' },
        ftp: { title: 'FTP 服务', description: '一键开启 FTP 服务端（alpha），方便临时访问文件。' },
        audio: { title: '系统声音共享', description: '把一台桌面的系统声音，分给一台或多台设备一起播放。' },
        input: { title: '键鼠共享', description: '一套键盘鼠标，在 macOS、Windows、Linux 桌面之间来回操控。' },
      },
    },
    spotlight: {
      audio: {
        eyebrow: '音频 · 多设备组播放',
        title: '一个声源，一屋子扬声器',
        desc: '把一台桌面的系统声音同时分给一组设备播放，可以指定左 / 右声道，也可以保持同步 —— 相当于在局域网里搭一个简单的声音矩阵。',
        points: ['一个声源，多端同时播放', '左 / 右声道角色分配', '基础同步，组内统一控制'],
      },
      input: {
        eyebrow: '键鼠 · 边缘穿越',
        title: '一套键鼠，走遍每块屏幕',
        desc: '按位置把各台桌面的屏幕排好，鼠标越过屏幕边缘，控制权就交给下一台设备，键盘也跟着指针一起过去。',
        points: ['自定义屏幕排列', '鼠标边缘穿越切换设备', '键盘跟随当前控制目标'],
      },
    },
    how: {
      title: '怎么开始',
      subtitle: '四步，设备之间就能直连。',
      steps: [
        { title: '下载安装', desc: '给每台设备下载对应平台的版本并安装。' },
        { title: '启动应用', desc: '在想要协作的设备上打开 Whisper。' },
        { title: '局域网发现', desc: '同一网络下，设备会自动出现在列表里。' },
        { title: '连接共享', desc: '确认连接，就能开始传文件、共享声音和键鼠。' },
      ],
    },
    specs: {
      title: '平台支持',
      subtitle: '文本与文件传输在所有平台都能用；下表只列出各平台的差异与依赖。',
      matrix: {
        role: '形态',
        notes: '差异与依赖',
        rows: [
          { name: 'Android', role: '移动端', notes: '移动主力 · 独有通知监听 · 音频为播放端', tag: '主力' },
          { name: 'macOS', role: '桌面端', notes: '桌面端功能最完整 · 含文件拖出', tag: '完整' },
          { name: 'Windows', role: '桌面端', notes: '完整桌面端能力', tag: '' },
          { name: 'Linux', role: '桌面端', notes: '需 Avahi · PulseAudio/PipeWire · 键鼠限 X11', tag: '' },
          { name: 'iOS', role: '移动端', notes: '仅 runner · 可侧载 · 尚未测试', tag: '实验' },
        ],
      },
      facts: {
        title: '技术规格',
        items: [
          { k: '传输', v: '局域网内直连 WebSocket' },
          { k: '加密', v: '暂无端到端加密，建议在可信网络中使用' },
          { k: '中转', v: '不走公网中继，也不做 Hub 转发' },
          { k: '默认端口', v: ':10002（可在设置中修改）' },
          { k: '协议', v: '设备发现 + 连接需双方确认' },
          { k: '许可', v: 'MIT 开源' },
        ],
      },
    },
    faq: {
      title: '常见问题',
      items: [
        { q: '怎么用 Whisper？', a: '下载并安装对应平台的应用，让设备处在同一局域网，它们会自动发现并连接。' },
        { q: '支持哪些文件类型？', a: '所有类型都支持，也没有大小限制，注意本地剩余空间就好。' },
        { q: '传输速度怎么样？', a: '速度取决于局域网带宽，通常能跑满带宽，所以很快。' },
        { q: '数据安全吗？', a: '目前还没做加密，它面向的是可信局域网里你自己的设备，请不要传输敏感数据；加密能力会在后续考虑。' },
        { q: '支持断点续传吗？', a: '支持。大文件断线重连后能接着传。' },
        { q: '能共享系统声音吗？', a: '桌面端可以。Linux 需要 PulseAudio 或 PipeWire Pulse 兼容层。' },
        { q: '电脑能用键鼠操作另一台桌面吗？', a: '可以。macOS、Windows、Linux 都能作为控制端或被控端，Linux 目前需要 X11。' },
      ],
    },
    download: {
      title: '获取构建',
      subtitle: '版本和体积实时来自 GitHub Release。',
      current: '当前版本',
      changelog: '更新日志',
      starting: '下载已开始，请稍候…',
      failed: '下载失败，请稍后重试',
      notAvailable: '{platform} 版本暂未发布',
      unavailable: '暂无',
      recommended: '当前',
      experimental: 'IPA',
      iosNote: '可从 GitHub 下载 ipa',
    },
    footer: {
      tagline: '局域网优先的设备协作工具，让文件、文本、声音和键鼠像聊天一样自然地流动。',
      privacy: { title: '隐私', content: 'Whisper 不提供公共云端中转，内容只在你明确连接的局域网设备之间传输。' },
      links: { source: '源代码', report: '问题反馈', sponsor: '赞助支持' },
      rights: '保留所有权利。',
    },
  },
  'en': {
    nav: { features: 'Capabilities', platforms: 'Platforms', faq: 'FAQ', source: 'Source' },
    hero: {
      eyebrow: 'LAN · PEER-TO-PEER',
      title: 'Your devices, one local wire.',
      desc: 'Whisper moves text, files, audio, and keyboard-and-mouse straight between your own machines — over the local network, with no cloud in between.',
      download: 'Download',
      downloadFor: 'Download for {platform}',
      source: 'View source',
      port: 'port',
    },
    specbar: {
      lanOnly: 'LAN-ONLY',
      noCloud: 'NO CLOUD RELAY',
      platforms: '5 PLATFORMS',
      oss: 'OPEN SOURCE · MIT',
      port: 'PORT :10002',
    },
    features: {
      title: 'What it does',
      subtitle: 'One local channel, carrying five kinds of collaboration.',
      items: {
        chat: { title: 'Chat-style transfer', description: 'Send text, clipboard, and files in a chat-style timeline. Drag and drop on the desktop.' },
        resume: { title: 'Resumable transfers', description: 'Resume interrupted large files over the LAN — built for photos, video, and installers.' },
        notification: { title: 'Notification sync', description: 'Forward Android notifications to your other devices. Never miss a one-time code.' },
        ftp: { title: 'FTP service', description: 'Spin up a lightweight FTP server (alpha) for quick, temporary file access.' },
        audio: { title: 'System audio sharing', description: "Stream one desktop's system audio to another device on your LAN." },
        input: { title: 'Keyboard & mouse', description: 'Share one keyboard and mouse across macOS, Windows, and Linux desktops.' },
      },
    },
    spotlight: {
      audio: {
        eyebrow: 'AUDIO · MULTI-DEVICE GROUP',
        title: 'One source, a room of speakers.',
        desc: "Stream one desktop's system audio to a group of devices at once. Assign left / right channels or keep them in sync — a simple speaker matrix on your LAN.",
        points: ['One source, many devices at once', 'Left / right channel roles', 'Basic sync, controlled as a group'],
      },
      input: {
        eyebrow: 'INPUT · EDGE CROSSING',
        title: 'One keyboard and mouse, every screen.',
        desc: 'Lay out your desktops by position. Push the cursor past a screen edge and control hands off to the next machine — the keyboard follows wherever the pointer goes.',
        points: ['Custom screen arrangement', 'Cursor crosses edges to switch devices', 'Keyboard follows the active target'],
      },
    },
    how: {
      title: 'How to start',
      subtitle: 'Four steps to a direct device-to-device link.',
      steps: [
        { title: 'Download & install', desc: 'Grab the build for each of your platforms.' },
        { title: 'Launch the app', desc: 'Open Whisper on the devices you want to link.' },
        { title: 'Discover on the LAN', desc: 'Devices on the same network appear automatically.' },
        { title: 'Connect & share', desc: 'Confirm the link, then send files, audio, and input.' },
      ],
    },
    specs: {
      title: 'Platform support',
      subtitle: 'Text and file transfer work everywhere — the table lists only how each platform differs and what it needs.',
      matrix: {
        role: 'Form',
        notes: 'Differences & needs',
        rows: [
          { name: 'Android', role: 'Mobile', notes: 'Mobile hub · only one with notification listening · audio is playback-only', tag: 'Primary' },
          { name: 'macOS', role: 'Desktop', notes: 'Most complete desktop · includes file drag-out', tag: 'Full' },
          { name: 'Windows', role: 'Desktop', notes: 'Full desktop capabilities', tag: '' },
          { name: 'Linux', role: 'Desktop', notes: 'Needs Avahi · PulseAudio/PipeWire · K/M requires X11', tag: '' },
          { name: 'iOS', role: 'Mobile', notes: 'Runner only · sideload .ipa · untested', tag: 'Exp.' },
        ],
      },
      facts: {
        title: 'Technical spec',
        items: [
          { k: 'Transport', v: 'Direct WebSocket over the LAN' },
          { k: 'Encryption', v: 'Not yet end-to-end — use on trusted networks' },
          { k: 'Relay', v: 'No public relay, no hub forwarding' },
          { k: 'Default port', v: ':10002 (configurable in settings)' },
          { k: 'Protocol', v: 'Discovery + explicit connection confirm' },
          { k: 'License', v: 'MIT, open source' },
        ],
      },
    },
    faq: {
      title: 'FAQ',
      items: [
        { q: 'How do I use Whisper?', a: 'Download and install the app for your platform, run it on devices on the same network, and they discover and connect automatically.' },
        { q: 'What file types are supported?', a: 'All types, with no size limit — just keep an eye on available local storage.' },
        { q: 'How fast are transfers?', a: 'They scale with your LAN bandwidth, typically using it fully, so transfers are very fast.' },
        { q: 'Is the data secure?', a: 'Encryption is not implemented yet; it is meant for your own devices on a trusted LAN. Avoid sensitive data. Encrypted transfer may come later.' },
        { q: 'Can interrupted transfers resume?', a: 'Yes. Large file transfers can resume after reconnecting.' },
        { q: 'Can it share desktop audio?', a: 'Yes, on desktop. Linux needs PulseAudio or PipeWire Pulse compatibility.' },
        { q: 'Can a PC control another desktop with K/M?', a: 'Yes. macOS, Windows, and Linux can act as source or receiver. Linux currently requires X11.' },
      ],
    },
    download: {
      title: 'Get a build',
      subtitle: 'Version and size are pulled live from the GitHub Release.',
      current: 'Current version',
      changelog: 'Changelog',
      starting: 'Download starting, please wait…',
      failed: 'Download failed, please try again',
      notAvailable: 'The {platform} build is not available yet',
      unavailable: 'n/a',
      recommended: 'detected',
      experimental: 'IPA',
      iosNote: 'download .ipa from GitHub',
    },
    footer: {
      tagline: 'A LAN-first device collaboration tool. File, text, audio, and input that flow as easily as a chat.',
      privacy: { title: 'Privacy', content: 'Whisper offers no public cloud relay. Content moves only between the LAN devices you explicitly connect.' },
      links: { source: 'Source code', report: 'Report an issue', sponsor: 'Sponsor' },
      rights: 'All rights reserved.',
    },
  },
};

// ---------------------------------------------------------------------------
// config / types
// ---------------------------------------------------------------------------
type PlatformType = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown';

const GITHUB_REPO = {
  releaseApi: 'https://api.github.com/repos/lawnvi/whisper/releases/latest',
  repoUrl: 'https://github.com/lawnvi/whisper',
  repoReleaseUrl: 'https://github.com/lawnvi/whisper/releases',
};

const PLATFORM_FILE_SUFFIX = {
  windows: '.exe',
  mac: '.dmg',
  linux: '.deb',
  android: 'app-release.apk',
  ios: '.ipa.bak',
} as const;

// order of the support-matrix rows in messages → platform keys
const matrixOrder: PlatformType[] = ['android', 'mac', 'windows', 'linux', 'ios'];

const PLATFORM_LABEL: Record<Exclude<PlatformType, 'unknown'>, string> = {
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
};

type PlatformDownloadInfo = { url: string; size: string; version: string };
type DownloadInfo = { [key in PlatformType]: PlatformDownloadInfo };

const emptyDownloadInfo = (): DownloadInfo => ({
  windows: { url: '', size: '-', version: '' },
  mac: { url: '', size: '-', version: '' },
  linux: { url: '', size: '-', version: '' },
  android: { url: '', size: '-', version: '' },
  ios: { url: '', size: '-', version: '' },
  unknown: { url: '', size: '-', version: '' },
});

// ---------------------------------------------------------------------------
// hooks
// ---------------------------------------------------------------------------
const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState<PlatformType>('unknown');
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) setDeviceType('android');
    else if (/iphone|ipad|ipod/i.test(ua)) setDeviceType('ios');
    else if (ua.includes('win')) setDeviceType('windows');
    else if (ua.includes('mac')) setDeviceType('mac');
    else if (ua.includes('linux')) setDeviceType('linux');
  }, []);
  return deviceType;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// scroll reveal — quiet opacity + small lift, reduced-motion aware
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// icons (line, 1.6 stroke) — signal colored
// ---------------------------------------------------------------------------
const featureIcons: Record<string, ReactNode> = {
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 20.5l1.4-3.5A8.38 8.38 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />,
  resume: <><path d="M3 12a9 9 0 0 1 15.3-6.4M21 12a9 9 0 0 1-15.3 6.4" /><path d="M18 3v3.6h-3.6M6 21v-3.6h3.6" /></>,
  notification: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  ftp: <><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M4 7h16" /><path d="M9 12h6M9 16h6" /></>,
  audio: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a8 8 0 0 1 0 10" /></>,
  input: <><rect x="3" y="5" width="18" height="11" rx="1.5" /><path d="M8 20h8M12 16v4M7 9h.01M11 9h.01M15 9h.01M7 12.5h10" /></>,
};

const FeatureIcon = ({ k }: { k: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {featureIcons[k]}
  </svg>
);

const featureTags: Record<string, string> = {
  chat: 'TRANSFER', resume: 'TRANSFER', notification: 'SYNC', ftp: 'SERVER', audio: 'MEDIA', input: 'CONTROL',
};
const featureKeys = ['chat', 'audio', 'input', 'resume', 'notification', 'ftp'];

// device glyphs for the topology diagram
const deviceGlyph: Record<string, ReactNode> = {
  laptop: <><rect x="6" y="7" width="20" height="13" rx="1.5" /><path d="M3 23h26" /></>,
  phone: <><rect x="10" y="5" width="12" height="22" rx="2" /><path d="M14 23h4" /></>,
  desktop: <><rect x="5" y="6" width="22" height="14" rx="1.5" /><path d="M12 24h8M11 27h10M16 20v4" /></>,
};

// ---------------------------------------------------------------------------
// blueprint diagrams (schematic, not imagery)
// ---------------------------------------------------------------------------
function DiagramFrame({ label, meta, viewBox, children }: { label: string; meta: string; viewBox: string; children: ReactNode }) {
  return (
    <div className="ticks relative w-full overflow-hidden rounded-xl border border-line bg-panel-alt p-4 before:left-2 before:top-2 before:border-l before:border-t after:right-2 after:top-2 after:border-r after:border-t">
      <span className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-line-strong" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-line-strong" />
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className="mono text-[0.68rem] tracking-wider text-muted-foreground">{meta}</span>
      </div>
      <svg viewBox={viewBox} className="w-full" style={{ color: 'var(--signal)' }}>{children}</svg>
    </div>
  );
}

// small device box with glyph + labels, reused by all diagrams
function DeviceNode({ x, y, glyph, label, sub, size = 60 }: { x: number; y: number; glyph: string; label: string; sub?: string; size?: number }) {
  const h = size / 2;
  return (
    <g>
      <rect x={x - h} y={y - h} width={size} height={size} rx="10" fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.4} />
      <g transform={`translate(${x - 16}, ${y - 18})`} stroke="var(--signal)" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <svg width="32" height="32" viewBox="0 0 32 32">{deviceGlyph[glyph]}</svg>
      </g>
      <text x={x} y={y + h + 14} textAnchor="middle" className="mono" fontSize="10" letterSpacing="1.5" fill="var(--ink)">{label}</text>
      {sub && <text x={x} y={y + h + 26} textAnchor="middle" className="mono" fontSize="8.5" fill="var(--muted)">{sub}</text>}
    </g>
  );
}

// signature: LAN topology — your devices, wired directly, no cloud
function TopologyDiagram() {
  const reduce = useReducedMotion();
  const a = { x: 92, y: 92 }, b = { x: 360, y: 130 }, c = { x: 150, y: 290 };
  return (
    <DiagramFrame label="LOCAL NETWORK" meta="192.168.0.0/24 · :10002" viewBox="0 0 460 380">
      {/* dimmed, bypassed cloud relay — makes "no cloud" literal */}
      <g stroke="var(--line-strong)" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M300 36c-7 0-12 5-12 11 0 1 0 2 .3 3-4 1-7 4-7 8 0 5 4 8 9 8h34c5 0 9-3 9-8 0-4-3-7-7-8 0-7-6-12-13-12-2 0-4 .6-6 1.6" />
        <line x1="288" y1="30" x2="338" y2="74" />
      </g>
      <text x="313" y="92" textAnchor="middle" className="mono" fontSize="9.5" letterSpacing="1.5" fill="var(--muted)">NO RELAY</text>

      <g stroke="var(--line-strong)" strokeWidth={1.4} fill="none">
        <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} />
        <line x1={b.x} y1={b.y} x2={c.x} y2={c.y} />
      </g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--signal)" strokeWidth={1.8} fill="none" className={reduce ? '' : 'flow'} strokeDasharray="4 6" />
      {!reduce && (
        <motion.g initial={{ x: a.x, y: a.y }} animate={{ x: [a.x, b.x], y: [a.y, b.y] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}>
          <circle r="4.5" fill="var(--signal)" />
          <circle r="9" fill="var(--signal)" opacity="0.18" />
        </motion.g>
      )}
      <DeviceNode x={a.x} y={a.y} glyph="laptop" label="LAPTOP" sub="macOS" />
      <DeviceNode x={b.x} y={b.y} glyph="phone" label="PHONE" sub="Android" />
      <DeviceNode x={c.x} y={c.y} glyph="desktop" label="DESKTOP" sub="Windows" />
      <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 10} textAnchor="middle" className="mono" fontSize="9.5" fill="var(--signal)">file · audio · input</text>
    </DiagramFrame>
  );
}

// audio group: one source fans out to a group of speakers with channel roles
function AudioMatrixDiagram() {
  const reduce = useReducedMotion();
  const src = { x: 80, y: 150 };
  const outs = [
    { y: 64, role: 'CH L', sub: 'left' },
    { y: 150, role: 'CH R', sub: 'right' },
    { y: 236, role: 'SYNC', sub: 'group' },
  ];
  const outX = 372;
  return (
    <DiagramFrame label="GROUP PLAYBACK" meta="1 SOURCE → 3 OUT" viewBox="0 0 460 300">
      {/* fan-out links */}
      {outs.map((o, i) => (
        <line key={`l${i}`} x1={src.x + 32} y1={src.y} x2={outX - 30} y2={o.y} stroke="var(--signal)" strokeWidth={1.7} fill="none" className={reduce ? '' : 'flow'} strokeDasharray="4 6" />
      ))}
      {/* traveling audio ticks */}
      {!reduce && outs.map((o, i) => (
        <motion.circle key={`p${i}`} r="3.6" fill="var(--signal)"
          initial={{ x: src.x + 32, y: src.y }}
          animate={{ x: [src.x + 32, outX - 30], y: [src.y, o.y] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: i * 0.45 }} />
      ))}
      {/* source with wave glyph */}
      <DeviceNode x={src.x} y={src.y} glyph="laptop" label="SOURCE" sub="system audio" />
      {/* outputs as speaker nodes */}
      {outs.map((o, i) => (
        <g key={`o${i}`}>
          <rect x={outX - 30} y={o.y - 26} width="60" height="52" rx="9" fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.4} />
          <g transform={`translate(${outX - 13}, ${o.y - 13})`} stroke="var(--signal)" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5" /></svg>
          </g>
          <text x={outX + 44} y={o.y - 2} className="mono" fontSize="10" letterSpacing="1" fill="var(--ink)">{o.role}</text>
          <text x={outX + 44} y={o.y + 11} className="mono" fontSize="8.5" fill="var(--muted)">{o.sub}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

// keyboard & mouse: arranged screens, cursor crosses the shared edge
function KMDiagram() {
  const reduce = useReducedMotion();
  // two monitors side by side; cursor crosses A's right edge into B
  const screenY = 70, screenH = 120;
  const A = { x: 36, w: 176 };       // 36..212
  const B = { x: 248, w: 176 };      // 248..424
  const edge = 230;                   // shared crossing edge
  const path = { x1: A.x + 120, x2: B.x + 70, y: 132 };
  return (
    <DiagramFrame label="EDGE CROSSING" meta="DESKTOP A → B" viewBox="0 0 460 300">
      {/* monitors */}
      {[{ ...A, tag: 'A', host: true }, { ...B, tag: 'B', host: false }].map((m) => (
        <g key={m.tag}>
          <rect x={m.x} y={screenY} width={m.w} height={screenH} rx="6" fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.6} />
          {/* stand */}
          <path d={`M${m.x + m.w / 2 - 12} ${screenY + screenH + 14}h24M${m.x + m.w / 2} ${screenY + screenH}v14`} stroke="var(--line-strong)" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <text x={m.x + 12} y={screenY + 22} className="mono" fontSize="10" letterSpacing="1.5" fill="var(--ink)">{`DESKTOP ${m.tag}`}</text>
          {m.host && <text x={m.x + 12} y={screenY + 36} className="mono" fontSize="8.5" fill="var(--signal)">host · 控制端</text>}
        </g>
      ))}
      {/* shared edge highlight */}
      <line x1={edge} y1={screenY - 6} x2={edge} y2={screenY + screenH + 6} stroke="var(--signal)" strokeWidth={1.4} strokeDasharray="3 5" opacity="0.7" />
      <text x={edge} y={screenY - 12} textAnchor="middle" className="mono" fontSize="8.5" fill="var(--muted)">edge</text>

      {/* crossing path */}
      <line x1={path.x1} y1={path.y} x2={path.x2} y2={path.y} stroke="var(--signal)" strokeWidth={1.7} fill="none" className={reduce ? '' : 'flow'} strokeDasharray="4 6" />
      {/* cursor */}
      {!reduce ? (
        <motion.g initial={{ x: path.x1, y: path.y }} animate={{ x: [path.x1, path.x2], y: path.y }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}>
          <path d="M0 0l0 14 3.5-3.5 2.2 5 2-.9-2.1-4.8 5 .2z" fill="var(--signal)" stroke="var(--panel)" strokeWidth={0.8} />
        </motion.g>
      ) : (
        <g transform={`translate(${path.x2}, ${path.y})`}>
          <path d="M0 0l0 14 3.5-3.5 2.2 5 2-.9-2.1-4.8 5 .2z" fill="var(--signal)" stroke="var(--panel)" strokeWidth={0.8} />
        </g>
      )}

      {/* one keyboard + mouse, under host */}
      <g transform={`translate(${A.x + A.w / 2 - 34}, ${screenY + screenH + 30})`} stroke="var(--signal)" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="46" height="26" rx="3" />
        <path d="M7 8h.01M16 8h.01M25 8h.01M34 8h.01M7 14h32M14 19h18" />
        <path d="M58 2a7 7 0 0 1 7 7v8a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7zM58 3v6" />
      </g>
    </DiagramFrame>
  );
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------
export default function Home() {
  const deviceType = useDeviceDetect();
  const isMobile = useIsMobile();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const t = messages[language];

  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [version, setVersion] = useState('0.0.0');
  const [info, setInfo] = useState<DownloadInfo>(emptyDownloadInfo());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = (m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const formatSize = (bytes: number): string => {
    if (!bytes) return '-';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(GITHUB_REPO.releaseApi);
        const data = await res.json();
        setVersion(String(data.tag_name || '').replace('dev-v', '').replace('v', '') || '0.0.0');
        const next = emptyDownloadInfo();
        (data.assets || []).forEach((asset: any) => {
          const name = String(asset.name).toLowerCase();
          (Object.entries(PLATFORM_FILE_SUFFIX) as [PlatformType, string][]).forEach(([plat, suffix]) => {
            if (name.endsWith(suffix)) {
              next[plat] = { url: asset.browser_download_url, size: formatSize(asset.size), version: data.tag_name };
            }
          });
        });
        setInfo(next);
      } catch {
        /* keep placeholders; surface nothing intrusive */
      }
    })();
  }, []);

  const platforms = (['windows', 'mac', 'linux', 'android', 'ios'] as const).map((p) => ({
    platform: p,
    name: PLATFORM_LABEL[p],
    size: info[p].size,
    available: !!info[p].url,
    detected: deviceType === p,
    glyph: p === 'android' ? 'phone' : p === 'ios' ? 'phone' : p === 'mac' ? 'laptop' : p === 'linux' ? 'desktop' : 'desktop',
    experimental: p === 'ios',
  }));

  const download = (platform: PlatformType) => {
    const url = info[platform]?.url;
    if (!url) {
      showMessage(t.download.notAvailable.replace('{platform}', PLATFORM_LABEL[platform as Exclude<PlatformType, 'unknown'>] ?? platform));
      return;
    }
    setDownloading(true);
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      showMessage(t.download.starting);
      setTimeout(() => document.body.removeChild(iframe), 3000);
    } catch {
      showMessage(t.download.failed);
    } finally {
      setDownloading(false);
    }
  };

  const detected = platforms.find((p) => p.detected);
  const heroDownloadLabel =
    detected && detected.platform !== 'ios'
      ? t.hero.downloadFor.replace('{platform}', detected.name)
      : t.hero.download;
  const heroMeta = detected && detected.available
    ? `v${version} · ${detected.size} · ${t.hero.port} :10002`
    : `v${version} · ${t.hero.port} :10002`;

  const handleHeroDownload = () => {
    if (isMobile || !detected || !detected.available) {
      document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    download(detected.platform);
  };

  const specbar = [t.specbar.lanOnly, t.specbar.noCloud, t.specbar.platforms, t.specbar.oss, t.specbar.port];

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line backdrop-blur-md" style={{ backgroundColor: 'var(--paper-blur)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-ink">whisper</span>
            <span className="mono hidden text-[0.65rem] tracking-[0.2em] text-muted-foreground sm:inline">/ LAN</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {[['features', t.nav.features], ['platforms', t.nav.platforms], ['faq', t.nav.faq]].map(([href, label]) => (
              <a key={href} href={`#${href}`} className="mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-signal">{label}</a>
            ))}
            <a href={GITHUB_REPO.repoUrl} target="_blank" className="mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-signal">{t.nav.source}</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'zh-CN')}
              className="mono h-8 cursor-pointer rounded-md border border-line bg-panel px-2 text-xs text-ink outline-none transition-colors hover:border-signal"
              aria-label="Language"
            >
              <option value="zh-CN">中文</option>
              <option value="en">EN</option>
            </select>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel text-ink transition-colors hover:border-signal hover:text-signal"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36-.7-.7M6.34 6.34l-.7-.7m12.72 0-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-5">
        {/* hero */}
        <section className="grid items-center gap-12 pb-10 pt-14 sm:pb-12 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="eyebrow mb-5">{t.hero.eyebrow}</p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[1.04] text-ink sm:text-6xl">{t.hero.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{t.hero.desc}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleHeroDownload}
                disabled={downloading}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-signal px-6 font-medium text-white transition-colors hover:bg-signal-bright disabled:opacity-70"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" /></svg>
                {heroDownloadLabel}
              </button>
              <a
                href={GITHUB_REPO.repoUrl}
                target="_blank"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-line-strong bg-panel px-6 font-medium text-ink transition-colors hover:border-signal hover:text-signal"
              >
                {t.hero.source}
              </a>
            </div>
            <p className="mono mt-5 text-xs tracking-wider text-muted-foreground">{heroMeta}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <TopologyDiagram />
          </Reveal>
        </section>

        {/* spec bar — content-width rounded strip, centered under the hero */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-line bg-panel-alt px-8 py-4">
            {specbar.map((s, i) => (
              <span key={i} className="mono flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* features */}
        <section id="features" className="py-20 sm:py-28">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">CAPABILITIES</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.features.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.features.subtitle}</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key, i) => {
              const item = (t.features.items as any)[key];
              return (
                <Reveal key={key} delay={(i % 3) * 0.06} className="h-full">
                  <div className="group flex h-full flex-col rounded-xl border border-line bg-panel p-7 transition-colors hover:border-line-strong">
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-signal-soft text-signal">
                        <FeatureIcon k={key} />
                      </span>
                      <span className="mono text-[0.62rem] tracking-[0.2em] text-muted-foreground">{featureTags[key]}</span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* spotlight: the two most visual capabilities, with schematic diagrams */}
        <section className="space-y-20 pb-4 sm:space-y-28">
          {/* audio — text left, diagram right */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow mb-3">{t.spotlight.audio.eyebrow}</p>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.spotlight.audio.title}</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{t.spotlight.audio.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {t.spotlight.audio.points.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}><AudioMatrixDiagram /></Reveal>
          </div>
          {/* keyboard & mouse — diagram left, text right */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <p className="eyebrow mb-3">{t.spotlight.input.eyebrow}</p>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.spotlight.input.title}</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{t.spotlight.input.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {t.spotlight.input.points.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="lg:order-1"><KMDiagram /></Reveal>
          </div>
        </section>

        {/* how it works — a genuine sequence, so numbered */}
        <section className="py-20 sm:py-28">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">SETUP</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.how.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.how.subtitle}</p>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.how.steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="mono text-sm font-medium text-signal">{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* platforms & builds — unified matrix: each row carries its own download */}
        <section id="platforms" className="py-20 sm:py-28">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">PLATFORMS &amp; BUILDS</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.specs.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.specs.subtitle}</p>
          </Reveal>
          {/* unified platform table — full width, each row carries its own build */}
          <Reveal className="overflow-hidden rounded-xl border border-line bg-panel">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-panel-alt">
                  <th className="mono px-6 py-3.5 text-[0.68rem] tracking-wider text-muted-foreground">PLATFORM</th>
                  <th className="mono px-6 py-3.5 text-[0.68rem] tracking-wider text-muted-foreground">{t.specs.matrix.role}</th>
                  <th className="mono hidden px-6 py-3.5 text-[0.68rem] tracking-wider text-muted-foreground sm:table-cell">{t.specs.matrix.notes}</th>
                  <th className="mono px-6 py-3.5 text-right text-[0.68rem] tracking-wider text-muted-foreground">BUILD</th>
                </tr>
              </thead>
              <tbody>
                {t.specs.matrix.rows.map((row, i) => {
                  const key = matrixOrder[i];
                  const avail = !!info[key].url;
                  const exp = key === 'ios';
                  const detected = deviceType === key;
                  return (
                    <tr key={i} className={`border-b border-line last:border-0 ${detected ? 'bg-signal-soft' : ''}`}>
                      <td className="whitespace-nowrap px-6 py-4 align-top">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm font-semibold text-ink">{row.name}</span>
                          {detected && <span className="mono rounded border border-signal-line bg-signal-soft px-1.5 py-0.5 text-[0.58rem] tracking-wider text-signal">{t.download.recommended}</span>}
                          {!detected && row.tag && <span className="mono rounded border border-line px-1.5 py-0.5 text-[0.58rem] tracking-wider text-muted-foreground">{row.tag}</span>}
                        </span>
                      </td>
                      <td className="mono whitespace-nowrap px-6 py-4 align-top text-xs text-muted-foreground">{row.role}</td>
                      <td className="hidden px-6 py-4 align-top text-sm leading-6 text-muted-foreground sm:table-cell">{row.notes}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right align-top">
                        {avail ? (
                          <button
                            onClick={() => download(key)}
                            disabled={downloading}
                            className="mono inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-panel px-3 py-1.5 text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-60"
                          >
                            {info[key].size}
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" /></svg>
                          </button>
                        ) : exp ? (
                          <a href={GITHUB_REPO.repoReleaseUrl} target="_blank" className="mono inline-flex items-center gap-1 text-xs text-signal hover:underline">{t.download.experimental} →</a>
                        ) : (
                          <span className="mono text-xs text-muted-foreground">{t.download.unavailable}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>

          {/* technical spec — roomy grid below the table */}
          <Reveal delay={0.08} className="mt-6 rounded-xl border border-line bg-panel p-7">
            <h3 className="mono mb-5 text-[0.7rem] tracking-[0.2em] text-muted-foreground">{t.specs.facts.title.toUpperCase()}</h3>
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {t.specs.facts.items.map((f, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <dt className="mono text-[0.7rem] tracking-wider text-signal">{f.k}</dt>
                  <dd className="text-sm leading-6 text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <p className="mono mt-6 px-1 text-xs tracking-wider text-muted-foreground">
            {t.download.current}: v{version}
            <span className="mx-2 text-line-strong">·</span>
            <a href={GITHUB_REPO.repoReleaseUrl} target="_blank" className="text-signal hover:underline">{t.download.changelog} →</a>
          </p>
        </section>

        {/* faq */}
        <section id="faq" className="py-20 sm:py-28">
          <Reveal className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.faq.title}</h2>
          </Reveal>
          <div className="rounded-xl border border-line">
            {t.faq.items.map((item, i) => (
              <details key={i} className="group border-b border-line last:border-0 open:bg-panel-alt">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-ink marker:hidden">
                  <span className="font-display text-[0.95rem] font-medium">{item.q}</span>
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-line bg-panel-alt">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <span className="font-display text-lg font-bold text-ink">whisper</span>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{t.footer.tagline}</p>
            </div>
            <div>
              <h3 className="mono mb-3 text-[0.68rem] tracking-[0.2em] text-muted-foreground">{t.footer.privacy.title.toUpperCase()}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{t.footer.privacy.content}</p>
            </div>
            <div>
              <h3 className="mono mb-3 text-[0.68rem] tracking-[0.2em] text-muted-foreground">LINKS</h3>
              <ul className="space-y-2 text-sm">
                {[[GITHUB_REPO.repoUrl, t.footer.links.source], [`${GITHUB_REPO.repoUrl}/issues`, t.footer.links.report], [`${GITHUB_REPO.repoUrl}/sponsors`, t.footer.links.sponsor]].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} target="_blank" className="text-muted-foreground transition-colors hover:text-signal">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="mono text-xs text-muted-foreground">© {new Date().getFullYear()} whisper · MIT</p>
            <p className="mono text-[0.7rem] tracking-wider text-muted-foreground">LAN-FIRST · NO CLOUD RELAY</p>
          </div>
        </div>
      </footer>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mono fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-line-strong bg-ink px-5 py-3 text-sm text-paper shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
