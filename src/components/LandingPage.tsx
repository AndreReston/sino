import React from 'react';
import {
  Layers, Palette, Download, LayoutGrid,
  MousePointer2, ArrowRight, Sparkles, PenLine,
} from 'lucide-react';

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

const FEATURES = [
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Multi-Page Projects',
    description: 'Add, duplicate, reorder, and navigate pages with a Canva-style strip. Full storyboard control.',
    accent: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Export Any Format',
    description: 'Download pages as PNG, JPG, or SVG. Batch-export selected or all pages as a ZIP archive.',
    accent: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    iconColor: 'text-sky-400',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Rich Design Tools',
    description: 'Shapes, text, images, layers, freehand drawing, alignment guides, and smart object snapping.',
    accent: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Magic Studio',
    description: 'Background removal, image fills in text, photo adjustments, and blend modes at your fingertips.',
    accent: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    iconColor: 'text-rose-400',
  },
];

export default function LandingPage({ onLogin, onRegister }: Props) {
  return (
    <div className="min-h-screen bg-[#07070a] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[5%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.03] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">DesignForge</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onRegister}
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
            <MousePointer2 className="w-3.5 h-3.5" />
            Visual design platform for creators
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white">
            Design boldly.
            <br />
            <span className="text-zinc-500">Ship fast.</span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-xl">
            A full-featured canvas editor built for speed. Multi-page projects,
            precision alignment, rich exports, and cloud saves — all in one
            seamless workspace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRegister}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-500 text-zinc-950 font-semibold text-sm hover:bg-emerald-400 transition-all hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
            >
              Start designing for free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-200 font-medium text-sm hover:border-zinc-500 hover:bg-zinc-800 transition-all"
            >
              I already have an account
            </button>
          </div>
        </div>

        {/* Hero visual — mock canvas preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-900/70 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Simulated top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Layers className="w-3 h-3" />
                  <span>DesignForge</span>
                  <span className="text-zinc-700">|</span>
                  <span>Untitled Design</span>
                </div>
              </div>
            </div>
            {/* Simulated workspace */}
            <div className="flex min-h-[340px]">
              {/* Left panel mock */}
              <div className="w-16 border-r border-white/[0.06] flex flex-col items-center py-3 gap-2 shrink-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-emerald-500/20' : 'bg-zinc-800/60'}`} />
                ))}
              </div>
              {/* Canvas area mock */}
              <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
                <div className="w-56 h-56 rounded-xl bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-6 left-5 w-28 h-3 rounded-full bg-zinc-900/80" />
                  <div className="absolute top-12 left-5 w-20 h-2 rounded-full bg-zinc-300" />
                  <div className="absolute bottom-8 right-4 w-16 h-16 rounded-lg bg-emerald-400/80" />
                  <div className="absolute bottom-8 left-4 w-12 h-12 rounded-full bg-sky-400/70" />
                </div>
              </div>
              {/* Right panel mock */}
              <div className="w-14 border-l border-white/[0.06] flex flex-col py-3 px-2 gap-2 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 rounded bg-zinc-800/60" style={{ width: `${60 + (i % 3) * 20}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-lg mx-auto">
            Purpose-built tools that stay out of your way until you need them.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} backdrop-blur-sm p-7 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]`}
            >
              <div className={`w-11 h-11 rounded-xl bg-zinc-900/80 border border-white/[0.06] flex items-center justify-center mb-5 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-10 sm:p-14 text-center">
          <PenLine className="w-8 h-8 text-emerald-400 mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to create something?
          </h2>
          <p className="mt-3 text-zinc-400 max-w-md mx-auto">
            Sign up in seconds and start designing. Your work saves automatically to your workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRegister}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-500 text-zinc-950 font-semibold text-sm hover:bg-emerald-400 transition-all hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
            >
              Create free account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 text-center text-xs text-zinc-600">
        DesignForge — Built for creators who move fast.
      </footer>
    </div>
  );
}
