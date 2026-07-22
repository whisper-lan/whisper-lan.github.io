/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/hooks/useLanguage';
import { emptyDownloadInfo, fetchReleaseInfo, type DownloadInfo, type PlatformType, type ReleaseData } from '@/lib/release';

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const messages = {
  'zh-CN': {
    nav: { features: '能力', platforms: '平台', faq: '问答', source: '源码' },
    a11y: { theme: '切换亮暗主题', language: 'Switch to English', menu: '打开导航菜单' },
    hero: {
      eyebrow: '局域网 · 点对点 · 端到端加密',
      title: 'Whisper，本地直连的设备协作工具',
      desc: '随手传、放心传、断线也能传。文本、文件、声音和键鼠在可信设备之间直接流动，全程只走局域网。',
      download: '下载',
      downloadFor: '下载 {platform} 版',
      source: '查看源码',
      port: '端口',
    },
    specbar: {
      lanOnly: '仅局域网',
      noCloud: '不经云端',
      encrypted: '端到端加密',
      platforms: '5 个平台',
      oss: '开源 · MIT',
      port: '端口 :10002',
    },
    features: {
      title: '它能做些什么',
      subtitle: '六个核心工作流，覆盖发送、整理、通知、声音和输入协作。',
      items: {
        quickSend: { title: '系统快捷发送', description: '从 Android 分享菜单、桌面文件右键或全局快捷键直接发送，不必先打开会话。' },
        chat: { title: '媒体消息时间线', description: '图片全屏查看，音频直接播放，视频交给系统播放器；长按消息还能多选和批量删除。' },
        assistant: { title: '传输助手', description: '发送文件夹、全文搜索、收藏常用文本；剪贴板同步不写入会话，文件在粘贴时才传输。' },
        notification: { title: 'Android 通知同步', description: '选择需要监听的 Android 应用，把通知内容转发到已连接的可信设备。' },
        audio: { title: '系统声音共享', description: '把一台桌面的系统声音，分给一台或多台设备一起播放。' },
        input: { title: '键鼠共享', description: '一套键盘鼠标控制多台桌面，文本、图片和文件剪贴板跟随工作区。' },
      },
    },
    spotlight: {
      chat: {
        eyebrow: '传输 · 聊天式时间线',
        title: '像聊天一样，收发一切',
        desc: '文本和手动发送的文件落在同一条时间线里，自动同步的剪贴板不会写入会话。图片、视频和音频在接收过程中就使用对应媒体卡片，完成后可以全屏查看图片、直接播放音频或调用系统播放器打开视频。',
        points: ['图片全屏查看，音频直接播放', '视频调用系统默认播放器', '接收、校验、完成状态原位更新', '长按多选，批量清理聊天记录'],
      },
      audio: {
        eyebrow: '音频 · 多设备组播放',
        title: '一个声源，一屋子扬声器',
        desc: '把一台桌面的系统声音同时分给一组设备播放，可以指定左 / 右声道，也可以保持同步 —— 相当于在局域网里搭一个简单的声音矩阵。',
        points: ['一个声源，多端同时播放', '左 / 右声道角色分配', '基础同步，组内统一控制'],
      },
      input: {
        eyebrow: '键鼠 · 多设备工作区',
        title: '一套键鼠，走遍每块屏幕',
        desc: '把多台可信桌面加入同一个键鼠工作区，控制权和剪贴板会跟随当前设备。任意设备复制的内容都会成为工作区里最新的一份。',
        points: ['一套键鼠控制多台桌面', '最后一次复制在工作区生效', '文件在执行粘贴时按需传输'],
      },
    },
    how: {
      title: '怎么开始',
      subtitle: '四步，设备之间就能直连。',
      steps: [
        { title: '下载安装', desc: '给每台设备下载对应平台的版本并安装。' },
        { title: '启动应用', desc: '在想要协作的设备上打开 Whisper。' },
        { title: '发现或扫码', desc: '同一网络自动发现，也可以扫码带入地址和设备身份。' },
        { title: '确认并发送', desc: '双方确认同一配对码后，即可从会话或系统入口加密发送。' },
      ],
    },
    specs: {
      title: '平台支持',
      subtitle: '文本与文件传输在所有平台都能用；下表只列出各平台的差异与依赖。',
      matrix: {
        role: '形态',
        notes: '差异与依赖',
        rows: [
          { name: 'Android', role: '移动端', notes: '系统分享 · 二维码 · 通知监听 · 统一前台通知 · 音频播放', tag: '主力' },
          { name: 'macOS', role: '桌面端', notes: '系统服务 / 全局快捷发送 · 文件拖出 · Intel 原生 / Apple Silicon 经 Rosetta', tag: '完整' },
          { name: 'Windows', role: '桌面端', notes: '文件右键 / 全局快捷发送 · 完整桌面端能力', tag: '' },
          { name: 'Linux', role: '桌面端', notes: '快捷发送 · 需 Avahi / PulseAudio 或 PipeWire / GStreamer · 键鼠限 X11', tag: '' },
          { name: 'iOS', role: '移动端', notes: '仅 runner · 可侧载 · 尚未测试', tag: '实验' },
        ],
      },
      facts: {
        title: '技术规格',
        items: [
          { k: '传输', v: '局域网内直连 WebSocket' },
          { k: '加密', v: 'X25519 会话密钥 + XChaCha20-Poly1305' },
          { k: '中转', v: '不走公网中继；跨设备剪贴板可经当前控制端转发' },
          { k: '默认端口', v: ':10002（可在设置中修改）' },
          { k: '配对', v: '发现或二维码 + 双方配对码确认' },
          { k: '许可', v: 'MIT 开源' },
        ],
      },
    },
    faq: {
      title: '常见问题',
      items: [
        { q: '怎么用 Whisper？', a: '让设备处在同一局域网，通过自动发现或二维码找到对方，双方确认同一配对码后即可连接。扫码不需要额外输入密码。' },
        { q: '支持哪些文件类型？', a: '所有类型都支持，也没有大小限制，注意本地剩余空间就好。' },
        { q: '传输速度怎么样？', a: '实际速度取决于 Wi-Fi 信号、终端性能和磁盘速度。加密与 SHA-256 校验采用流式处理，正常完成时不会再把整个大文件读取一遍。' },
        { q: '数据安全吗？', a: '配对后的业务数据使用端到端加密，界面会显示设备身份与可信状态；局域网连接元数据和本地暂存文件不做隐藏或静态加密。' },
        { q: '能直接预览收到的媒体吗？', a: '可以。图片支持全屏查看，音频支持直接播放，视频和其他文件交给系统可用应用打开。' },
        { q: '支持断点续传吗？', a: '支持。大文件断线重连后能接着传。' },
        { q: '能共享系统声音吗？', a: '桌面端可以。Linux 需要 PulseAudio 或 PipeWire Pulse 兼容层。' },
        { q: '电脑能用键鼠操作另一台桌面吗？', a: '可以。macOS、Windows、Linux 都能作为控制端或被控端，并可在工作区内共享文本、图片和文件剪贴板；Linux 目前需要 X11。' },
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
      privacy: { title: '隐私', content: 'Whisper 不提供公共云端中转；配对后的内容通过端到端加密，只在你明确连接的局域网设备之间传输。' },
      links: { source: '源代码', report: '问题反馈', sponsor: '赞助支持' },
      rights: '保留所有权利。',
    },
  },
  'en': {
    nav: { features: 'Capabilities', platforms: 'Platforms', faq: 'FAQ', source: 'Source' },
    a11y: { theme: 'Toggle light / dark theme', language: '切换到中文', menu: 'Open navigation menu' },
    hero: {
      eyebrow: 'LAN · PEER-TO-PEER · END-TO-END ENCRYPTED',
      title: 'Whisper, a direct local link for your devices.',
      desc: 'Share instantly, share confidently, and resume after a disconnect. Text, files, audio, and input move directly between trusted devices over your LAN.',
      download: 'Download',
      downloadFor: 'Download for {platform}',
      source: 'View source',
      port: 'port',
    },
    specbar: {
      lanOnly: 'LAN-ONLY',
      noCloud: 'NO CLOUD RELAY',
      encrypted: 'END-TO-END ENCRYPTED',
      platforms: '5 PLATFORMS',
      oss: 'OPEN SOURCE · MIT',
      port: 'PORT :10002',
    },
    features: {
      title: 'What it does',
      subtitle: 'Six core workflows for sending, organizing, notifications, audio, and input.',
      items: {
        quickSend: { title: 'System quick send', description: 'Send from the Android share sheet, a desktop file menu, or a global hotkey without opening a conversation.' },
        chat: { title: 'Media message timeline', description: 'View images full screen, play audio inline, open video in the system player, and batch-delete selected messages.' },
        assistant: { title: 'Transfer assistant', description: 'Send folders, search message text, and save snippets; clipboard sync stays out of conversations and transfers files on paste.' },
        notification: { title: 'Android notification sync', description: 'Choose Android apps to listen to and forward their notifications to connected trusted devices.' },
        audio: { title: 'System audio sharing', description: "Stream one desktop's system audio to another device on your LAN." },
        input: { title: 'Keyboard & mouse', description: 'Control multiple desktops with one keyboard and mouse while text, image, and file clipboard content follows the workspace.' },
      },
    },
    spotlight: {
      chat: {
        eyebrow: 'TRANSFER · CHAT TIMELINE',
        title: 'Send anything, like a chat.',
        desc: 'Text and manually sent files share one timeline, while auto-synced clipboard content stays out of conversation history. Image, video, and audio cards appear while data is still arriving; completed images open full screen, audio plays inline, and video opens in the system player.',
        points: ['Full-screen images and inline audio', 'Video opens in the system player', 'Receiving, verifying, and complete states update in place', 'Long-press, multi-select, and batch-delete records'],
      },
      audio: {
        eyebrow: 'AUDIO · MULTI-DEVICE GROUP',
        title: 'One source, a room of speakers.',
        desc: "Stream one desktop's system audio to a group of devices at once. Assign left / right channels or keep them in sync — a simple speaker matrix on your LAN.",
        points: ['One source, many devices at once', 'Left / right channel roles', 'Basic sync, controlled as a group'],
      },
      input: {
        eyebrow: 'INPUT · MULTI-DEVICE WORKSPACE',
        title: 'One keyboard and mouse, every screen.',
        desc: 'Bring trusted desktops into one input workspace. Control and clipboard content follow the active machine, and a copy made on any member becomes the latest workspace item.',
        points: ['One keyboard and mouse across desktops', 'Latest copy wins throughout the workspace', 'Files transfer only when pasted'],
      },
    },
    how: {
      title: 'How to start',
      subtitle: 'Four steps to a direct device-to-device link.',
      steps: [
        { title: 'Download & install', desc: 'Grab the build for each of your platforms.' },
        { title: 'Launch the app', desc: 'Open Whisper on the devices you want to link.' },
        { title: 'Discover or scan', desc: 'Find devices automatically or scan a QR with endpoint and identity.' },
        { title: 'Confirm & send', desc: 'Confirm the same pairing code on both devices, then send through an encrypted session.' },
      ],
    },
    specs: {
      title: 'Platform support',
      subtitle: 'Text and file transfer work everywhere — the table lists only how each platform differs and what it needs.',
      matrix: {
        role: 'Form',
        notes: 'Differences & needs',
        rows: [
          { name: 'Android', role: 'Mobile', notes: 'System share · QR pairing · notification listening · unified foreground status · audio playback', tag: 'Primary' },
          { name: 'macOS', role: 'Desktop', notes: 'System Services / global quick send · file drag-out · native Intel / Rosetta on Apple Silicon', tag: 'Full' },
          { name: 'Windows', role: 'Desktop', notes: 'File context menu / global quick send · full desktop capabilities', tag: '' },
          { name: 'Linux', role: 'Desktop', notes: 'Quick send · needs Avahi / PulseAudio or PipeWire / GStreamer · K/M requires X11', tag: '' },
          { name: 'iOS', role: 'Mobile', notes: 'Runner only · sideload .ipa · untested', tag: 'Exp.' },
        ],
      },
      facts: {
        title: 'Technical spec',
        items: [
          { k: 'Transport', v: 'Direct WebSocket over the LAN' },
          { k: 'Encryption', v: 'X25519 session keys + XChaCha20-Poly1305' },
          { k: 'Relay', v: 'No public relay; cross-device clipboard items may pass through the active controller' },
          { k: 'Default port', v: ':10002 (configurable in settings)' },
          { k: 'Pairing', v: 'Discovery or QR + matching code confirmation' },
          { k: 'License', v: 'MIT, open source' },
        ],
      },
    },
    faq: {
      title: 'FAQ',
      items: [
        { q: 'How do I use Whisper?', a: 'Put devices on the same LAN, find the other device through discovery or QR, then confirm the same pairing code on both sides. QR pairing needs no extra password.' },
        { q: 'What file types are supported?', a: 'All types, with no size limit — just keep an eye on available local storage.' },
        { q: 'How fast are transfers?', a: 'Actual speed depends on Wi-Fi signal, device performance, and disk speed. Encryption and SHA-256 verification stream with the transfer, so normal completion does not reread the entire large file.' },
        { q: 'Is the data secure?', a: 'Paired application data is end-to-end encrypted, and the UI shows identity and trust state. LAN connection metadata and local staged files are not hidden or encrypted at rest.' },
        { q: 'Can I preview received media?', a: 'Yes. Images open full screen, audio plays inline, and video or other files open through an available system app.' },
        { q: 'Can interrupted transfers resume?', a: 'Yes. Large file transfers can resume after reconnecting.' },
        { q: 'Can it share desktop audio?', a: 'Yes, on desktop. Linux needs PulseAudio or PipeWire Pulse compatibility.' },
        { q: 'Can a PC control another desktop with K/M?', a: 'Yes. macOS, Windows, and Linux can act as source or receiver and share text, image, and file clipboard content inside the workspace. Linux currently requires X11.' },
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
      privacy: { title: 'Privacy', content: 'Whisper offers no public cloud relay. Paired content is end-to-end encrypted and moves only between the LAN devices you explicitly connect.' },
      links: { source: 'Source code', report: 'Report an issue', sponsor: 'Sponsor' },
      rights: 'All rights reserved.',
    },
  },
};

// ---------------------------------------------------------------------------
// config / types
// ---------------------------------------------------------------------------
type Language = 'en' | 'zh-CN';

const GITHUB_REPO = {
  repoUrl: 'https://github.com/lawnvi/whisper',
  repoReleaseUrl: 'https://github.com/lawnvi/whisper/releases',
};

// order of the support-matrix rows in messages → platform keys
const matrixOrder: PlatformType[] = ['android', 'mac', 'windows', 'linux', 'ios'];

const PLATFORM_LABEL: Record<Exclude<PlatformType, 'unknown'>, string> = {
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
};

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
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(window.navigator.userAgent.toLowerCase()));
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
  quickSend: <><path d="M4 12h11" /><path d="m11 6 6 6-6 6" /><path d="M20 5v14" /></>,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 20.5l1.4-3.5A8.38 8.38 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />,
  assistant: <><path d="M4 5h7l2 2h7v12H4z" /><path d="m9 14 1.5 1.5L14 12" /></>,
  notification: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  audio: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a8 8 0 0 1 0 10" /></>,
  input: <><rect x="3" y="5" width="18" height="11" rx="1.5" /><path d="M8 20h8M12 16v4M7 9h.01M11 9h.01M15 9h.01M7 12.5h10" /></>,
};

