import React, { useState } from 'react';
import {
  Plus, Trash2, GripVertical, RefreshCw,
  Play, Clock, Eye, Sparkles,
  Film, Zap, Wand2,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

export default function SceneBoard() {
  const { project, activeSceneId, setActiveSceneId, addScene, removeScene, reorderScenes, regenerateScene, updateScene } = useVideoStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);

  if (!project) return null;

  const scenes = project.scenes;
  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const handleDragStart = (e: React.DragEvent, sceneId: string) => {
    setDragId(sceneId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragId) {
      reorderScenes(dragId, index);
    }
    setDragId(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverIdx(null);
  };

  const totalDuration = scenes.reduce((a, s) => a + s.durationSeconds, 0);

  return (
    <div className="flex-1 overflow-auto relative" style={{ background: 'radial-gradient(circle at 50% 0%, #0a0f1a 0%, #07070a 70%)' }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 p-8 max-w-5xl mx-auto">
        {/* Empty state / prompt to start */}
        {scenes.every((s) => s.status === 'draft' && !s.visualDescription) && (
          <div className="mb-8 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.06] to-transparent p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-sky-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Start with a prompt</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Use the AI Chat panel on the right to describe your video idea.
              Say something like &quot;Make a viral gym motivation reel&quot; to auto-generate your storyboard.
            </p>
          </div>
        )}

        {/* Scene grid */}
        <div className="flex flex-wrap gap-4">
          {scenes.map((scene, index) => {
            const isActive = scene.id === activeSceneId;
            const isDragging = scene.id === dragId;
            const isDragOver = dragOverIdx === index;

            return (
              <div
                key={scene.id}
                draggable
                onDragStart={(e) => handleDragStart(e, scene.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.15)]'
                    : 'hover:ring-1 hover:ring-white/20'
                } ${isDragging ? 'opacity-40 scale-95' : ''} ${
                  isDragOver ? 'ring-2 ring-emerald-400/40' : ''
                }`}
                style={{ width: 220 }}
                onClick={() => setActiveSceneId(scene.id)}
              >
                {/* Thumbnail area */}
                <div className="relative h-32 bg-[#111116] overflow-hidden">
                  {scene.thumbnailUrl ? (
                    <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {scene.status === 'generating' ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
                          <span className="text-[10px] text-sky-300">Generating...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-600">
                          <Film className="w-8 h-8" />
                          <span className="text-[10px]">Scene {index + 1}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Status badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    scene.status === 'ready' ? 'bg-emerald-500/80 text-white' :
                    scene.status === 'generating' ? 'bg-sky-500/80 text-white animate-pulse' :
                    scene.status === 'error' ? 'bg-red-500/80 text-white' :
                    'bg-zinc-700/80 text-zinc-300'
                  }`}>
                    {scene.status}
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-zinc-300 font-mono">
                    {scene.durationSeconds}s
                  </div>

                  {/* Drag handle */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white/50" />
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button
                      onClick={(e) => { e.stopPropagation(); regenerateScene(scene.id, 'all'); }}
                      className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-sky-500/30 hover:border-sky-400/40 transition-colors"
                      title="Regenerate scene"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewSceneId(scene.id); }}
                      className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-sky-500/30 hover:border-sky-400/40 transition-colors"
                      title="Preview"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scene number */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none" style={{ left: scene.status === 'draft' ? undefined : 60 }}>
                    {!['draft'].includes(scene.status) ? null : null}
                  </div>
                </div>

                {/* Scene info */}
                <div className="p-3 bg-[#111116] border-t border-white/[0.04]">
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2 min-h-[2.5em]">
                    {scene.visualDescription || `Scene ${index + 1}`}
                  </p>
                  {scene.scriptLine && (
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1 italic">
                      &quot;{scene.scriptLine}&quot;
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {scene.vibePreset && scene.vibePreset !== 'cinematic' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {scene.vibePreset}
                      </span>
                    )}
                    {scene.effects.map((fx) => (
                      <span key={fx} className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {fx}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }}
                  disabled={scenes.length <= 1}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                  title="Delete scene"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add scene button */}
          <button
            onClick={() => addScene(activeSceneId)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-sky-500/30 bg-zinc-900/20 hover:bg-sky-500/[0.04] transition-all"
            style={{ width: 220, minHeight: 180 }}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-300">Add Scene</span>
          </button>
        </div>

        {/* Active scene detail panel */}
        {activeScene && (
          <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0c0c10] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-zinc-200">Scene {scenes.indexOf(activeScene) + 1} Details</span>
              <div className="flex-1" />
              <button
                onClick={() => regenerateScene(activeScene.id, 'visual')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
              >
                <Wand2 className="w-3 h-3" /> Regenerate Visual
              </button>
              <button
                onClick={() => addScene(activeScene.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
              >
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button
                onClick={() => removeScene(activeScene.id)}
                disabled={scenes.length <= 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-white/[0.06] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 p-5">
              {/* Left: visual + script */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Visual Description</label>
                  <textarea
                    value={activeScene.visualDescription}
                    onChange={(e) => updateScene(activeScene.id, { visualDescription: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none"
                    placeholder="Describe the visual for this scene..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Script Line / Voiceover</label>
                  <textarea
                    value={activeScene.scriptLine}
                    onChange={(e) => updateScene(activeScene.id, { scriptLine: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all resize-none"
                    placeholder="What should the voiceover say in this scene?"
                  />
                </div>
              </div>

              {/* Right: settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={activeScene.durationSeconds}
                        onChange={(e) => updateScene(activeScene.id, { durationSeconds: Number(e.target.value) || 3 })}
                        className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 tabular-nums focus:outline-none focus:border-sky-500/40 transition-all"
                      />
                      <span className="text-xs text-zinc-500 shrink-0">sec</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Style</label>
                    <select
                      value={activeScene.stylePreset}
                      onChange={(e) => updateScene(activeScene.id, { stylePreset: e.target.value as any })}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-sky-500/40 transition-all"
                    >
                      {['cinematic', 'anime', 'documentary', 'tiktok', 'cyberpunk', 'corporate', 'retro-vhs', 'minimal-clean', 'dramatic', 'vaporwave'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Transition In</label>
                    <select
                      value={activeScene.transitionIn}
                      onChange={(e) => updateScene(activeScene.id, { transitionIn: e.target.value })}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-sky-500/40 transition-all"
                    >
                      {['fade', 'slide-left', 'slide-right', 'slide-up', 'zoom-in', 'cut', 'wipe'].map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Transition Out</label>
                    <select
                      value={activeScene.transitionOut}
                      onChange={(e) => updateScene(activeScene.id, { transitionOut: e.target.value })}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-sky-500/40 transition-all"
                    >
                      {['fade', 'slide-left', 'slide-right', 'slide-down', 'zoom-out', 'cut', 'wipe'].map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total duration footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Total: {totalDuration}s ({scenes.length} scenes)</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{scenes.filter((s) => s.status === 'ready').length} ready</span>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewSceneId && (() => {
        const scene = scenes.find((s) => s.id === previewSceneId);
        if (!scene) return null;
        return (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewSceneId(null)}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06]" style={{ width: 360, height: 640 }} onClick={(e) => e.stopPropagation()}>
              {scene.thumbnailUrl ? (
                <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-zinc-700" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-sm text-white font-medium">{scene.visualDescription}</p>
                <p className="text-xs text-zinc-400 mt-1">{scene.durationSeconds}s · {scene.stylePreset}</p>
              </div>
              <button
                onClick={() => setPreviewSceneId(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                x
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
