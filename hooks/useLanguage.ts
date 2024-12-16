import { create } from 'zustand';

const getDefaultLanguage = () => {
  // try {
  //   if (!window.matchMedia('undefined').matches) {
  //     let savedLanguage = localStorage.getItem('language') || 'en';
  //     if (savedLanguage === 'zh-CN') {
  //       savedLanguage = 'zh-CN';
  //     }
  //     return savedLanguage;
  //   }
  // } catch (error) {
  //   console.error('无法访问localStorage:', error);
  // }
  return 'en';
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