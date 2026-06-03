import React from 'react';
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
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Workspace</p>
              <h1 className="text-3xl font-semibold text-white">Hello, {user}</h1>
              <p className="mt-2 text-sm text-zinc-400">Pick a saved design or start a new project.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onCreate}
                className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Create new design
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {designs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-zinc-400">
              <p className="text-lg font-medium text-white">No saved designs yet.</p>
              <p className="mt-2 text-sm">Save your first design to see it here.</p>
            </div>
          ) : (
            designs.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => onOpen(design)}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-left transition hover:border-cyan-500 hover:bg-slate-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{design.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{design.pages.length} page{design.pages.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Open
                  </span>
                </div>
                <div className="mt-4 text-xs text-zinc-500">
                  Last updated {new Date(design.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
