import { SkipBack, SkipForward, RefreshCw, Film, Image, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ScenePreview() {
  const { videoProject, setActiveScene, regenerateScene } = useStore();
  const script = videoProject.script;
  const activeScene = script?.scenes.find(s => s.id === videoProject.activeSceneId);
  const activeIndex = script?.scenes.findIndex(s => s.id === videoProject.activeSceneId) ?? -1;
  const totalScenes = script?.scenes.length ?? 0;

  if (!script || !activeScene) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#07070a]">
        <div className="text-center">
          <Film className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-zinc-600">Select a scene to preview</p>
        </div>
      </div>
    );
  }

  const styleColors: Record<string, string> = {
    cinematic: 'from-amber-900/20 to-zinc-900/20',
    anime: 'from-pink-900/20 to-violet-900/20',
    documentary: 'from-green-900/20 to-zinc-900/20',
    tiktok: 'from-sky-900/20 to-pink-900/20',
    cyberpunk: 'from-violet-900/20 to-cyan-900/20',
    corporate: 'from-blue-900/20 to-zinc-900/20',
    'retro-vhs': 'from-amber-800/20 to-red-900/20',
    'minimal-clean': 'from-zinc-800/20 to-zinc-900/20',
  };

  const gradientClass = styleColors[activeScene.stylePreset] || 'from-zinc-900/20 to-zinc-900/20';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#07070a]">
      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* Scene card preview */}
        <div className={`relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-gradient-to-br ${gradientClass} border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]`}>
          {/* Visual content placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {activeScene.isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-10 h-10 text-sky-400 animate-spin" />
                <p className="text-sm text-sky-300 font-medium">Generating scene...</p>
              </div>
            ) : activeScene.imageUrl ? (
              <img src={activeScene.imageUrl} alt="Scene" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                  <Image className="w-8 h-8 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-300 font-medium mb-2">{activeScene.visualDescription}</p>
                  <p className="text-xs text-zinc-500 italic">"{activeScene.scriptLine}"</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-semibold border border-sky-500/20">
                    {activeScene.stylePreset}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[10px] border border-white/[0.06]">
                    {activeScene.duration}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scene number overlay */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.08]">
            <span className="text-xs font-bold text-white">Scene {activeIndex + 1}</span>
          </div>

          {/* Duration overlay */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.08]">
            <span className="text-xs font-mono text-white tabular-nums">{activeScene.duration.toFixed(1)}s</span>
          </div>

          {/* AI generate button */}
          <button
            onClick={() => regenerateScene(activeScene.id)}
            disabled={activeScene.isGenerating}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-medium hover:bg-sky-500/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Visual
          </button>
        </div>
      </div>

      {/* Scene navigation */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <button
          onClick={() => activeIndex > 0 && setActiveScene(script.scenes[activeIndex - 1].id)}
          disabled={activeIndex <= 0}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <span className="text-xs text-zinc-500 tabular-nums">
          {activeIndex + 1} / {totalScenes}
        </span>
        <button
          onClick={() => activeIndex < totalScenes - 1 && setActiveScene(script.scenes[activeIndex + 1].id)}
          disabled={activeIndex >= totalScenes - 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
