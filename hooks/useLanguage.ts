import { create } from 'zustand';

const getDefaultLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || navigator.language || 'zh-CN';
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
    try {
      localStorage.setItem('language', lang);
    } catch {
      console.error('Failed to set language in localStorage');
    }
    set({ language: lang });
  },
}));