export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Whisper",
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
    "description": "快速、安全、简单的局域网文件传输工具",
    "downloadUrl": "https://your-domain.com/download",
    "softwareVersion": "1.0.0",
    "fileSize": "25MB",
    "author": {
      "@type": "Organization",
      "name": "Whisper Team"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 