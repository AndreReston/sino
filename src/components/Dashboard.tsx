import React from 'react';
import {
  Layers, LogOut, Clock,
  FileStack, ArrowRight, Image, Film, Download, Monitor,
} from 'lucide-react';
import { SavedDesign, ProjectMode } from '../store/useStore';
import { usePWAInstall } from '../hooks/usePWAInstall';

type Props = {
  user: string;
  designs: SavedDesign[];
  onCreate: (mode: ProjectMode) => void;
  onOpen: (design: SavedDesign) => void;
  onDownload: (design: SavedDesign) => void;
  onLogout: () => void;
};

export default function Dashboard({ user, designs, onCreate, onOpen, onDownload, onLogout }: Props) {
  const photoDesigns = designs.filter((d) => d.projectMode !== 'video');
  const videoProjects = designs.filter((d) => d.projectMode === 'video');
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">DesignForge</span>
        </div>
        <div className="flex items-center gap-3">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={installApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
          {isInstalled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
              <Monitor className="w-3.5 h-3.5" />
              Installed
            </span>
          )}
          <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/80 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-16">
        {/* Welcome header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Welcome back, {user}
          </h1>
          <p className="mt-2 text-zinc-500">
            Pick up a saved project or start something new.
          </p>
        </div>

        {/* Creation cards — Photo vs Video */}
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {/* Photo Design */}
          <button
            type="button"
            onClick={() => onCreate('photo')}
            className="group rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-8 text-left transition-all hover:border-emerald-500/40 hover:shadow-[0_16px_50px_-15px_rgba(16,185,129,0.15)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Image className="w-5 h-5 text-emerald-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">Photo Design</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Create graphics, social posts, presentations, and print designs. Full canvas tools, shapes, text, images, and multi-page support.
            </p>
          </button>

          {/* Video Project */}
          <button
            type="button"
            onClick={() => onCreate('video')}
            className="group rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-8 text-left transition-all hover:border-sky-500/40 hover:shadow-[0_16px_50px_-15px_rgba(56,189,248,0.15)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                <Film className="w-5 h-5 text-sky-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-sky-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">Video Project</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Import video clips, organize them on a timeline, trim and arrange. Includes all photo tools plus a CapCut-style video editor.
            </p>
          </button>
        </div>

        {/* Photo designs section */}
        <DesignSection
          title="Photo Designs"
          icon={<Image className="w-3.5 h-3.5" />}
          accent="emerald"
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
  accent: 'emerald' | 'sky';
  designs: SavedDesign[];
  onOpen: (design: SavedDesign) => void;
  onDownload: (design: SavedDesign) => void;
}) {
  const accentBg = accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400';
  const ringColor = accent === 'emerald' ? 'hover:ring-emerald-500/20' : 'hover:ring-sky-500/20';

  return (
    <div className="mb-10">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
        {icon}
        {title}
        <span className="ml-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">{designs.length}</span>
      </div>

      {/* Cards */}
      {designs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <p className="text-sm text-zinc-600">No {title.toLowerCase()} yet.</p>
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
                className={`group rounded-2xl border border-zinc-800 bg-zinc-900/60 text-left overflow-hidden transition-all hover:border-zinc-600 hover:bg-zinc-900/80 hover:translate-y-[-2px] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] ${ringColor}`}
              >
                {/* Thumbnail strip */}
                <div className="h-36 bg-zinc-950 relative overflow-hidden">
                  {hasThumb && firstThumb ? (
                    <img
                      src={firstThumb}
                      alt={design.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isVideo ? <Film className="w-8 h-8 text-zinc-800" /> : <Layers className="w-8 h-8 text-zinc-800" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
                  {/* Mode badge */}
                  <div className={`absolute top-3 left-3 ${accentBg} px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accent === 'emerald' ? 'border-emerald-500/20' : 'border-sky-500/20'}`}>
                    {isVideo ? 'Video' : 'Photo'}
                  </div>
                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDownload(design); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 text-white text-[11px] font-semibold backdrop-blur-sm hover:bg-emerald-400 transition-colors"
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
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white truncate group-hover:text-zinc-100 transition-colors">
                    {design.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500">
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
