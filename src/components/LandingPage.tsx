import {
  Download, LayoutGrid, Sun, Moon,
  MousePointer2, ArrowRight, Sparkles, Monitor,
  Film, Image, Palette,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useThemeStore } from '../store/themeStore';

const LOGO_SRC = '/Untitled_design_(1).png';

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

const FEATURES = [
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Multi-Page Projects',
    description: 'Add, duplicate, reorder, and navigate pages with a Canva-style strip. Full storyboard control.',
    accent: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    iconColor: 'text-sky-400',
    glow: 'rgba(56,189,248,0.15)',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Export Any Format',
    description: 'Download pages as PNG, JPG, or SVG. Batch-export selected or all pages as a ZIP archive.',
    accent: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    iconColor: 'text-orange-400',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Rich Design Tools',
    description: 'Shapes, text, images, layers, freehand drawing, alignment guides, and smart object snapping.',
    accent: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    iconColor: 'text-purple-400',
    glow: 'rgba(168,85,247,0.15)',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Video Studio',
    description: 'Timeline editing, transitions, text overlays, audio tracks, and direct video export — all in browser.',
    accent: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
    glow: 'rgba(251,191,36,0.15)',
  },
];

function InstallButton({ className = '' }: { className?: string }) {
  const { isInstallable, isInstalled, installApp, isDesktopApp } = usePWAInstall();

  if (isDesktopApp || isInstalled) {
    return (
      <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-panel-hover text-theme-dim text-sm font-medium ${className}`}>
        <Monitor className="w-4 h-4" />
        {isDesktopApp ? 'Desktop App' : 'Installed'}
      </span>
    );
  }

  return (
    <button
      onClick={installApp}
      title={isInstallable ? 'Install as app' : 'Add to Home Screen / Install from browser menu'}
      className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 font-semibold text-sm hover:bg-sky-500/20 hover:border-sky-500/60 transition-all hover:shadow-[0_4px_20px_rgba(56,189,248,0.2)] ${className}`}
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  );
}

