// 网站配置。域名是 canonical、hreflang、sitemap 和分享卡片里所有绝对地址的来源，
// 必须是线上真正能打开的那个（GitHub 仓库主页填的也是它）。
const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'whisper.127014.xyz';

export const SITE_CONFIG = {
  domain,
  title: 'Whisper',
  baseUrl: `https://${domain}`,
  links: {
    github: 'https://github.com/lawnvi/whisper',
    releases: 'https://github.com/lawnvi/whisper/releases/latest',
  }
} as const;
