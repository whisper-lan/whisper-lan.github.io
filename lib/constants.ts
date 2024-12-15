// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'whisper.127014.xyz',
  title: 'Whisper',
  desc: '对话式局域网文件传输软件 | A simple LAN file transfer APP',
  description: '对话式局域网文件传输软件, 可转发安卓通知消息 | A simple LAN file transfer app with chat interface, support forwarding Android notification messages | Linux, Windows, MacOS, Android',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'whisper.127014.xyz'}`,
} as const;
