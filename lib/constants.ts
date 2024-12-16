// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || '127014.xyz',
  title: 'Whisper',
  desc: '对话式局域网文件传输软件 | A simple LAN file transfer APP',
  description: 'Simple, Fast, Free LAN file transfer tool, support multi-device, Android notification sync, support FTP server (alpha)',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || '127014.xyz'}`,
} as const;


export const AD_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-5FLBMPVCLJ',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-2913838456593044',
}