import { create } from 'zustand';

type ThemeStore = {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
};

export const useTheme = create<ThemeStore>((set) => ({
    theme: typeof window !== 'undefined'
        ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        : 'light',
    setTheme: (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        set({ theme });
    },
})); 