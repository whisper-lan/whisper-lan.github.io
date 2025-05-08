// 网站配置
export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help',
  title: 'Whisper',
  desc: 'Chat-based LAN File & Text Transfer - Offline & Simple',
  description: 'Whisper: Securely send files and messages over your local network (LAN) with a simple chat interface. No internet needed for fast, simple. Your ideal offline file transfer and local messenger solution. (中文：Whisper Web: 通过简洁的聊天界面在您的本地网络 (LAN) 内安全地发送文件和消息。无需互联网即可在设备之间进行快速、私密的P2P共享。您理想的离线文件传输和本地通讯解决方案。)',
  baseUrl: `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'local-whisper.help'}`,
  links: {
    github: 'https://github.com/lawnvi/whisper'
  }
} as const;


export const AD_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-5FLBMPVCLJ',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-2913838456593044',
}