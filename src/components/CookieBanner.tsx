import { useState, useEffect } from 'react';
import { Cookie, X, Shield, ChevronRight } from 'lucide-react';

type CookieConsent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  accepted: boolean;
  timestamp: string;
};

const CONSENT_KEY = 'designforge_cookie_consent';

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function hasConsentedToAnalytics(): boolean {
  const consent = getCookieConsent();
  return consent?.accepted === true && consent.analytics === true;
}

export function hasConsentedToMarketing(): boolean {
  const consent = getCookieConsent();
  return consent?.accepted === true && consent.marketing === true;
}

export function saveCookieConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // ignore
  }
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const rejectAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics,
      marketing,
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    saveCookieConsent(consent);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border border-panel-border bg-panel/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] p-5 animate-slide-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">We value your privacy</h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. Essential cookies are always enabled. You can manage your preferences or read our <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">Privacy Policy</a> and <a href="/cookie-policy" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">Cookie Policy</a>.
                  </p>
                </div>
                <button
                  onClick={rejectAll}
                  className="shrink-0 text-theme-dim hover:text-theme-primary transition-colors"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 rounded-lg border border-panel-border text-xs text-theme-secondary hover:text-theme-primary hover:border-panel-hover transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 rounded-lg border border-panel-border text-xs text-theme-secondary hover:text-theme-primary hover:border-panel-hover transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" /> Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas-surface/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-panel-border shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Cookie Preferences</h3>
              <button onClick={() => setShowPreferences(false)} className="text-theme-dim hover:text-theme-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Essential — always on, disabled */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-panel border border-panel-border">
                <div>
                  <p className="text-sm font-medium text-white">Essential</p>
                  <p className="text-xs text-theme-muted">Required for the site to function. Cannot be disabled.</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Analytics toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-panel border border-panel-border">
                <div>
                  <p className="text-sm font-medium text-white">Analytics</p>
                  <p className="text-xs text-theme-muted">Helps us understand how visitors use our site.</p>
                </div>
                <button
                  onClick={() => setAnalytics(!analytics)}
                  className={`w-10 h-5 rounded-full border transition-colors flex items-center px-0.5 ${
                    analytics ? 'bg-sky-500 border-sky-500 justify-end' : 'bg-panel-hover border-panel-border justify-start'
                  }`}
                  aria-label="Toggle analytics cookies"
                  aria-pressed={analytics}
                  role="switch"
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                </button>
              </div>

              {/* Marketing toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-panel border border-panel-border">
                <div>
                  <p className="text-sm font-medium text-white">Marketing</p>
                  <p className="text-xs text-theme-muted">Used to deliver personalized advertisements.</p>
                </div>
                <button
                  onClick={() => setMarketing(!marketing)}
                  className={`w-10 h-5 rounded-full border transition-colors flex items-center px-0.5 ${
                    marketing ? 'bg-sky-500 border-sky-500 justify-end' : 'bg-panel-hover border-panel-border justify-start'
                  }`}
                  aria-label="Toggle marketing cookies"
                  aria-pressed={marketing}
                  role="switch"
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={savePreferences}
                className="flex-1 px-4 py-2 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 rounded-lg border border-panel-border text-xs text-theme-secondary hover:text-theme-primary hover:border-panel-hover transition-colors"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
