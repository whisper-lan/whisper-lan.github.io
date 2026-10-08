import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StructuredData from './components/StructuredData';
import { SITE_CONFIG } from '@/lib/constants';
import { ThemeProvider } from './components/ThemeProvider';
import type { Viewport } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: `${SITE_CONFIG.title} - ${SITE_CONFIG.desc}`,
    template: '%s'
  },
  description: SITE_CONFIG.description,
  keywords: [
    'whisper',
    // 中文关键词
    '文件传输', '局域网传输', '端到端加密传输', '二维码配对', '跨平台传输', '无线传输', '传文件', '视频App投屏', '安卓手机当键鼠',
    // 英文关键词
    'file transfer', 'encrypted LAN transfer', 'QR pairing', 'system quick send', 'wireless transfer', 'local transfer', 'DLNA receiver', 'Android mouse and keyboard'
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
    title: 'Whisper - Encrypted LAN transfer and device collaboration',
    description: 'Encrypted LAN file, audio, and input sharing, plus DLNA video app casting and Android phone mouse and keyboard control.',
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.title,
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whisper - Encrypted LAN transfer and device collaboration',
    description: 'Encrypted LAN file, audio, and input sharing, plus DLNA video app casting and Android phone mouse and keyboard control.',
  },
  manifest: '/manifest.json',
  category: 'Software Tools',
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
    languages: {
      'x-default': `${SITE_CONFIG.baseUrl}/`,
      'zh-CN': `${SITE_CONFIG.baseUrl}/zh`,
      'en-US': `${SITE_CONFIG.baseUrl}/en`,
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

export default async function RootLayout({
  children,
  params: paramsPromise,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang?: string }>;
}>) {
  const params = await paramsPromise;
  const currentLang = params?.lang && ['en', 'zh'].includes(params.lang) ? params.lang : 'zh';

  return (
    <html lang={currentLang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider>
          <StructuredData />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
