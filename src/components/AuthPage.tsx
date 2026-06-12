import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Image, Film, Sparkles, LayoutGrid } from 'lucide-react';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

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
    <div className="flex min-h-screen bg-[#07070d] text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.06] blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col items-center justify-center p-14">
        {/* Inner glow accents */}
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-orange-500/[0.09] blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[8%] right-[10%] w-[280px] h-[280px] rounded-full bg-sky-500/[0.08] blur-[80px] pointer-events-none" />

        {/* Floating decorative shapes */}
        <div className="absolute top-16 right-24 w-20 h-20 rounded-2xl border border-orange-500/15 bg-orange-500/5 rotate-12" />
        <div className="absolute top-32 right-14 w-8 h-8 rounded-full border border-amber-400/20 bg-amber-400/5 rotate-6" />
        <div className="absolute bottom-24 left-14 w-14 h-14 rounded-xl border border-sky-500/15 bg-sky-500/5 -rotate-6" />
        <div className="absolute bottom-40 left-24 w-6 h-6 rounded-full border border-purple-400/20 bg-purple-400/5" />
        <div className="absolute top-[45%] right-8 w-2 h-2 rounded-full bg-orange-400/40" />
        <div className="absolute top-[35%] left-10 w-1.5 h-1.5 rounded-full bg-sky-400/40" />

        {/* Content */}
        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img
              src={LOGO_SRC}
              alt="DesignForge"
              className="w-11 h-11 rounded-xl object-cover shadow-[0_0_24px_rgba(249,115,22,0.45)]"
            />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
              DesignForge
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
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
                <div className="w-8 h-8 rounded-lg bg-panel-border border border-panel-border flex items-center justify-center text-orange-400 shrink-0">
                  {perk.icon}
                </div>
                <span className="text-sm text-theme-secondary">{perk.text}</span>
              </div>
            ))}
          </div>

          {/* Decorative gradient line */}
          <div className="mt-12 h-px w-full bg-gradient-to-r from-orange-500/30 via-purple-500/20 to-sky-500/30" />
          <p className="mt-4 text-xs text-zinc-600">
            Join thousands of designers and video creators.
          </p>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-panel-border to-transparent" />

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Back link */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-theme-muted hover:text-theme-primary transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src={LOGO_SRC}
              alt="DesignForge"
              className="w-9 h-9 rounded-xl object-cover shadow-[0_0_18px_rgba(249,115,22,0.4)]"
            />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text text-transparent">
              DesignForge
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">
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
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.3)]'
                  : 'text-theme-muted hover:text-theme-secondary hover:bg-white/[0.04]'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { onModeChange('register'); setError(''); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.3)]'
                  : 'text-theme-muted hover:text-theme-secondary hover:bg-white/[0.04]'
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
                    className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-theme-dim focus:outline-none focus:border-orange-500/50 focus:bg-panel focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
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
                  className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-theme-dim focus:outline-none focus:border-orange-500/50 focus:bg-panel focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
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
                  className="w-full bg-panel border border-panel-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-theme-dim focus:outline-none focus:border-orange-500/50 focus:bg-panel focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-semibold text-white transition-all hover:from-orange-400 hover:to-amber-400 hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-2"
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
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
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
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
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
