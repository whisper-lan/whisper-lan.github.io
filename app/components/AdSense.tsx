'use client';

import { AD_CONFIG } from '@/lib/constants';

export default function AdSense() {
  return (
    <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.clientId}`} crossOrigin="anonymous"></script>
  );
} 