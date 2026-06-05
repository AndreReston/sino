import {
  Captions, Type, Eye, Sparkles, Highlighter,
} from 'lucide-react';
import { useVideoStore, CaptionStyle } from '../../store/videoStore';

const CAPTION_STYLES: { id: CaptionStyle; label: string; description: string; preview: string }[] = [
  { id: 'karaoke', label: 'Karaoke', description: 'Word-by-word highlight synced to speech', preview: 'Make it **POP**' },
  { id: 'pop-up', label: 'Pop-Up', description: 'Words appear one at a time with emphasis', preview: 'M A K E  I T  P O P' },
  { id: 'tiktok-subtitles', label: 'TikTok Subtitles', description: 'Bold, centered, viral-style captions', preview: 'MAKE IT POP' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, small, professional subtitles', preview: 'Make it pop' },
  { id: 'bold-highlight', label: 'Bold Highlight', description: 'Key words highlighted in accent color', preview: 'Make it POP' },
  { id: 'retro', label: 'Retro', description: 'Vintage VHS-style text overlay', preview: 'M.A.K.E. I.T. P.O.P.' },
];

export default function CaptionPanel() {
  const { project, activeSceneId, updateScene } = useVideoStore();

  if (!project) return null;

  const activeScene = project.scenes.find((s) => s.id === activeSceneId);
  const currentStyle = activeScene?.captionStyle || 'tiktok-subtitles';

  return (
    <div className="p-4 space-y-5">
      {/* Caption style selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Captions className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Caption Style</h4>
        </div>

        <div className="space-y-2">
          {CAPTION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                if (activeSceneId) {
                  updateScene(activeSceneId, { captionStyle: style.id });
                } else {
                  project.scenes.forEach((s) => updateScene(s.id, { captionStyle: style.id }));
                }
              }}
              className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                currentStyle === style.id
                  ? 'bg-sky-500/10 border border-sky-500/30'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${currentStyle === style.id ? 'text-sky-200' : 'text-zinc-300'}`}>
                  {style.label}
                </span>
                {currentStyle === style.id && (
                  <span className="text-[10px] text-sky-400 font-semibold">ACTIVE</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">{style.description}</p>
              <div className={`mt-2 rounded-lg px-3 py-2 text-center ${
                style.id === 'tiktok-subtitles' ? 'bg-white text-black font-bold text-lg' :
                style.id === 'minimal' ? 'text-white/80 text-sm' :
                style.id === 'bold-highlight' ? 'text-white text-base' :
                style.id === 'karaoke' ? 'bg-black/50 text-white text-base' :
                style.id === 'pop-up' ? 'bg-sky-500/20 text-sky-200 font-mono text-sm' :
                'bg-zinc-800 text-green-400 font-mono text-sm'
              }`}>
                {style.preview}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Caption intelligence */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Caption Intelligence</h4>
        </div>

        <div className="space-y-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Highlighter className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-zinc-200 font-medium">Hook Word Highlighting</span>
            </div>
            <p className="text-[11px] text-zinc-500">Auto-emphasizes hook words for retention</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-zinc-200 font-medium">Emotional Word Emphasis</span>
            </div>
            <p className="text-[11px] text-zinc-500">Highlights emotionally charged keywords</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Type className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-zinc-200 font-medium">Beat-Synced Timing</span>
            </div>
            <p className="text-[11px] text-zinc-500">Captions sync to speech stress patterns</p>
          </div>
        </div>
      </div>

      {/* Auto-captions toggle */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Auto Captions</p>
            <p className="text-[11px] text-zinc-500">Speech-to-text subtitles generated from voiceover</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-sky-500 flex items-center justify-end px-1 cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
