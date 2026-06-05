/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#22c55e',
          'green-bright': '#4ade80',
          'green-glow': '#16a34a',
          blue: '#38bdf8',
          'blue-bright': '#7dd3fc',
        },
        canvas: {
          bg: '#07070a',
          surface: '#111111',
        },
        panel: {
          DEFAULT: '#18181b',
          light: '#27272a',
          border: '#3f3f46',
          hover: '#2d2d30',
        },
      },
      boxShadow: {
        'neon-green': '0 0 12px rgba(34, 197, 94, 0.4)',
        'neon-blue': '0 0 12px rgba(56, 189, 248, 0.4)',
        'panel': '4px 0 16px rgba(0, 0, 0, 0.6)',
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
