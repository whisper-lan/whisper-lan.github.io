import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'zh-CN' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

// 获取系统语言
const getSystemLanguage = (): Language => {
  // 优先使用存储的语言设置
  const savedLang = localStorage.getItem('app-language') as Language;
  if (savedLang && ['zh-CN', 'en'].includes(savedLang)) {
    return savedLang;
  }
  
  // 否则使用系统语言
  const systemLang = navigator.language;
//   const systemLang = window.navigator.language;
  return systemLang.startsWith('zh') ? 'zh-CN' : 'en';
};

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: getSystemLanguage(), // 直接使用 getSystemLanguage
      setLanguage: (language) => {
        console.log('setLanguage', language);
        if (typeof window !== 'undefined') {
          localStorage.setItem('app-language', language);
        }
        set({ language });
      }
    }),
    {
      name: 'app-language'
    }
  )
);