import { create } from 'zustand';

const getDefaultLanguage = () => {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/zh')) {
    return 'zh-CN';
  }
  return 'en';
};

export const useLanguage = create<{
  language: 'en' | 'zh-CN';
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}>((set) => ({
  language: getDefaultLanguage() as 'en' | 'zh-CN',
  setLanguage: (lang) => {
    const newPath = lang === 'zh-CN' ? '/zh' : '/en';
    window.location.href = newPath;
    set({ language: lang });
  },
}));