import { SITE_CONFIG } from '@/lib/constants';

export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_CONFIG.title,
    "operatingSystem": "Windows, MacOS, Linux, Android",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "局域网设备协作工具，支持加密文件传输、二维码配对、断点续传、Android 通知、系统声音和桌面键鼠共享、Android 手机体感鼠标与键盘控制，以及独立的 DLNA 视频 App 投屏",
    "downloadUrl": SITE_CONFIG.links.releases,
    "author": {
      "@type": "Organization",
      "name": "lawnvi"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
