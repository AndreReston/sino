import { useState } from 'react';
import { History, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore, PageTransition } from '../../store/useStore';

const TRANSITIONS: PageTransition[] = ['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom-in', 'zoom-out', 'rotate', 'wipe-left', 'wipe-right'];

export default function SceneProperties() {
  const { videoProject, updateScene, regenerateScene } = useStore();
  const script = videoProject.script;
  const activeScene = script?.scenes.find(s => s.id === videoProject.activeSceneId);
  const [showHistory, setShowHistory] = useState(false);

  if (!script || !activeScene) {
    return (
      <div className="w-72 bg-[#0f0f12] border-l border-white/[0.06] flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-zinc-600 text-center px-6">Select a scene to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#0f0f12] border-l border-white/[0.06] flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scene Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {/* Visual description */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-500 font-medium">Visual Description</label>
          <textarea
            value={activeScene.visualDescription}
            onChange={(e) => updateScene(activeScene.id, { visualDescription: e.target.value })}
            className="w-full h-20 bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 resize-none"
          />
        </div>

        {/* Script line */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-500 font-medium">Script Line</label>
          <textarea
            value={activeScene.scriptLine}
            onChange={(e) => updateScene(activeScene.id, { scriptLine: e.target.value })}
            className="w-full h-16 bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 resize-none"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-zinc-500 font-medium">Duration</label>
            <span className="text-[11px] text-zinc-400 tabular-nums">{activeScene.duration}s</span>
          </div>
          <input
            type="range" min={1} max={30} step={0.5}
            value={activeScene.duration}
            onChange={(e) => updateScene(activeScene.id, { duration: Number(e.target.value) })}
            className="w-full accent-sky-500"
          />
        </div>

        {/* Transitions */}
        <div className="space-y-2">
          <label className="text-[11px] text-zinc-500 font-medium">Transition In</label>
          <select
            value={activeScene.transitionIn}
            onChange={(e) => updateScene(activeScene.id, { transitionIn: e.target.value as PageTransition })}
            className="w-full bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500/40"
          >
            {TRANSITIONS.map((t) => (
              <option key={t} value={t}>{t.replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-zinc-500 font-medium">Transition Out</label>
          <select
            value={activeScene.transitionOut}
            onChange={(e) => updateScene(activeScene.id, { transitionOut: e.target.value as PageTransition })}
            className="w-full bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500/40"
          >
            {TRANSITIONS.map((t) => (
              <option key={t} value={t}>{t.replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Regenerate controls */}
        <div className="space-y-2">
          <label className="text-[11px] text-zinc-500 font-medium">Regenerate</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { target: 'all' as const, label: 'Full Scene' },
              { target: 'visual' as const, label: 'Visual Only' },
              { target: 'audio' as const, label: 'Audio Only' },
              { target: 'style' as const, label: 'Style Only' },
            ].map((opt) => (
              <button
                key={opt.target}
                onClick={() => regenerateScene(activeScene.id, opt.target)}
                disabled={activeScene.isGenerating}
                className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-[#151519] border border-white/[0.06] text-[11px] text-zinc-400 hover:text-sky-300 hover:border-sky-500/30 hover:bg-sky-500/[0.05] transition-all disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06]">
          <span className="text-[11px] text-zinc-500">Version</span>
          <span className="text-[11px] text-zinc-300 font-semibold">v{activeScene.version}</span>
        </div>

        {/* Version history toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06] text-[11px] text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <span className="flex items-center gap-1.5">
            <History className="w-3 h-3" />
            Version History ({activeScene.versionHistory.length})
          </span>
          {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showHistory && activeScene.versionHistory.length > 0 && (
          <div className="space-y-1.5 pl-2 border-l-2 border-sky-500/20">
            {activeScene.versionHistory.map((v, i) => (
              <div key={i} className="px-2 py-1.5 rounded bg-[#151519] text-[10px] text-zinc-400">
                <p className="truncate">{v.visualDescription}</p>
                <p className="text-zinc-600 mt-0.5">{new Date(v.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
