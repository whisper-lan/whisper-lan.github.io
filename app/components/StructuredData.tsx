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
    "description": "端到端加密的局域网设备协作工具，支持系统快捷发送、二维码配对、断点续传、媒体预览、Android 通知、系统声音和桌面键鼠共享",
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
