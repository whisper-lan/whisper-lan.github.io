import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from './components/Analytics';
import AdSense from './components/AdSense';
import StructuredData from './components/StructuredData';
import { SITE_CONFIG } from '@/lib/constants';
import { ThemeProvider } from './components/ThemeProvider';

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
    default: `${SITE_CONFIG.title} - ${SITE_CONFIG.desc}`,
    template: `%s | ${SITE_CONFIG.title}`
  },
  description: SITE_CONFIG.description,
  keywords: [
    'whisper',
    // 中文关键词
    '文件传输', '局域网传输', '跨平台传输', '无线传输', '传文件',
    // 英文关键词
    'file transfer', 'LAN transfer', 'wireless transfer', 'local network transfer'
  ],
  authors: [{ name: 'lawnvi' }],
  creator: 'lawnvi',
  publisher: 'lawnvi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Whisper - Fast & Secure LAN File Transfer Tool',
    description: 'A fast, secure and simple LAN file transfer tool supporting Windows, MacOS, Linux, Android and more platforms',
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.title,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Whisper - LAN File Transfer Tool',
      }
    ],
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whisper - Fast & Secure LAN File Transfer Tool',
    description: 'A fast, secure and simple LAN file transfer tool supporting Windows, MacOS, Linux, Android and more platforms',
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
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  // },
  verification: {
    google: 'your-google-site-verification',
  },
  category: 'Software Tools',
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
    languages: {
      'zh-CN': `${SITE_CONFIG.baseUrl}`,
      'en-US': `${SITE_CONFIG.baseUrl}`,
      'en-GB': `${SITE_CONFIG.baseUrl}`,
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
    <html lang="en" suppressHydrationWarning>
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
        <link rel="alternate" hrefLang="en-US" href={`${SITE_CONFIG.baseUrl}`} />
        <link rel="alternate" hrefLang="en-GB" href={`${SITE_CONFIG.baseUrl}`} />
        <link rel="alternate" hrefLang="zh-CN" href={`${SITE_CONFIG.baseUrl}`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_CONFIG.baseUrl} />
        <Analytics />
        <AdSense />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <StructuredData />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
