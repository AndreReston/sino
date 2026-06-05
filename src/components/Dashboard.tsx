import React from 'react';
import {
  Layers, Plus, LogOut, FolderOpen, Clock,
  FileStack, ArrowRight,
} from 'lucide-react';
import { SavedDesign } from '../store/useStore';

type Props = {
  user: string;
  designs: SavedDesign[];
  onCreate: () => void;
  onOpen: (design: SavedDesign) => void;
  onLogout: () => void;
};

export default function Dashboard({ user, designs, onCreate, onOpen, onLogout }: Props) {
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
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/80 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
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

        {/* Create new — featured card */}
        <button
          type="button"
          onClick={onCreate}
          className="group w-full rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-8 sm:p-10 text-left transition-all hover:border-emerald-500/40 hover:shadow-[0_16px_50px_-15px_rgba(16,185,129,0.15)] mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                <Plus className="w-3.5 h-3.5" />
                New project
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create a new design</h2>
              <p className="text-sm text-zinc-400 max-w-lg">
                Start with a blank canvas. Choose your size, pick your tools, and bring your ideas to life.
              </p>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </button>

        {/* Section heading */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-widest">
            <FolderOpen className="w-3.5 h-3.5" />
            Your designs
            <span className="ml-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">{designs.length}</span>
          </div>
        </div>

        {/* Design cards grid */}
        {designs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <FileStack className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-zinc-300">No saved designs yet</p>
            <p className="mt-2 text-sm text-zinc-600">Your projects will appear here after you save your first design.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => {
              const hasThumb = design.pages.some((p) => p.thumbnail);
              const firstThumb = design.pages.find((p) => p.thumbnail)?.thumbnail;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => onOpen(design)}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 text-left overflow-hidden transition-all hover:border-zinc-600 hover:bg-zinc-900/80 hover:translate-y-[-2px] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
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
                        <Layers className="w-8 h-8 text-zinc-800" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
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
    </div>
  );
}
