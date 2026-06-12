import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: (localStorage.getItem('sino:theme') as ThemeMode) || 'dark',
  toggle: () =>
    set((s) => {
      const next = s.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sino:theme', next);
      return { mode: next };
    }),
  setMode: (m) => {
    localStorage.setItem('sino:theme', m);
    set({ mode: m });
  },
}));
