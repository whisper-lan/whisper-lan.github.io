// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help',
  title: 'Whisper',
  desc: 'Encrypted LAN transfer and device collaboration',
  description: 'Whisper connects your devices over the LAN: encrypted file transfers, audio sharing, desktop input sharing, and Android phone mouse and keyboard control. Also receive video app casts via DLNA. 中文：Whisper 支持局域网加密传文件、声音与桌面键鼠共享、Android 手机当键鼠，以及独立的 DLNA 视频 App 投屏。',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help'}`,
  links: {
    github: 'https://github.com/lawnvi/whisper',
    releases: 'https://github.com/lawnvi/whisper/releases/latest',
  }
} as const;