export default function LandingPage({ onLogin, onRegister }: Props) {
  const { mode, toggle } = useThemeStore();
  return (
    <div className="min-h-screen bg-[#07070d] text-white overflow-x-hidden">
      {/* Ambient neon glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-5%] w-[700px] h-[700px] rounded-full bg-orange-500/[0.06] blur-[140px]" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.05] blur-[120px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="DreFlow"
            className="w-9 h-9 rounded-xl object-cover shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
            DreFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <InstallButton className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-panel-border bg-panel hover:bg-panel-hover text-theme-dim hover:text-theme-primary transition-colors"
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onRegister}
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 transition-all shadow-[0_0_24px_rgba(249,115,22,0.35)] hover:shadow-[0_0_32px_rgba(249,115,22,0.5)]"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-28">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-300 text-xs font-semibold tracking-wide">

            <MousePointer2 className="w-3.5 h-3.5" />
            Visual design &amp; video platform for creators
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06]">
            <span className="text-white">Create without</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
              limits.
            </span>
          </h1>
          <p className="mt-6 text-lg text-theme-muted leading-relaxed max-w-xl mx-auto">
            A full-featured canvas editor and video studio built for speed. Design graphics, edit videos,
            and export anywhere — all in one seamless workspace.
          </p>

        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <button
            onClick={onRegister}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-400 hover:to-amber-400 transition-all shadow-[0_8px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_48px_rgba(249,115,22,0.5)] hover:-translate-y-0.5"
          >
            Start designing for free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-panel-border bg-panel text-theme-secondary font-medium text-sm hover:border-panel-hover hover:bg-panel-hover transition-all backdrop-blur-sm"
          >
            Sign in to my account
          </button>
        </div>

        {/* Hero visual — app preview mockup */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-transparent to-transparent z-10 pointer-events-none" />
          {/* Glow behind the card */}
          <div className="absolute inset-x-[15%] top-4 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent blur-sm" />
          <div
            className="relative rounded-2xl border border-white/[0.07] overflow-hidden"
            style={{ boxShadow: '0 40px 120px -20px rgba(0,0,0,0.9), 0 0 60px rgba(249,115,22,0.06), 0 0 60px rgba(56,189,248,0.04)' }}
          >
            {/* Simulated top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-panel-border bg-panel">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-theme-dim" />
                <div className="w-2.5 h-2.5 rounded-full bg-theme-dim" />
                <div className="w-2.5 h-2.5 rounded-full bg-theme-dim" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-theme-dim">
                  <img src={LOGO_SRC} alt="" className="w-4 h-4 rounded object-cover" />
                  <span className="text-theme-secondary font-medium">DreFlow</span>
                  <span className="text-theme-dim">|</span>
                  <span>Untitled Design</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-md bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/25 text-[10px] text-orange-300 font-medium">Export</div>
              </div>
            </div>
            {/* Simulated workspace */}
            <div className="flex min-h-[300px] bg-canvas-surface">
              {/* Left tools panel */}
              <div className="w-14 border-r border-panel-border flex flex-col items-center py-4 gap-2.5 shrink-0 bg-panel">
                {[
                  { color: 'bg-orange-500/20 border-orange-500/30 text-orange-400' },
                  { color: 'bg-panel-hover border-transparent text-theme-dim' },
                  { color: 'bg-panel-hover border-transparent text-theme-dim' },
                  { color: 'bg-panel-hover border-transparent text-theme-dim' },
                  { color: 'bg-panel-hover border-transparent text-theme-dim' },
                  { color: 'bg-panel-hover border-transparent text-theme-dim' },
                ].map((item, i) => (
                  <div key={i} className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <div className="w-3 h-3 rounded-sm bg-current opacity-60" />
                  </div>
                ))}
              </div>
              {/* Canvas area */}
              <div className="flex-1 flex items-center justify-center p-10 relative">
                {/* Grid dots */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                {/* Mock design card */}
                <div className="relative w-52 h-52 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-white/[0.08]">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/10 to-sky-500/20" />
                  <div className="absolute top-7 left-5 w-28 h-3 rounded-full bg-white/80" />
                  <div className="absolute top-14 left-5 w-18 h-2 rounded-full bg-white/30" style={{ width: '72px' }} />
                  <div className="absolute bottom-7 right-5 w-14 h-14 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }} />
                  <div className="absolute bottom-7 left-5 w-10 h-10 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }} />
                  {/* Selection handle */}
                  <div className="absolute bottom-7 right-5 w-14 h-14 rounded-xl border-2 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
                </div>
              </div>
              {/* Right props panel */}
              <div className="w-52 border-l border-panel-border flex flex-col py-4 px-3 gap-3 shrink-0 bg-panel">
                {[
                  { w: '100%', label: 'Width', val: '1080 px' },
                  { w: '100%', label: 'Height', val: '1080 px' },
                  { w: '80%', label: 'Opacity', val: '100%' },
                  { w: '90%', label: 'Radius', val: '16 px' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-theme-dim">{row.label}</span>
                    <div className="h-5 rounded bg-panel-hover border border-panel-border text-[10px] text-theme-muted flex items-center px-2" style={{ width: row.w === '100%' ? '70px' : '60px' }}>
                      {row.val}
                    </div>
                  </div>
                ))}
                <div className="mt-1 h-px bg-panel-border" />
                <div className="flex items-center gap-1.5 mt-1">
                  {['#f97316', '#38bdf8', '#a855f7', '#fbbf24', '#ec4899'].map(c => (
                    <div key={c} className="w-5 h-5 rounded-full border-2 border-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Photo design card */}
          <div className="group rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] via-transparent to-transparent p-8 transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.2)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                <Image className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Photo Design</h3>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              Create graphics, social posts, presentations, and print designs. Full canvas tools — shapes,
              text, images, layers, and multi-page projects with smart alignment guides.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Shapes', 'Text', 'Images', 'Layers', 'Export'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-300/80 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Video project card */}
          <div className="group rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-transparent p-8 transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_20px_60px_-15px_rgba(56,189,248,0.2)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                <Film className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Video Studio</h3>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              Import video clips, organize them on a timeline, trim and arrange. Includes text overlays,
              sticker overlays, audio tracks, transitions, and a CapCut-style editor.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Timeline', 'Transitions', 'Text Overlays', 'Audio', 'Export'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/15 text-sky-300/80 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-4 text-theme-muted text-lg max-w-lg mx-auto">
            Purpose-built tools that stay out of your way until you need them.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} backdrop-blur-sm p-7 transition-all duration-300 hover:-translate-y-[2px]`}
              style={{ '--glow': f.glow } as React.CSSProperties}
            >
              <div className={`w-11 h-11 rounded-xl bg-zinc-900/80 border border-white/[0.06] flex items-center justify-center mb-5 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div
          className="rounded-2xl border border-white/[0.07] p-10 sm:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(56,189,248,0.08) 100%)' }}
        >
          {/* Corner glows */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-orange-500/[0.08] blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-sky-500/[0.08] blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <img
                src={LOGO_SRC}
                alt="DreFlow"
                className="w-14 h-14 rounded-2xl object-cover shadow-[0_0_30px_rgba(249,115,22,0.5)]"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to create something?
            </h2>
            <p className="mt-3 text-theme-muted max-w-md mx-auto">
              Sign up in seconds and start designing. Your work saves automatically to your workspace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onRegister}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-400 hover:to-amber-400 transition-all shadow-[0_8px_30px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.5)]"
              >
                Create free account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <InstallButton />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_SRC} alt="DreFlow" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-sky-400 bg-clip-text text-transparent">DreFlow</span>
          </div>
          <p className="text-xs text-theme-dim">Built for creators who move fast.</p>
        </div>
      </footer>
    </div>
  );
}
