import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from './ThemeProvider';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// The <html> shell. Each language is its own root layout so the exported HTML
// carries the right lang attribute before any script runs.
export function Document({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
