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
  onPrivacy: () => void;
  onTerms: () => void;
};

const FEATURES = [
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Multi-Page Projects',
    description: 'Add, duplicate, reorder, and navigate pages with a Canva-style strip. Full storyboard control.',
    iconColor: 'text-sky-500 dark:text-sky-400',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Export Any Format',
    description: 'Download pages as PNG, JPG, or SVG. Batch-export selected or all pages as a ZIP archive.',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Rich Design Tools',
    description: 'Shapes, text, images, layers, freehand drawing, alignment guides, and smart object snapping.',
    iconColor: 'text-violet-500 dark:text-violet-400',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Video Studio',
    description: 'Timeline editing, transitions, text overlays, audio tracks, and direct video export — all in browser.',
    iconColor: 'text-amber-500 dark:text-amber-400',
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
      className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-panel-border bg-panel text-theme-secondary font-semibold text-sm hover:bg-panel-hover hover:border-panel-hover hover:text-theme-primary transition-all ${className}`}
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  );
}

export default function LandingPage({ onLogin, onRegister, onPrivacy, onTerms }: Props) {
  const { mode, toggle } = useThemeStore();
  return (
    <div className="min-h-screen bg-canvas-bg text-theme-primary overflow-x-hidden">

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5 border-b border-panel-border">
        <div className="flex items-center gap-3">
          <img src={LOGO_SRC} alt="DreFlow" className="w-9 h-9 rounded-xl object-cover" />
          <span className="text-lg font-bold tracking-tight text-orange-500 dark:text-orange-400">
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
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-28">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-panel border border-panel-border text-theme-muted text-xs font-semibold tracking-wide">
            <MousePointer2 className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
            Visual design &amp; video platform for creators
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06]">
            <span className="text-theme-primary">Create without</span>
            <br />
            <span className="text-orange-500 dark:text-orange-400">limits.</span>
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
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors hover:-translate-y-0.5"
          >
            Start designing for free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-panel-border bg-panel text-theme-secondary font-medium text-sm hover:border-panel-hover hover:bg-panel-hover hover:text-theme-primary transition-all"
          >
            Sign in to my account
          </button>
        </div>

        {/* Hero visual — app preview mockup */}
        <div className="relative rounded-2xl border border-panel-border overflow-hidden shadow-lg">
          {/* Simulated top bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-panel-border bg-panel">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-panel-hover border border-panel-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-panel-hover border border-panel-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-panel-hover border border-panel-border" />
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
              <div className="px-3 py-1 rounded-md bg-panel-hover border border-panel-border text-[10px] text-theme-muted font-medium">Export</div>
            </div>
          </div>
          {/* Simulated workspace */}
          <div className="flex min-h-[300px] bg-canvas-surface">
            {/* Left tools panel */}
            <div className="w-14 border-r border-panel-border flex flex-col items-center py-4 gap-2.5 shrink-0 bg-panel">
              {[
                { active: true },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
                { active: false },
              ].map((item, i) => (
                <div key={i} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${item.active ? 'bg-orange-500/15 border-orange-500/30 text-orange-500 dark:text-orange-400' : 'bg-panel-hover border-panel-border text-theme-dim'}`}>
                  <div className="w-3 h-3 rounded-sm bg-current opacity-60" />
                </div>
              ))}
            </div>
            {/* Canvas area */}
            <div className="flex-1 flex items-center justify-center p-10 relative bg-canvas-surface">
              {/* Mock design card */}
              <div className="relative w-52 h-52 rounded-2xl bg-panel shadow-md overflow-hidden border border-panel-border">
                <div className="absolute top-7 left-5 w-28 h-3 rounded-full bg-theme-dim opacity-40" />
                <div className="absolute top-14 left-5 w-18 h-2 rounded-full bg-theme-dim opacity-20" style={{ width: '72px' }} />
                <div className="absolute bottom-7 right-5 w-14 h-14 rounded-xl bg-orange-500" />
                <div className="absolute bottom-7 left-5 w-10 h-10 rounded-full bg-sky-500" />
                {/* Selection handle */}
                <div className="absolute bottom-7 right-5 w-14 h-14 rounded-xl border-2 border-sky-400" />
              </div>
            </div>
            {/* Right props panel */}
            <div className="w-52 border-l border-panel-border flex flex-col py-4 px-3 gap-3 shrink-0 bg-panel">
              {[
                { label: 'Width', val: '1080 px' },
                { label: 'Height', val: '1080 px' },
                { label: 'Opacity', val: '100%' },
                { label: 'Radius', val: '16 px' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] text-theme-dim">{row.label}</span>
                  <div className="h-5 rounded bg-panel-hover border border-panel-border text-[10px] text-theme-muted flex items-center px-2 w-[70px]">
                    {row.val}
                  </div>
                </div>
              ))}
              <div className="mt-1 h-px bg-panel-border" />
              <div className="flex items-center gap-1.5 mt-1">
                {['#f97316', '#38bdf8', '#a855f7', '#fbbf24', '#ec4899'].map(c => (
                  <div key={c} className="w-5 h-5 rounded-full border-2 border-panel-border" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Photo design card */}
          <div className="group rounded-2xl border border-panel-border bg-panel p-8 transition-all duration-200 hover:border-orange-500/40 hover:bg-panel-hover">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary">Photo Design</h3>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              Create graphics, social posts, presentations, and print designs. Full canvas tools — shapes,
              text, images, layers, and multi-page projects with smart alignment guides.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Shapes', 'Text', 'Images', 'Layers', 'Export'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-600 dark:text-orange-300 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Video project card */}
          <div className="group rounded-2xl border border-panel-border bg-panel p-8 transition-all duration-200 hover:border-sky-500/40 hover:bg-panel-hover">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Film className="w-6 h-6 text-sky-500 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary">Video Studio</h3>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              Import video clips, organize them on a timeline, trim and arrange. Includes text overlays,
              sticker overlays, audio tracks, transitions, and a CapCut-style editor.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Timeline', 'Transitions', 'Text Overlays', 'Audio', 'Export'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/15 text-sky-600 dark:text-sky-300 text-xs font-medium">
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary">
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
              className="group rounded-2xl border border-panel-border bg-panel p-7 transition-all duration-200 hover:border-panel-hover hover:bg-panel-hover hover:-translate-y-[2px]"
            >
              <div className={`w-11 h-11 rounded-xl bg-panel-light border border-panel-border flex items-center justify-center mb-5 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">{f.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-panel-border bg-panel p-10 sm:p-14 text-center">
          <div className="flex justify-center mb-5">
            <img src={LOGO_SRC} alt="DreFlow" className="w-14 h-14 rounded-2xl object-cover" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-theme-primary">
            Ready to create something?
          </h2>
          <p className="mt-3 text-theme-muted max-w-md mx-auto">
            Sign up in seconds and start designing. Your work saves automatically to your workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRegister}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
            >
              Create free account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <InstallButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-panel-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
          {/* Brand and tagline */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_SRC} alt="DreFlow" className="w-7 h-7 rounded-lg object-cover" />
              <span className="text-sm font-semibold text-orange-500 dark:text-orange-400">DreFlow</span>
            </div>
            <p className="text-xs text-theme-dim">Built for creators who move fast.</p>
          </div>

          {/* Regulatory links */}
          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={onPrivacy}
              className="text-theme-muted hover:text-theme-primary transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-theme-dim">|</span>
            <button
              onClick={onTerms}
              className="text-theme-muted hover:text-theme-primary transition-colors"
            >
              Terms of Service
            </button>
          </div>

          {/* Compliance stamp */}
          <p className="text-[10px] text-theme-dim text-center max-w-lg">
            DreFlow Architecture Map — Secure Client-Side Sandbox Logic. No code data is retained on our servers.
          </p>
        </div>
      </footer>
    </div>
  );
}
