import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import './index.css';
import { useThemeStore } from './store/themeStore';

// Apply initial theme class before first render to prevent flash
const initialTheme = useThemeStore.getState().mode;
if (initialTheme === 'light') {
  document.documentElement.classList.add('light');
} else {
  document.documentElement.classList.remove('light');
}

// Keep the class in sync with store changes
useThemeStore.subscribe((state) => {
  if (state.mode === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
});

// A stale service worker breaks Vite dev (/@vite/client, /src/main.tsx, etc.)
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister();
  });
  if ('caches' in window) {
    void caches.keys().then((keys) => {
      for (const key of keys) void caches.delete(key);
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>
);
