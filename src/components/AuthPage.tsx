import React, { useState } from 'react';
import { Layers, ArrowLeft, Mail, Lock, User } from 'lucide-react';

type AuthMode = 'login' | 'register';

type Props = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (email: string, password: string, username: string) => Promise<{ success: boolean; message: string }>;
  onBack: () => void;
};

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
      let result;
      if (mode === 'login') {
        result = await onLogin(email, password);
      } else {
        result = await onRegister(email, password, displayName);
      }

      if (!result.success) {
        setError(result.message);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#07070a]">
      {/* Left side — decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.06] via-[#07070a] to-sky-500/[0.04] flex-col items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.06] blur-[100px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-sky-500/[0.05] blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
            <Layers className="w-7 h-7 text-emerald-400" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {mode === 'login' ? 'Welcome back to DesignForge' : 'Join DesignForge'}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            {mode === 'login'
              ? 'Your workspace, designs, and pages are waiting. Log in to pick up right where you left off.'
              : 'Create your account and start designing. Save projects, export work, and build your portfolio.'}
          </p>
        </div>

        {/* Decorative floating shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 rounded-xl border border-emerald-500/10 bg-emerald-500/5 rotate-12 animate-pulse" />
        <div className="absolute bottom-32 left-16 w-12 h-12 rounded-full border border-sky-500/10 bg-sky-500/5" />
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Back link */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back home
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">DesignForge</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Log in' : 'Create account'}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {mode === 'login'
                ? 'Enter your credentials to access your workspace.'
                : 'Set up your account to start designing.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-8">
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="input-field w-full pl-10"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-600">
            {mode === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => onModeChange('register')} className="text-emerald-400 hover:text-emerald-300 transition-colors">Register</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => onModeChange('login')} className="text-emerald-400 hover:text-emerald-300 transition-colors">Log in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