const FeatureIcon = ({ k }: { k: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {featureIcons[k]}
  </svg>
);

const featureTags: Record<string, string> = {
  quickSend: 'QUICK SEND', chat: 'MEDIA', assistant: 'ASSISTANT', notification: 'ANDROID', audio: 'AUDIO', input: 'CONTROL',
};
const featureKeys = ['quickSend', 'chat', 'assistant', 'notification', 'audio', 'input'];

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

// chat-style transfer: text, clipboard, and files appear in one familiar thread
function ChatTransferDiagram() {
  const reduce = useReducedMotion();
  const bubbles = [
    { x: 62, y: 54, w: 148, h: 38, align: 'left', tag: 'TEXT', title: 'Meeting notes', sub: '' },
    { x: 238, y: 104, w: 160, h: 46, align: 'right', tag: 'FILE', title: 'whisper-setup.exe', sub: '84 MB · delivered' },
    { x: 78, y: 168, w: 158, h: 38, align: 'left', tag: 'CLIPBOARD', title: 'ssh://local-device', sub: '' },
  ];
  return (
    <DiagramFrame label="CHAT TRANSFER" meta="TEXT · FILE · CLIPBOARD" viewBox="0 0 460 240">
      <g className="mono" fontSize="9" letterSpacing="1.2">
        <text x="42" y="30" fill="var(--ink)">MACBOOK</text>
        <text x="418" y="30" textAnchor="end" fill="var(--ink)">PHONE</text>
        <line x1="104" y1="26" x2="356" y2="26" stroke="var(--line-strong)" strokeWidth={1.2} strokeDasharray="3 6" />
        {!reduce && (
          <motion.g initial={{ x: 116, y: 26 }} animate={{ x: [116, 344], y: 26 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}>
            <circle r="3.5" fill="var(--signal)" />
            <circle r="8" fill="var(--signal)" opacity="0.12" />
          </motion.g>
        )}
      </g>

      {bubbles.map((bubble, i) => (
        <motion.g
          key={bubble.title}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: i * 0.14, ease: 'easeOut' }}
        >
          <rect x={bubble.x} y={bubble.y} width={bubble.w} height={bubble.h} rx="9" fill={bubble.align === 'right' ? 'var(--signal-soft)' : 'var(--panel)'} stroke={bubble.align === 'right' ? 'var(--signal-line)' : 'var(--line-strong)'} strokeWidth={1.1} />
          <text x={bubble.x + 12} y={bubble.y + 15} className="mono" fontSize="7" letterSpacing="1.3" fill="var(--signal)">{bubble.tag}</text>
          <text x={bubble.x + 12} y={bubble.y + 29} fontSize="9.5" fontWeight="600" fill="var(--ink)">{bubble.title}</text>
          {bubble.sub && <text x={bubble.x + 12} y={bubble.y + bubble.h - 7} className="mono" fontSize="6.6" fill="var(--muted)">{bubble.sub}</text>}
          {bubble.tag === 'FILE' && (
            <g transform={`translate(${bubble.x + bubble.w - 29}, ${bubble.y + 11})`} stroke="var(--signal)" strokeWidth={1.15} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2h12l6 6v22H6z" />
              <path d="M18 2v7h6M10 17h10M10 23h12" />
            </g>
          )}
        </motion.g>
      ))}

      <g>
        <rect x="62" y="218" width="336" height="18" rx="9" fill="var(--panel)" stroke="var(--line)" strokeWidth={1.1} />
        <text x="76" y="230" className="mono" fontSize="7" fill="var(--muted)">drop files or paste text</text>
        <g transform="translate(374 220)" stroke="var(--signal)" strokeWidth={1.35} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 7h16M9 0l7 7-7 7" />
        </g>
      </g>
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
          {m.host && <text x={m.x + 12} y={screenY + 36} className="mono" fontSize="8.5" fill="var(--signal)">host · controller</text>}
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
export function HomePage({ initialLanguage = 'zh-CN', initialRelease = null }: { initialLanguage?: Language; initialRelease?: ReleaseData | null }) {
  const deviceType = useDeviceDetect();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [languageReady, setLanguageReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLanguage = languageReady ? language : initialLanguage;
  const t = messages[activeLanguage];

  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(initialRelease?.version ?? null);
  const [info, setInfo] = useState<DownloadInfo>(initialRelease?.info ?? emptyDownloadInfo());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = (m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLanguageReady(true);
    setMounted(true);
  }, []);

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
    return () => { cancelled = true; };
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
  const heroMeta = [
    version ? `v${version}` : null,
    detected && detected.available ? detected.size : null,
    `${t.hero.port} :10002`,
  ].filter(Boolean).join(' · ');

  const handleHeroDownload = () => {
    if (isMobile || !detected || !detected.available) {
      document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    download(detected.platform);
  };

  const switchLanguage = () => {
    const next: Language = activeLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    setLanguage(next);
    router.push(next === 'zh-CN' ? '/zh' : '/en');
  };

  const specbar = [t.specbar.lanOnly, t.specbar.encrypted, t.specbar.noCloud, t.specbar.platforms, t.specbar.oss];
  const themeForIcon = mounted ? resolvedTheme : 'light';
  const navLinks: [string, string][] = [['features', t.nav.features], ['platforms', t.nav.platforms], ['faq', t.nav.faq]];

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line backdrop-blur-md" style={{ backgroundColor: 'var(--paper-blur)' }}>
        <div className="content-shell flex items-center justify-between py-3.5">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-ink">whisper</span>
            <span className="mono hidden text-[0.65rem] tracking-[0.2em] text-muted-foreground sm:inline">/ LAN</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-signal">{label}</a>
            ))}
            <a href={GITHUB_REPO.repoUrl} target="_blank" rel="noopener noreferrer" className="mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-signal">{t.nav.source}</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              onClick={switchLanguage}
              className="mono h-8 rounded-md border border-line bg-panel px-2.5 text-xs text-ink transition-colors hover:border-signal hover:text-signal"
              aria-label={t.a11y.language}
            >
              {activeLanguage === 'zh-CN' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setTheme(themeForIcon === 'light' ? 'dark' : 'light')}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel text-ink transition-colors hover:border-signal hover:text-signal"
              aria-label={t.a11y.theme}
              aria-pressed={themeForIcon === 'dark'}
            >
              {themeForIcon === 'light' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36-.7-.7M6.34 6.34l-.7-.7m12.72 0-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
              )}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel text-ink transition-colors hover:border-signal hover:text-signal md:hidden"
              aria-label={t.a11y.menu}
              aria-expanded={menuOpen}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
        {/* mobile nav */}
        {menuOpen && (
          <nav className="absolute inset-x-0 top-full border-b border-line bg-panel md:hidden">
            <div className="content-shell flex flex-col py-2">
              {navLinks.map(([href, label]) => (
                <a key={href} href={`#${href}`} onClick={() => setMenuOpen(false)} className="mono border-b border-line py-3 text-sm text-ink last:border-0">{label}</a>
              ))}
              <a href={GITHUB_REPO.repoUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="mono py-3 text-sm text-ink">{t.nav.source}</a>
            </div>
          </nav>
        )}
      </header>

      <main id="top" className="content-shell">
        {/* hero */}
        <section className="grid items-center gap-12 pb-10 pt-14 sm:pb-12 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="eyebrow mb-5">{t.hero.eyebrow}</p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[1.04] text-ink [text-wrap:balance] sm:text-6xl">{t.hero.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground [text-wrap:pretty] sm:text-lg">{t.hero.desc}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleHeroDownload}
                disabled={downloading}
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-signal px-6 font-medium text-white transition-colors hover:bg-signal-bright disabled:opacity-70"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" /></svg>
                {heroDownloadLabel}
              </button>
              <a
                href={GITHUB_REPO.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-line-strong bg-panel px-6 font-medium text-ink transition-colors hover:border-signal hover:text-signal"
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
        <section id="features" className="py-16 sm:py-24">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">CAPABILITIES</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.features.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.features.subtitle}</p>
          </Reveal>
          <div className="mx-auto grid w-full max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
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

        {/* spotlight: the flagship capabilities, each with a schematic diagram */}
        <section className="space-y-16 pb-2 sm:space-y-24">
          {/* chat — diagram left, text right */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <p className="eyebrow mb-3">{t.spotlight.chat.eyebrow}</p>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.spotlight.chat.title}</h2>
              <p className="mt-4 max-w-lg leading-7 text-muted-foreground">{t.spotlight.chat.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {t.spotlight.chat.points.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="lg:order-1"><ChatTransferDiagram /></Reveal>
          </div>
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
        <section className="py-16 sm:py-24">
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
        <section id="platforms" className="py-16 sm:py-24">
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
                          <a href={GITHUB_REPO.repoReleaseUrl} target="_blank" rel="noopener noreferrer" className="mono inline-flex items-center gap-1 text-xs text-signal hover:underline">{t.download.experimental} →</a>
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
            {version && (
              <>
                {t.download.current}: v{version}
                <span className="mx-2 text-line-strong">·</span>
              </>
            )}
            <a href={GITHUB_REPO.repoReleaseUrl} target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">{t.download.changelog} →</a>
          </p>
        </section>

        {/* faq */}
        <section id="faq" className="py-16 sm:py-24">
          <Reveal className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.faq.title}</h2>
          </Reveal>
          <div className="rounded-xl border border-line bg-panel">
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
        <div className="content-shell py-14">
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
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-signal">{label}</a>
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

export default function Home() {
  return <HomePage />;
}
