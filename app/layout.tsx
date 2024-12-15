import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from './components/Analytics';
import AdSense from './components/AdSense';
import StructuredData from './components/StructuredData';
import { SITE_CONFIG } from '@/lib/constants';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: `${SITE_CONFIG.title} - ${SITE_CONFIG.description}`,
    template: `%s | ${SITE_CONFIG.title}`
  },
  description: '一款快速、安全、简单的局域网文件传输工具，支持Windows、MacOS、Linux、Android等多平台',
  keywords: ['文件传输', '局域网传输', '跨平台传输', 'LAN传输', '文件共享'],
  authors: [{ name: 'Whisper Team' }],
  creator: 'Whisper Team',
  publisher: 'Whisper Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Whisper - 快速安全的局域网文件传输工具',
    description: '一款快速、安全、简单的局域网文件传输工具，支持Windows、MacOS、Linux、Android等多平台',
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.title,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Whisper - 局域网文件传输工具',
      }
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whisper - 快速安全的局域网文件传输工具',
    description: '一款快速、安全、简单的局域网文件传输工具，支持Windows、MacOS、Linux、Android等多平台',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#2563eb'
      }
    ]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification',
  },
  category: '工具软件',
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
    languages: {
      'zh-CN': `${SITE_CONFIG.baseUrl}/zh-CN`,
      'en': `${SITE_CONFIG.baseUrl}/en`
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta 
          httpEquiv="X-Robots-Tag" 
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" 
          key="robots"
        />
        <meta 
          name="robots" 
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" 
        />
        <link rel="canonical" href={SITE_CONFIG.baseUrl} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
        <Analytics />
        <AdSense />
      </body>
    </html>
  );
}
