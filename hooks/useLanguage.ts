import { create } from 'zustand';

const getDefaultLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en'; // 服务器端默认返回英文
  }

  const pathname = window.location.pathname;
  if (pathname.startsWith('/zh')) {
    return 'zh-CN';
  }
  return 'en';
};

// 仅保存语言状态；路由跳转由页面组件通过 next/navigation 完成（SPA 跳转，不整页刷新）
export const useLanguage = create<{
  language: 'en' | 'zh-CN';
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}>((set) => ({
  language: getDefaultLanguage() as 'en' | 'zh-CN',
  setLanguage: (lang) => set({ language: lang }),
}));
