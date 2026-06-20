import React from 'react';
import {
  LogOut, Clock, Sun, Moon,
  FileStack, ArrowRight, Image, Film, Download, Monitor,
} from 'lucide-react';
import { SavedDesign, ProjectMode } from '../store/useStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useThemeStore } from '../store/themeStore';

const LOGO_SRC = '/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png';

type Props = {
  user: string;
  designs: SavedDesign[];
  onCreate: (mode: ProjectMode) => void;
  onOpen: (design: SavedDesign) => void;
  onDownload: (design: SavedDesign) => void;
  onLogout: () => void;
  hasPendingChanges: boolean;
  syncStatus: string;
};

export default function Dashboard({ user, designs, onCreate, onOpen, onDownload, onLogout, hasPendingChanges, syncStatus }: Props) {
  const photoDesigns = designs.filter((d) => d.projectMode !== 'video');
  const videoProjects = designs.filter((d) => d.projectMode === 'video');
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { mode, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/[0.05] blur-[130px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="DesignForge"
            className="w-9 h-9 rounded-xl object-cover shadow-[0_0_18px_rgba(249,115,22,0.35)]"
          />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
            DesignForge
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 text-sm font-semibold hover:bg-sky-500/20 hover:border-sky-500/60 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
          {isInstalled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-panel-hover text-theme-dim text-xs font-medium">
              <Monitor className="w-3.5 h-3.5" />
              Installed
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel border border-panel-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
              {user.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-theme-secondary font-medium">{user}</span>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${hasPendingChanges ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'}`}>
            {syncStatus}
          </span>
          <button
            type="button"
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-panel-border bg-panel hover:bg-panel-hover text-theme-dim hover:text-theme-primary transition-colors"
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-panel-border bg-panel text-sm text-theme-muted hover:text-theme-primary hover:border-panel-hover transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-16">
        {/* Welcome header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-white">Welcome back, </span>
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">{user}</span>
          </h1>
          <p className="mt-2 text-theme-muted">
            Pick up a saved project or start something new.
          </p>
        </div>

        {/* Creation cards */}
        <div className="grid gap-5 sm:grid-cols-2 mb-12">
          {/* Photo Design */}
          <button
            type="button"
            onClick={() => onCreate('photo')}
            className="group rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-transparent p-8 text-left transition-all duration-300 hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.2)]"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                <Image className="w-6 h-6 text-orange-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-theme-dim group-hover:text-orange-400 transition-colors group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Photo Design</h2>
            <p className="text-sm text-theme-muted leading-relaxed">
              Create graphics, social posts, presentations, and print designs. Full canvas tools, shapes,
              text, images, and multi-page support.
            </p>
            <div className="mt-5 flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-300/80 text-xs">Canvas editor</span>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/15 text-orange-300/80 text-xs">Multi-page</span>
            </div>
          </button>

          {/* Video Project */}
          <button
            type="button"
            onClick={() => onCreate('video')}
            className="group rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-8 text-left transition-all duration-300 hover:border-sky-500/40 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-15px_rgba(56,189,248,0.2)]"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                <Film className="w-6 h-6 text-sky-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-theme-dim group-hover:text-sky-400 transition-colors group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Video Project</h2>
            <p className="text-sm text-theme-muted leading-relaxed">
              Import video clips, organize them on a timeline, trim and arrange. Includes all photo tools
              plus a CapCut-style video editor.
            </p>
            <div className="mt-5 flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/15 text-sky-300/80 text-xs">Timeline</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/15 text-sky-300/80 text-xs">Transitions</span>
            </div>
          </button>
        </div>

        {/* Photo designs section */}
        <DesignSection
          title="Photo Designs"
          icon={<Image className="w-3.5 h-3.5" />}
          accent="orange"
          designs={photoDesigns}
          onOpen={onOpen}
          onDownload={onDownload}
        />

        {/* Video projects section */}
        <DesignSection
          title="Video Projects"
          icon={<Film className="w-3.5 h-3.5" />}
          accent="sky"
          designs={videoProjects}
          onOpen={onOpen}
          onDownload={onDownload}
        />
      </div>
    </div>
  );
}

function DesignSection({
  title,
  icon,
  accent,
  designs,
  onOpen,
  onDownload,
}: {
  title: string;
  icon: React.ReactNode;
  accent: 'orange' | 'sky';
  designs: SavedDesign[];
  onOpen: (design: SavedDesign) => void;
  onDownload: (design: SavedDesign) => void;
}) {
  const isOrange = accent === 'orange';
  const badgeCls = isOrange
    ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
    : 'bg-sky-500/15 text-sky-400 border-sky-500/20';
  const hoverRing = isOrange ? 'hover:border-orange-500/30' : 'hover:border-sky-500/30';
  const downloadBtn = isOrange
    ? 'bg-orange-500/80 hover:bg-orange-400 text-white'
    : 'bg-sky-500/80 hover:bg-sky-400 text-white';

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
          {icon}
          {title}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-panel-hover text-theme-dim text-[11px] font-medium">{designs.length}</span>
      </div>

      {designs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-panel-border bg-panel-hover p-10 text-center">
          <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${isOrange ? 'bg-orange-500/10 text-orange-500/40' : 'bg-sky-500/10 text-sky-500/40'}`}>
            {isOrange ? <Image className="w-5 h-5" /> : <Film className="w-5 h-5" />}
          </div>
          <p className="text-sm text-theme-dim">No {title.toLowerCase()} yet.</p>
          <p className="text-xs text-theme-dim mt-1">Create one above to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => {
            const hasThumb = design.pages.some((p) => p.thumbnail);
            const firstThumb = design.pages.find((p) => p.thumbnail)?.thumbnail;
            const isVideo = design.projectMode === 'video';
            return (
              <button
                key={design.id}
                type="button"
                onClick={() => onOpen(design)}
                className={`group rounded-2xl border border-panel-border bg-panel text-left overflow-hidden transition-all duration-200 hover:bg-panel-hover hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] ${hoverRing}`}
              >
                {/* Thumbnail */}
                <div className="h-36 bg-canvas-surface relative overflow-hidden">
                  {hasThumb && firstThumb ? (
                    <img
                      src={firstThumb}
                      alt={design.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isVideo
                        ? <Film className="w-8 h-8 text-theme-dim" />
                        : <Image className="w-8 h-8 text-theme-dim" />
                      }
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-surface via-transparent to-transparent opacity-70" />

                  {/* Mode badge */}
                  <div className={`absolute top-3 left-3 ${badgeCls} px-2 py-0.5 rounded-full text-[10px] font-semibold border`}>
                    {isVideo ? 'Video' : 'Photo'}
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDownload(design); }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm transition-colors ${downloadBtn}`}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[11px] font-medium backdrop-blur-sm">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-theme-primary transition-colors">
                    {design.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-theme-dim">
                    <span className="inline-flex items-center gap-1">
                      <FileStack className="w-3 h-3" />
                      {design.pages.length} page{design.pages.length !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
