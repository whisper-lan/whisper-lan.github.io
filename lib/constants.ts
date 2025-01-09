// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help',
  title: 'Whisper',
  desc: 'A simple LAN file transfer APP',
  description: 'Whisper - Simple, Free and Fast LAN file transfer software. Multi-device support, Android notifications on other device, start a FTP server.',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help'}`,
} as const;


export const AD_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-5FLBMPVCLJ',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-2913838456593044',
}