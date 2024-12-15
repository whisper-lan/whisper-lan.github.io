import { create } from 'zustand';

const getDefaultLanguage = () => {
  if (typeof window === 'undefined') {
    return 'zh-CN'; // 服务端默认语言
  }
  
  try {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'zh-CN';
  } catch {
    return 'zh-CN';
  }
};

export const useLanguage = create<{
  language: 'en' | 'zh-CN';
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}>((set) => ({
  language: getDefaultLanguage() as 'en' | 'zh-CN',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    set({ language: lang });
  },
}));