import { create } from 'zustand';

const getDefaultLanguage = () => {
  let savedLanguage = 'en';
  savedLanguage = localStorage.getItem('language') || 'en';
  if (savedLanguage === 'zh-CN') {
    savedLanguage = 'zh-CN';
  }
  return savedLanguage;
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