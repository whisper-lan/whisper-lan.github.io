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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "description": "局域网优先的跨平台设备协作工具，支持文件传输、Android 通知、系统声音共享和桌面键鼠共享",
    "downloadUrl": `${SITE_CONFIG.baseUrl}/download`,
    "softwareVersion": "0.0.29",
    "fileSize": "25MB",
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
