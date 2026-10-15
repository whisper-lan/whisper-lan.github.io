import { Document } from '../components/Document';
import { rootMetadata } from '@/lib/seo';

export { viewport } from '@/lib/seo';
export const metadata = rootMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <Document lang="zh-CN">{children}</Document>;
}
