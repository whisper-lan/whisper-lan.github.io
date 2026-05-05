// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help',
  title: 'Whisper',
  desc: 'LAN file transfer, audio sharing, and keyboard/mouse sharing',
  description: 'Whisper is a local-first, chat-style LAN collaboration app for sending text and files, forwarding Android notifications, sharing desktop system audio, and controlling another desktop with keyboard and mouse across macOS, Windows, Linux, and Android. 中文：Whisper 是局域网优先的跨平台设备协作工具，支持文本文件传输、Android 通知、系统声音共享和桌面键鼠共享。',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help'}`,
  links: {
    github: 'https://github.com/lawnvi/whisper'
  }
} as const;


export const AD_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-5FLBMPVCLJ',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-2913838456593044',
}
