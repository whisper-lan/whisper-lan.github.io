// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'whisper.127014.xyz',
  title: 'Whisper',
  description: '快速、安全、简单的局域网文件传输工具',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'whisper.127014.xyz'}`,
} as const;
