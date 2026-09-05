'use client';

import { useEffect } from 'react';

export function LanguageRedirect() {
  useEffect(() => {
    const language = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    window.location.replace(`/${language}${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
