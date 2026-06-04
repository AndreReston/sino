import React, { useState } from 'react';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-zinc-400 hover:text-white"
        >
          ← Back to landing
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login'
              ? 'Log in to access your saved designs.'
              : 'Register a new account and save your work securely.'}
          </p>
        </div>

        <div className="flex gap-2 rounded-full bg-slate-950/80 p-1 text-xs text-zinc-400">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`flex-1 rounded-full px-3 py-2 transition ${mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'hover:bg-white/10'}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => onModeChange('register')}
            className={`flex-1 rounded-full px-3 py-2 transition ${mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'hover:bg-white/10'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block text-sm text-zinc-300">
              Display Name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field mt-2 w-full"
                placeholder="Your name"
              />
            </label>
          )}
          <label className="block text-sm text-zinc-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-2 w-full"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input-field mt-2 w-full"
              placeholder="Min. 6 characters"
              required
              minLength={6}
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
