// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help',
  title: 'Whisper',
  desc: 'Encrypted LAN transfer and device collaboration',
  description: 'Whisper is an end-to-end encrypted, local-first device collaboration app with system quick send, QR pairing, resumable file transfer, media previews, Android notification forwarding, desktop audio, and keyboard/mouse sharing. 中文：Whisper 是端到端加密的局域网设备协作工具，支持系统快捷发送、二维码配对、断点续传、媒体预览、Android 通知、系统声音和键鼠共享。',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help'}`,
  links: {
    github: 'https://github.com/lawnvi/whisper',
    releases: 'https://github.com/lawnvi/whisper/releases/latest',
  }
} as const;
