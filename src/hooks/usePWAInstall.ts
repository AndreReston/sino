import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDesktopApp] = useState(
    () => !!(window as Window).dreFlowDesktop?.isDesktopApp,
  );

  useEffect(() => {
    if (isDesktopApp) {
      setIsInstalled(true);
      return;
    }

    // Register service worker in production only — it breaks Vite HMR in dev
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:' && import.meta.env.PROD) {
      const swPath = import.meta.env.BASE_URL + 'sw.js';
      // S16: Log service worker registration errors instead of silently swallowing them
      navigator.serviceWorker.register(swPath).catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if PWA is installable via native criteria
    const checkInstallable = async () => {
      try {
        // Modern Chrome/Edge checks installability
        if ('getInstalledRelatedApps' in navigator && 'BeforeInstallPromptEvent' in window) {
          const installed = await (navigator as any).getInstalledRelatedApps?.() ?? [];
          if (installed.length === 0) {
            setIsInstallable(true);
          }
        }
      } catch {
        setIsInstallable(true);
      }
    };

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Check after a short delay to allow the beforeinstallprompt to fire
    const timer = setTimeout(checkInstallable, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [isDesktopApp]);

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
        return;
      } catch {
        // fall through to manual instructions
      }
    }

    const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    const isEdge = /Edg\//.test(navigator.userAgent);
    const isChrome = /Chrome\//.test(navigator.userAgent) && !isEdge;

    let message = 'To install DreFlow:\n\n';
    if (isMac && /iPhone|iPad/.test(navigator.userAgent)) {
      message += 'Tap Share → Add to Home Screen in Safari.';
    } else if (isMac) {
      message += 'In Safari: File → Add to Dock.\nIn Chrome: ⋮ menu → Install DreFlow.';
    } else if (isEdge) {
      message += 'Click the ⊕ App available icon in the address bar, or use Settings → Apps → Install this site as an app.';
    } else if (isChrome) {
      message += 'Click the install icon in the address bar, or use ⋮ menu → Save and share → Install page as app.';
    } else {
      message += 'Use your browser menu to install this site as an app (requires HTTPS).';
    }
    message += '\n\nFor a shareable Windows .exe, build with: npm run package:win';
    alert(message);
  };

  return { isInstallable, isInstalled, installApp, isDesktopApp };
}
