import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Image, Film, Sparkles, LayoutGrid, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const LOGO_SRC = '/Untitled_design_(1).png';

type AuthMode = 'login' | 'register';

type Props = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (email: string, password: string, username: string) => Promise<{ success: boolean; message: string }>;
  onBack: () => void;
};

const PERKS = [
  { icon: <LayoutGrid className="w-4 h-4" />, text: 'Multi-page canvas projects' },
  { icon: <Film className="w-4 h-4" />, text: 'CapCut-style video studio' },
  { icon: <Image className="w-4 h-4" />, text: 'Export PNG, JPG, SVG & more' },
  { icon: <Sparkles className="w-4 h-4" />, text: 'Cloud saves & auto-sync' },
];

export default function AuthPage({ mode, onModeChange, onLogin, onRegister, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { mode: themeMode, toggle } = useThemeStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await onLogin(email, password)
        : await onRegister(email, password, displayName);
      if (!result.success) setError(result.message);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-bg text-theme-primary">

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col items-center justify-center p-14 border-r border-panel-border bg-panel">
        {/* Content */}
        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src={LOGO_SRC} alt="DreFlow" className="w-11 h-11 rounded-xl object-cover" />
            <span className="text-xl font-bold tracking-tight text-orange-500 dark:text-orange-400">
              DreFlow
            </span>
          </div>

          <h2 className="text-3xl font-bold text-theme-primary mb-3 leading-tight">
            {mode === 'login'
              ? 'Welcome back, creator'
              : 'Start creating today'}
          </h2>
          <p className="text-theme-muted leading-relaxed mb-10 text-base">
            {mode === 'login'
              ? 'Your workspace, designs, and projects are waiting. Log in to pick up right where you left off.'
              : 'Create your free account and unlock the full design and video studio — no credit card required.'}
          </p>

          {/* Perks */}
          <div className="space-y-3.5">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-panel-light border border-panel-border flex items-center justify-center text-orange-500 dark:text-orange-400 shrink-0">
                  {perk.icon}
                </div>
                <span className="text-sm text-theme-secondary">{perk.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 h-px w-full bg-panel-border" />
          <p className="mt-4 text-xs text-theme-dim">
            Join thousands of designers and video creators.
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Back link */}
          <div className="flex items-center justify-between mb-10">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-theme-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </button>
            <button
              type="button"
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-panel-border bg-panel hover:bg-panel-hover text-theme-dim hover:text-theme-primary transition-colors"
              title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={LOGO_SRC} alt="DreFlow" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-lg font-bold tracking-tight text-orange-500 dark:text-orange-400">
              DreFlow
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
              {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-theme-muted">
              {mode === 'login'
                ? 'Enter your credentials to access your workspace.'
                : 'Set up your account to start designing and editing.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-panel border border-panel-border mb-8">
            <button
              type="button"
              onClick={() => { onModeChange('login'); setError(''); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-orange-500 text-white'
                  : 'text-theme-muted hover:text-theme-secondary hover:bg-panel-hover'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { onModeChange('register'); setError(''); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-orange-500 text-white'
                  : 'text-theme-muted hover:text-theme-secondary hover:bg-panel-hover'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-theme-muted mb-1.5 tracking-wide">
                  Display name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-primary placeholder-theme-dim focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1.5 tracking-wide">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-primary placeholder-theme-dim focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-primary placeholder-theme-dim focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="mt-7 text-center text-xs text-theme-dim">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { onModeChange('register'); setError(''); }}
                  className="text-orange-500 dark:text-orange-400 hover:underline transition-colors font-medium"
                >
                  Register for free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { onModeChange('login'); setError(''); }}
                  className="text-orange-500 dark:text-orange-400 hover:underline transition-colors font-medium"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
