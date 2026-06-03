import React from 'react';

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export default function LandingPage({ onLogin, onRegister }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="text-zinc-50 text-sm uppercase tracking-[0.35em] text-cyan-400">DesignForge</div>
            <h1 className="text-5xl font-semibold tracking-tight text-white">
              Create beautiful layouts, manage pages, and save designs like Canva.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Start with a blank canvas, save your work to your account, and pick up where you left off.
              DesignForge brings page-focused editing, export options, and a simple account workspace together.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onLogin}
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Log in
              </button>
              <button
                onClick={onRegister}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Register account
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-inner shadow-black/20">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">What you can do</div>
            <ul className="space-y-4 text-zinc-300">
              <li>• Save designs to your personal workspace</li>
              <li>• Load saved projects instantly</li>
              <li>• Export pages as PNG, JPG, or ZIP archives</li>
              <li>• Add, duplicate, and organize pages with ease</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
