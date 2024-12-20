import { create } from 'zustand';

type ThemeStore = {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
};

export const useTheme = create<ThemeStore>((set) => ({
    theme: typeof window !== 'undefined' ?
        (localStorage.getItem('theme') as 'light' | 'dark' || 'light') :
        'light',
    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
    },
})); 