import { useState } from 'react';
import { ArrowLeft, Save, Download, ChevronDown, TrendingUp, Film } from 'lucide-react';
import { useStore, PlatformTarget } from '../../store/useStore';

const PLATFORMS: { id: PlatformTarget; label: string; ratio: string }[] = [
  { id: 'tiktok', label: 'TikTok', ratio: '9:16' },
  { id: 'instagram-reels', label: 'Instagram Reels', ratio: '9:16' },
  { id: 'youtube-shorts', label: 'YouTube Shorts', ratio: '9:16' },
  { id: 'youtube-landscape', label: 'YouTube Landscape', ratio: '16:9' },
  { id: 'ads-15s', label: 'Ads 15s', ratio: '9:16' },
  { id: 'ads-30s', label: 'Ads 30s', ratio: '9:16' },
];

interface Props {
  onSave?: () => void;
  onBack?: () => void;
}

export default function VideoTopBar({ onSave, onBack }: Props) {
  const {
    canvasName, setCanvasName,
    videoProject, setExportConfig,
  } = useStore();
  const exportConfig = videoProject.exportConfig;
  const [editingName, setEditingName] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const script = videoProject.script;
  const sceneCount = script?.scenes.length ?? 0;
  const virality = videoProject.viralityScore;
  const totalDuration = script?.scenes.reduce((sum, s) => sum + s.duration, 0) ?? 0;

  const viralityColor = virality
    ? virality >= 80 ? 'text-emerald-400' : virality >= 60 ? 'text-amber-400' : 'text-red-400'
    : 'text-zinc-500';
  const viralityBg = virality
    ? virality >= 80 ? 'bg-emerald-500/15 border-emerald-500/30' : virality >= 60 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-red-500/15 border-red-500/30'
    : 'bg-zinc-800 border-zinc-700';

  return (
    <div className="flex items-center h-12 bg-[#111115] border-b border-white/[0.06] px-3 gap-2 z-50 shrink-0">
      {/* Back + Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/[0.06] mr-1">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="w-7 h-7 rounded-md bg-sky-500 flex items-center justify-center">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-zinc-100 tracking-tight">DesignForge</span>
      </div>

      {/* Project name */}
      <div className="flex items-center gap-1.5 mr-2">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">
          Video
        </span>
        {editingName ? (
          <input
            autoFocus
            className="bg-[#1a1a1f] border border-zinc-600 rounded-md px-2 py-0.5 text-sm text-white focus:outline-none focus:border-sky-500/50 w-40"
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="text-sm text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors">
            {canvasName}
          </button>
        )}
      </div>

      {/* Scene + duration info */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-xs text-zinc-500">
          {sceneCount} scene{sceneCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-zinc-600">|</span>
        <span className="text-xs text-zinc-500 tabular-nums">
          {totalDuration.toFixed(0)}s total
        </span>
      </div>

      {/* Virality score */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${viralityBg}`}>
        <TrendingUp className="w-3.5 h-3.5" />
        <span className={`text-xs font-semibold tabular-nums ${viralityColor}`}>
          {virality ? `${virality}/100` : 'N/A'}
        </span>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className="w-3 h-3" />
          </button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
              <div className="absolute top-full right-0 mt-1 w-64 bg-[#111115] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-2">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-600">Platform</div>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setExportConfig({ platform: p.id }); setShowExport(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      exportConfig.platform === p.id
                        ? 'text-sky-300 bg-sky-500/10'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-zinc-500">{p.ratio}</span>
                  </button>
                ))}
                <div className="border-t border-white/[0.06] my-1" />
                <button
                  onClick={() => { setShowExport(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
