import {
  Download, Smartphone, Monitor, Tv,
  Check, AlertCircle, Zap,
} from 'lucide-react';
import { useVideoStore, Platform } from '../../store/videoStore';

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode; ratio: string; description: string }[] = [
  { id: 'tiktok', label: 'TikTok', icon: <Smartphone className="w-4 h-4" />, ratio: '9:16', description: 'Fast pacing, 15-60s, vertical' },
  { id: 'instagram-reels', label: 'Instagram Reels', icon: <Smartphone className="w-4 h-4" />, ratio: '9:16', description: 'Instagram vertical format' },
  { id: 'youtube-shorts', label: 'YouTube Shorts', icon: <Smartphone className="w-4 h-4" />, ratio: '9:16', description: 'Under 60s, vertical' },
  { id: 'youtube-landscape', label: 'YouTube Landscape', icon: <Monitor className="w-4 h-4" />, ratio: '16:9', description: 'Standard landscape video' },
  { id: 'ads-15s', label: 'Ad (15s)', icon: <Tv className="w-4 h-4" />, ratio: 'Various', description: 'Short ad format, 15 seconds' },
  { id: 'ads-30s', label: 'Ad (30s)', icon: <Tv className="w-4 h-4" />, ratio: 'Various', description: 'Standard ad format, 30 seconds' },
];

export default function ExportPanel() {
  const { project, setPlatform, isGenerating } = useVideoStore();

  if (!project) return null;

  const totalDuration = project.scenes.reduce((a, s) => a + s.durationSeconds, 0);
  const readyCount = project.scenes.filter((s) => s.status === 'ready').length;
  const allReady = readyCount === project.scenes.length;

  return (
    <div className="p-4 space-y-5">
      {/* Platform selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Export Platform</h4>
        </div>

        <div className="space-y-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                project.platform === p.id
                  ? 'bg-sky-500/10 border border-sky-500/30'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  project.platform === p.id ? 'bg-sky-500/20 text-sky-300' : 'bg-white/[0.04] text-zinc-500'
                }`}>
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${project.platform === p.id ? 'text-sky-200' : 'text-zinc-300'}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{p.ratio}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{p.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto optimization info */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Auto Optimization</h4>
        <div className="space-y-2">
          {[
            'Auto aspect ratio cropping',
            'Safe-zone text positioning',
            'Platform-specific pacing',
            'Bitrate optimization',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-zinc-400">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Readiness check */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Export Readiness</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Scenes ready</span>
            <span className={allReady ? 'text-emerald-400' : 'text-amber-400'}>
              {readyCount}/{project.scenes.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Duration</span>
            <span className="text-zinc-300">{totalDuration}s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Platform</span>
            <span className="text-zinc-300 capitalize">{project.platform.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Style</span>
            <span className="text-zinc-300 capitalize">{project.style.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Export button */}
      <button
        disabled={!allReady || isGenerating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
          allReady && !isGenerating
            ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_8px_30px_rgba(56,189,248,0.2)]'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        {allReady ? (
          <>
            <Download className="w-4 h-4" />
            Export for {PLATFORMS.find((p) => p.id === project.platform)?.label || 'Video'}
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            Generate all scenes first
          </>
        )}
      </button>

      {/* One-click re-export for other platforms */}
      {allReady && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Quick re-export for other platforms:</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.filter((p) => p.id !== project.platform).map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 transition-all"
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
