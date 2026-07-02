/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: 'var(--accent-emerald)',
          'green-bright': 'var(--accent-emerald-bright)',
          'green-glow': 'var(--accent-emerald-glow)',
          blue: 'var(--accent-sky)',
          'blue-bright': 'var(--accent-sky-bright)',
        },
        canvas: {
          bg: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
        },
        surface: 'var(--bg-surface)',
        panel: {
          DEFAULT: 'var(--bg-panel)',
          light: 'var(--bg-panel-light)',
          dark: 'var(--bg-panel)',
          border: 'var(--border-panel)',
          divider: 'var(--border-subtle)',
          hover: 'var(--bg-panel-hover)',
        },
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
          faint: 'var(--text-faint)',
          input: 'var(--bg-input)',
        },
        accent: {
          emerald: 'var(--accent-emerald)',
          'emerald-bright': 'var(--accent-emerald-bright)',
          'emerald-glow': 'var(--accent-emerald-glow)',
          sky: 'var(--accent-sky)',
          'sky-bright': 'var(--accent-sky-bright)',
          violet: 'var(--accent-violet)',
          'violet-bright': 'var(--accent-violet-bright)',
          'violet-muted': '#ddd6fe',
          'violet-light': '#f5f3ff',
          amber: 'var(--accent-amber)',
          'amber-bright': '#f59e0b',
          'amber-muted': '#fef3c7',
          'amber-light': '#fffbeb',
          pink: 'var(--accent-pink)',
          'pink-bright': '#ec4899',
          'pink-muted': '#fbcfe8',
          'pink-light': '#fdf2f8',
          teal: 'var(--accent-teal)',
          'teal-bright': '#14b8a6',
          'teal-muted': '#99f6e4',
          'teal-light': '#ccfbf1',
          rose: 'var(--accent-rose)',
          'rose-bright': '#f43f5e',
          'rose-muted': '#fecdd3',
          'rose-light': '#fff1f2',
        },
      },
      boxShadow: {
        'panel': 'var(--shadow-panel)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
