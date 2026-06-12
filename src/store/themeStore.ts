import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  // S19: Validate theme value from localStorage to ensure it's 'dark' or 'light'
  const storedTheme = localStorage.getItem('sino:theme');
  const isValidTheme = storedTheme === 'dark' || storedTheme === 'light';
  const initialMode: ThemeMode = isValidTheme ? (storedTheme as ThemeMode) : 'dark';
  
  return ({
  mode: initialMode,
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
});
});
