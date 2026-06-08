import { useState, useRef } from 'react';
import {
  Film, Type, Sliders, Volume2, Wand2, Download, Upload, Plus, Trash2,
  Music, Mic, ArrowLeft, ArrowRight, Sparkles, Layers, Bookmark,
  Zap, BarChart2, Package, ShieldCheck, RotateCcw, Check, Play,
  SmilePlus, Move, Image as ImageIcon,
} from 'lucide-react';
import {
  useVideoStore, DEFAULT_FILTERS, VideoFilters, TransitionType,
  CaptionStyle, ClipEffect, MotionPreset,
} from '../../store/videoStore';
import {
  uploadMediaForPersistence,
  getVideoDuration,
  getAudioDuration,
  countEphemeralUrls,
} from '../../lib/mediaUpload';

type Panel = 'clips' | 'photos' | 'text' | 'filters' | 'effects' | 'audio' | 'transitions' | 'subtitles' | 'export' | 'stickers' | 'markers' | 'beats' | 'stats' | 'presets';

const PANELS: { id: Panel; icon: React.ReactNode; label: string }[] = [
  { id: 'clips', icon: <Film className="w-4 h-4" />, label: 'Clips' },
  { id: 'photos', icon: <ImageIcon className="w-4 h-4" />, label: 'Photos' },
  { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
  { id: 'filters', icon: <Sliders className="w-4 h-4" />, label: 'Filters' },
  { id: 'effects', icon: <Sparkles className="w-4 h-4" />, label: 'Effects' },
  { id: 'audio', icon: <Volume2 className="w-4 h-4" />, label: 'Audio' },
  { id: 'transitions', icon: <Wand2 className="w-4 h-4" />, label: 'Trans.' },
  { id: 'subtitles', icon: <Layers className="w-4 h-4" />, label: 'Subs' },
  { id: 'stickers', icon: <SmilePlus className="w-4 h-4" />, label: 'Stickers' },
  { id: 'markers', icon: <Bookmark className="w-4 h-4" />, label: 'Markers' },
  { id: 'beats', icon: <Zap className="w-4 h-4" />, label: 'Beats' },
  { id: 'stats', icon: <BarChart2 className="w-4 h-4" />, label: 'Stats' },
  { id: 'presets', icon: <Package className="w-4 h-4" />, label: 'Presets' },
  { id: 'export', icon: <Download className="w-4 h-4" />, label: 'Export' },
];

const TRANSITIONS: TransitionType[] = ['none', 'fade', 'crossfade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'wipe-left', 'wipe-right'];
const CAPTION_STYLES: CaptionStyle[] = ['karaoke', 'pop-up', 'tiktok', 'minimal', 'bold-highlight'];

const EFFECTS: { id: ClipEffect; label: string; desc: string }[] = [
  { id: 'none', label: 'None', desc: 'No effect applied' },
  { id: 'shake', label: 'Shake', desc: 'Subtle camera shake' },
  { id: 'zoom-in', label: 'Zoom In', desc: 'Zoom from small to full' },
  { id: 'zoom-out', label: 'Zoom Out', desc: 'Zoom from large to normal' },
  { id: 'fade-in', label: 'Fade In', desc: 'Opacity 0 to 100%' },
  { id: 'fade-out', label: 'Fade Out', desc: 'Opacity 100 to 0%' },
  { id: 'blur-in', label: 'Blur In', desc: 'Blur to sharp' },
  { id: 'blur-out', label: 'Blur Out', desc: 'Sharp to blur' },
  { id: 'vhs', label: 'VHS', desc: 'Retro VHS look' },
  { id: 'glitch', label: 'Glitch', desc: 'Digital glitch effect' },
];

const MOTION_PRESETS: { id: MotionPreset; label: string; icon: string }[] = [
  { id: 'fade-in', label: 'Fade In', icon: '▶' },
  { id: 'fade-out', label: 'Fade Out', icon: '◀' },
  { id: 'zoom-in', label: 'Zoom In', icon: '⊕' },
  { id: 'zoom-out', label: 'Zoom Out', icon: '⊖' },
  { id: 'slide-left', label: 'Slide L', icon: '←' },
  { id: 'slide-right', label: 'Slide R', icon: '→' },
  { id: 'bounce', label: 'Bounce', icon: '⟳' },
  { id: 'elastic', label: 'Elastic', icon: '⇝' },
];

const EMOJI_STICKERS = ['😀','😂','🔥','❤️','⭐','🎉','👍','💯','🚀','💎','🌟','🎵','🤩','😎','💪','✨','🎯','🏆','🦄','🌈'];
const SHAPE_STICKERS = ['⬤','■','▲','◆','★','♥','⬟','⬡'];
const ARROW_STICKERS = ['→','←','↑','↓','↗','↙','↺','↻'];
const BUBBLE_STICKERS = ['💬','💭','🗨','🗯'];

const STOCK_VIDEOS = [
  { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300', label: 'Team' },
  { url: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=300', label: 'Nature' },
  { url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=300', label: 'Office' },
  { url: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=300', label: 'City' },
  { url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=300', label: 'Forest' },
  { url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=300', label: 'Galaxy' },
];

const STOCK_PHOTOS = [
  { url: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=400', label: 'Nature' },
  { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400', label: 'Team' },
  { url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400', label: 'Office' },
  { url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=400', label: 'Meeting' },
  { url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=400', label: 'Work' },
  { url: 'https://images.pexels.com/photos/7376/startup-photos.jpg?w=400', label: 'Startup' },
  { url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=400', label: 'People' },
  { url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=400', label: 'Tech' },
  { url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?w=400', label: 'Sky' },
  { url: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=400', label: 'City' },
  { url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=400', label: 'Forest' },
  { url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400', label: 'Galaxy' },
];

const MARKER_COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#151519] border border-white/[0.06] rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-sky-300 tabular-nums">{value}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function HealthBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-zinc-600 text-[9px]">—</span>;
  const isWarn = value.includes('⚠') || value === 'Low ⚠' || value === 'Low';
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isWarn ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
      {value}
    </span>
  );
}

function ExportStatusBadge({ status, progress }: { status: string; progress: number }) {
  if (status === 'completed') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Done</span>;
  if (status === 'failed') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">Failed</span>;
  if (status === 'exporting') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">{progress}%</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">Queued</span>;
}

function SavePresetButton({ clipId }: { clipId: string }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const saveStylePreset = useVideoStore(s => s.saveStylePreset);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/15 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Save Current as Preset
      </button>
    );
  }

  return (
    <div className="space-y-2 p-2 rounded-xl bg-[#151519] border border-violet-500/20">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Preset name..."
        className="w-full bg-transparent border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500/40"
        onKeyDown={e => {
          if (e.key === 'Enter' && name.trim()) { saveStylePreset(name.trim(), clipId); setName(''); setOpen(false); }
          if (e.key === 'Escape') { setOpen(false); }
        }}
      />
      <div className="flex gap-1.5">
        <button
          onClick={() => { if (name.trim()) { saveStylePreset(name.trim(), clipId); setName(''); setOpen(false); } }}
          disabled={!name.trim()}
          className="flex-1 py-1.5 rounded-lg bg-violet-500 text-white text-[10px] font-semibold disabled:opacity-40 hover:bg-violet-400 transition-colors"
        >Save</button>
        <button onClick={() => setOpen(false)} className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] hover:bg-zinc-700 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function AutoSubtitleDistributor() {
  const [text, setText] = useState('');
  const autoDistributeSubtitles = useVideoStore(s => s.autoDistributeSubtitles);
  const getTotalDuration = useVideoStore(s => s.getTotalDuration);
  const total = getTotalDuration();

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-2 p-3 rounded-xl bg-[#151519] border border-white/[0.06]">
      <p className="text-[10px] text-zinc-400 font-medium">Auto-distribute subtitles</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={"Line 1\nLine 2\nLine 3..."}
        rows={5}
        className="w-full bg-transparent border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-sky-500/40 resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">{lines.length} lines · {formatDuration(total)} total</span>
        <button
          onClick={() => { if (lines.length > 0) { autoDistributeSubtitles(lines); setText(''); } }}
          disabled={lines.length === 0 || total === 0}
          className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[10px] font-semibold disabled:opacity-40 hover:bg-sky-400 transition-colors"
        >Distribute</button>
      </div>
    </div>
  );
}

export default function VideoSidebar() {
  const [activePanel, setActivePanel] = useState<Panel>('clips');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const beatAudioInputRef = useRef<HTMLInputElement>(null);

  const {
    project, activeClipId, updateClip, addClip, removeClip, reorderClip,
    addTextOverlay, removeTextOverlay,
    addSubtitle, removeSubtitle, updateSubtitle,
    setClipFilter, resetClipFilters, removeAudioTrack, setBackgroundMusic, updateBackgroundMusic,
    setActiveClipId, setActiveTextId, setActiveStickerOverlayId, setActiveAudioTrackId,
    activeTextId, activeStickerOverlayId, activeAudioTrackId,
    startExport, isExporting, exportProgress, setClipEffect,
    addStickerOverlay, removeStickerOverlay,
    addSceneMarker, removeSceneMarker, updateSceneMarker, jumpToMarker,
    currentTime, showSafeZones, setShowSafeZones,
    showBeatMarkers, setShowBeatMarkers, snapToBeats, setSnapToBeats,
    analyzeBeatMarkers, clearBeatMarkers, isAnalyzingBeats,
    stylePresets, applyStylePreset, removeStylePreset,
    exportQueue, clearExportQueue, addToExportQueue,
    projectVersions, saveProjectVersion, restoreProjectVersion, clearVersionHistory,
    addEffectToStack, removeEffectFromStack, updateEffectInStack,
    applyMotionPreset, getProjectStats,
  } = useVideoStore();

  const activeClip = project?.clips.find(c => c.id === activeClipId);
  const sortedClips = [...(project?.clips ?? [])].sort((a, b) => a.order - b.order);
  const stats = getProjectStats();

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const [{ url, error }, duration] = await Promise.all([
        uploadMediaForPersistence(file),
        getVideoDuration(file),
      ]);
      if (!url) {
        setUploadError(error ?? 'Upload failed');
        return;
      }
      addClip({ url, name: file.name, duration, trimStart: 0, trimEnd: 0, volume: 1 });
    } catch {
      setUploadError('Could not read video file.');
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const [{ url, error }, duration] = await Promise.all([
        uploadMediaForPersistence(file),
        getAudioDuration(file),
      ]);
      if (!url) {
        setUploadError(error ?? 'Upload failed');
        return;
      }
      setBackgroundMusic({
        id: `bg_${Date.now()}`,
        url,
        name: file.name,
        volume: 0.8,
        muted: false,
        startTime: 0,
        duration,
      });
    } catch {
      setUploadError('Could not read audio file.');
    } finally {
      setUploading(false);
    }
  };

  const handleBeatAudioUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    analyzeBeatMarkers(url);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const { url, error } = await uploadMediaForPersistence(file);
      if (!url) {
        setUploadError(error ?? 'Upload failed');
        return;
      }
      addStickerOverlay('photo', url);
    } finally {
      setUploading(false);
    }
  };

  const handleStockPhoto = (url: string) => {
    addStickerOverlay('photo', url);
  };

  return (
    <aside className="flex h-full bg-[#0f0f12] border-r border-white/[0.06] shrink-0" style={{ width: 280 }}>
      {/* Icon rail */}
      <div className="flex flex-col items-center w-14 border-r border-white/[0.06] py-3 gap-1 shrink-0 overflow-y-auto">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mb-3 shrink-0">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {PANELS.map(p => (
          <button key={p.id} title={p.label} onClick={() => setActivePanel(p.id)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all text-xs gap-0.5 shrink-0
              ${activePanel === p.id ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}>
            {p.icon}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{PANELS.find(p => p.id === activePanel)?.label}</p>
        </div>
        {(uploading || uploadError || (project && countEphemeralUrls(project) > 0)) && (
          <div className="px-3 pt-3 shrink-0 space-y-2">
            {uploading && (
              <p className="text-[11px] text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2">
                Uploading to cloud…
              </p>
            )}
            {uploadError && (
              <p className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {uploadError}
              </p>
            )}
            {!uploading && project && countEphemeralUrls(project) > 0 && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                {countEphemeralUrls(project)} file(s) in this project are missing — re-upload them while signed in.
              </p>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

          {/* ── Clips Panel ─────────────────────────────────── */}
          {activePanel === 'clips' && (
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-sky-500/30 bg-[#151519] cursor-pointer transition-all group">
                <Upload className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition-colors" />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300">Upload Video</span>
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ''; }} />
              </label>

              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Clips ({project?.clips.length ?? 0})</p>
                {sortedClips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className={`w-full rounded-xl border px-3 py-2 mb-1.5 transition-all cursor-pointer ${
                      activeClipId === clip.id ? 'border-sky-500/40 bg-sky-500/10 text-sky-200' : 'border-white/[0.06] bg-[#151519] text-zinc-300 hover:border-white/[0.12]'}`}
                    onClick={() => setActiveClipId(clip.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
                        {clip.thumbnails[0] ? (
                          <img src={clip.thumbnails[0]} alt={clip.name} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{clip.name}</p>
                        <p className="text-[9px] text-zinc-500">{((clip.duration - clip.trimStart - clip.trimEnd) / clip.speed).toFixed(1)}s</p>
                      </div>
                      {clip.effect !== 'none' && <span className="text-[8px] px-1 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">{clip.effect}</span>}
                      <button onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }} className="p-1 rounded hover:bg-red-600 text-zinc-500 hover:text-white transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <button onClick={(e) => { e.stopPropagation(); reorderClip(clip.id, Math.max(0, index - 1)); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); reorderClip(clip.id, Math.min(sortedClips.length - 1, index + 1)); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); updateClip(clip.id, { muted: !clip.muted }); }} className={`text-[9px] px-1.5 py-0.5 rounded ${clip.muted ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800 text-zinc-400'}`}>
                        {clip.muted ? 'Muted' : 'Mute'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); updateClip(clip.id, { speed: Math.min(2, clip.speed + 0.25) }); }} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {clip.speed.toFixed(2)}x
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Stock Media</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STOCK_VIDEOS.map((v, i) => (
                    <button key={i} className="aspect-video rounded-lg overflow-hidden border border-white/[0.06] hover:border-sky-500/30 transition-all">
                      <img src={v.url} alt={v.label} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Photos & Overlay Panel ─────────────────────── */}
          {activePanel === 'photos' && (
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-sky-500/30 bg-[#151519] cursor-pointer transition-all group">
                <Upload className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition-colors" />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300">Upload Photo</span>
                <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }} />
              </label>

              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Stock Photos</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STOCK_PHOTOS.map((p, i) => (
                    <button key={i} onClick={() => handleStockPhoto(p.url)}
                      className="aspect-video rounded-lg overflow-hidden border border-white/[0.06] hover:border-sky-500/30 transition-all hover:scale-105 group"
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active photo overlays */}
              {(project?.stickerOverlays || []).filter(s => s.type === 'photo').length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Photo Overlays</p>
                  {(project?.stickerOverlays || []).filter(s => s.type === 'photo').map(s => (
                    <div key={s.id}
                      onClick={() => setActiveStickerOverlayId(s.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 cursor-pointer transition-all ${
                        activeStickerOverlayId === s.id
                          ? 'bg-teal-500/10 border border-teal-500/40'
                          : 'bg-[#151519] border border-white/[0.06] hover:border-white/[0.12]'
                      }`}>
                      <div className="w-10 h-7 rounded overflow-hidden bg-zinc-900 shrink-0">
                        <img src={s.content} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-400">Photo overlay</p>
                        <p className="text-[9px] text-zinc-600">{s.startTime.toFixed(1)}s – {s.endTime.toFixed(1)}s</p>
                      </div>
                      <Move className="w-3 h-3 text-zinc-600" />
                      <button onClick={(e) => { e.stopPropagation(); removeStickerOverlay(s.id); }} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-zinc-600 text-center">Photos are added as overlays. Drag on preview to reposition, adjust timing on timeline.</p>
            </div>
          )}

          {/* ── Text Panel ─────────────────────────────────── */}
          {activePanel === 'text' && (
            <div className="space-y-3">
              <button onClick={() => addTextOverlay()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/15 transition-colors">
                <Plus className="w-4 h-4" /> Add Text Overlay
              </button>
              {project?.textOverlays.map(t => (
                <div key={t.id} onClick={() => setActiveTextId(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                    activeTextId === t.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/[0.06] bg-[#151519] hover:border-white/[0.12]'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-200 font-medium truncate">{t.text}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeTextOverlay(t.id); }} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <span className="text-[10px] text-zinc-500">{t.startTime.toFixed(1)}s – {t.endTime.toFixed(1)}s</span>
                </div>
              ))}
              <p className="text-[10px] text-zinc-600 text-center pt-2">Drag text overlays on the timeline or preview to reposition</p>
            </div>
          )}

          {/* ── Filters Panel ─────────────────────────────── */}
          {activePanel === 'filters' && (
            <div className="space-y-3">
              {!activeClip ? (
                <p className="text-xs text-zinc-600 text-center py-8">Select a clip to apply filters</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium truncate max-w-[140px]">{activeClip.name}</span>
                    <button onClick={() => resetClipFilters(activeClip.id)} className="text-[10px] text-zinc-500 hover:text-sky-300 transition-colors">Reset</button>
                  </div>
                  {(Object.keys(DEFAULT_FILTERS) as (keyof VideoFilters)[]).map(key => {
                    const ranges: Record<keyof VideoFilters, [number, number]> = {
                      brightness: [0, 200], contrast: [0, 200], saturation: [0, 200],
                      blur: [0, 20], grayscale: [0, 100], sepia: [0, 100], hueRotate: [0, 360],
                    };
                    const [min, max] = ranges[key];
                    const value = activeClip.filters[key];
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="tabular-nums">{value}{key === 'blur' ? 'px' : key === 'hueRotate' ? 'deg' : '%'}</span>
                        </div>
                        <input type="range" min={min} max={max} value={value}
                          onChange={e => setClipFilter(activeClip.id, key, Number(e.target.value))}
                          className="w-full accent-sky-500" />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── Effects Panel ─────────────────────────────── */}
          {activePanel === 'effects' && (
            <div className="space-y-3">
              {!activeClip ? (
                <p className="text-xs text-zinc-600 text-center py-8">Select a clip to apply effects</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium truncate max-w-[140px]">{activeClip.name}</span>
                    <span className="text-[10px] text-zinc-500">Base: {activeClip.effect}</span>
                  </div>

                  {/* Base effect selector */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Base Effect</p>
                    {EFFECTS.map(eff => (
                      <button
                        key={eff.id}
                        onClick={() => setClipEffect(activeClip.id, eff.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-all ${
                          activeClip.effect === eff.id
                            ? 'border-violet-500/40 bg-violet-500/10'
                            : 'border-white/[0.06] bg-[#151519] hover:border-violet-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className={`w-3.5 h-3.5 ${activeClip.effect === eff.id ? 'text-violet-400' : 'text-zinc-500'}`} />
                          <div>
                            <p className={`text-xs font-medium ${activeClip.effect === eff.id ? 'text-violet-300' : 'text-zinc-200'}`}>{eff.label}</p>
                            <p className="text-[10px] text-zinc-500">{eff.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Effect stack */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Effect Stack</p>
                    {(activeClip.effectStack || []).length === 0 && (
                      <p className="text-[10px] text-zinc-600 text-center py-2">No stacked effects</p>
                    )}
                    {(activeClip.effectStack || []).map(layer => (
                      <div key={layer.id} className="px-2 py-2 rounded-lg bg-[#151519] border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateEffectInStack(activeClip.id, layer.id, { enabled: !layer.enabled })}
                            className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold shrink-0 ${layer.enabled ? 'bg-violet-500 text-white' : 'bg-zinc-700 text-zinc-500'}`}
                          >
                            {layer.enabled ? '✓' : '○'}
                          </button>
                          <span className="text-[11px] text-zinc-300 font-medium flex-1 capitalize">{layer.effect.replace('-', ' ')}</span>
                          <button onClick={() => removeEffectFromStack(activeClip.id, layer.id)} className="text-zinc-600 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 w-10">Intensity</span>
                          <input type="range" min={0} max={100} value={layer.intensity}
                            onChange={e => updateEffectInStack(activeClip.id, layer.id, { intensity: Number(e.target.value) })}
                            className="flex-1 accent-violet-500" />
                          <span className="text-[9px] text-zinc-400 tabular-nums w-6">{layer.intensity}</span>
                        </div>
                      </div>
                    ))}
                    <select
                      defaultValue=""
                      onChange={e => { if (e.target.value) { addEffectToStack(activeClip.id, e.target.value as ClipEffect); e.target.value = ''; } }}
                      className="w-full bg-[#151519] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-violet-500/30"
                    >
                      <option value="" disabled>+ Add effect to stack</option>
                      {EFFECTS.filter(e => e.id !== 'none').map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </div>

                  {/* Motion presets */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Motion Presets</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {MOTION_PRESETS.map(mp => (
                        <button key={mp.id} onClick={() => applyMotionPreset(activeClip.id, mp.id)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#151519] border border-white/[0.06] hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left">
                          <span className="text-sm leading-none">{mp.icon}</span>
                          <span className="text-[10px] text-zinc-300">{mp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Audio Panel ─────────────────────────────────── */}
          {activePanel === 'audio' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Background Music</p>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/[0.08] hover:border-sky-500/30 bg-[#151519] cursor-pointer transition-all group">
                  <Music className="w-4 h-4 text-zinc-500 group-hover:text-sky-400" />
                  <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300">Upload music</span>
                  <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(f); e.target.value = ''; }} />
                </label>
                {project?.backgroundMusic && (
                  <div
                    onClick={() => setActiveAudioTrackId(project.backgroundMusic!.id)}
                    className={`space-y-2 p-3 rounded-lg cursor-pointer transition-all ${
                      activeAudioTrackId === project.backgroundMusic.id
                        ? 'bg-emerald-500/10 border border-emerald-500/40'
                        : 'bg-[#151519] border border-emerald-500/20 hover:border-emerald-500/30'
                    }`}>
                    <div className="flex items-center gap-2">
                      <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-xs text-zinc-300 truncate flex-1">{project.backgroundMusic.name}</span>
                      {project.backgroundMusic.duration > 0 && (
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">{formatDuration(project.backgroundMusic.duration)}</span>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setBackgroundMusic(null); }} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Volume2 className="w-3 h-3 text-zinc-500 shrink-0" />
                      <input type="range" min={0} max={1} step={0.01}
                        value={project.backgroundMusic.volume ?? 0.8}
                        onChange={e => updateBackgroundMusic({ volume: parseFloat(e.target.value) })}
                        className="flex-1 accent-emerald-500" />
                      <span className="text-[9px] text-zinc-400 w-8 text-right tabular-nums">
                        {Math.round((project.backgroundMusic.volume ?? 0.8) * 100)}%
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-600">Click to edit in the properties panel. Drag on timeline to set start offset.</p>
                  </div>
                )}
              </div>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Audio Tracks</p>
                {project?.audioTracks.map(track => (
                  <div key={track.id}
                    onClick={() => setActiveAudioTrackId(track.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-all ${
                      activeAudioTrackId === track.id
                        ? 'border-violet-500/40 bg-violet-500/10'
                        : 'bg-[#151519] border border-white/[0.06] hover:border-white/[0.12]'
                    }`}>
                    <Volume2 className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="text-xs text-zinc-300 truncate flex-1">{track.name}</span>
                    {track.duration > 0 && (
                      <span className="text-[9px] text-zinc-500 font-mono shrink-0">{formatDuration(track.duration)}</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); removeAudioTrack(track.id); }} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Transitions Panel ───────────────────────────── */}
          {activePanel === 'transitions' && (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 mb-2">Clip Transitions</p>
              {project?.clips.map((clip) => (
                <div key={clip.id} className="space-y-1.5">
                  <p className="text-[11px] text-zinc-400 truncate">{clip.name.slice(0, 25)}</p>
                  <select value={clip.transitionIn}
                    onChange={e => updateClip(clip.id, { transitionIn: e.target.value as TransitionType })}
                    className="w-full bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500/40">
                    {TRANSITIONS.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* ── Subtitles Panel ─────────────────────────────── */}
          {activePanel === 'subtitles' && (
            <div className="space-y-3">
              <button onClick={() => addSubtitle()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/15 transition-colors">
                <Plus className="w-4 h-4" /> Add Subtitle
              </button>
              {project?.subtitles.map(sub => (
                <div key={sub.id} className="px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input value={sub.text} onChange={e => updateSubtitle(sub.id, { text: e.target.value })}
                      className="bg-transparent text-xs text-zinc-200 flex-1 focus:outline-none" placeholder="Subtitle text" />
                    <button onClick={() => removeSubtitle(sub.id)} className="text-zinc-600 hover:text-red-400 ml-2"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={sub.startTime} step={0.1} onChange={e => updateSubtitle(sub.id, { startTime: Number(e.target.value) })}
                      className="w-16 bg-[#1a1a1f] border border-white/[0.04] rounded px-1.5 py-0.5 text-[10px] text-zinc-300 tabular-nums" placeholder="Start" />
                    <input type="number" value={sub.endTime} step={0.1} onChange={e => updateSubtitle(sub.id, { endTime: Number(e.target.value) })}
                      className="w-16 bg-[#1a1a1f] border border-white/[0.04] rounded px-1.5 py-0.5 text-[10px] text-zinc-300 tabular-nums" placeholder="End" />
                    <select value={sub.style} onChange={e => updateSubtitle(sub.id, { style: e.target.value as CaptionStyle })}
                      className="flex-1 bg-[#1a1a1f] border border-white/[0.04] rounded px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {CAPTION_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              <AutoSubtitleDistributor />
            </div>
          )}

          {/* ── Stickers Panel ─────────────────────────────── */}
          {activePanel === 'stickers' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Emoji</p>
                <div className="grid grid-cols-5 gap-1">
                  {EMOJI_STICKERS.map(e => (
                    <button key={e} onClick={() => addStickerOverlay('emoji', e)}
                      className="h-9 flex items-center justify-center rounded-lg bg-[#151519] border border-white/[0.06] text-lg hover:bg-white/10 hover:border-white/20 transition-all">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Arrows</p>
                <div className="grid grid-cols-4 gap-1">
                  {ARROW_STICKERS.map(a => (
                    <button key={a} onClick={() => addStickerOverlay('arrow', a)}
                      className="h-9 flex items-center justify-center rounded-lg bg-[#151519] border border-white/[0.06] text-lg text-sky-300 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all font-bold">
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Shapes</p>
                <div className="grid grid-cols-4 gap-1">
                  {SHAPE_STICKERS.map(s => (
                    <button key={s} onClick={() => addStickerOverlay('shape', s)}
                      className="h-9 flex items-center justify-center rounded-lg bg-[#151519] border border-white/[0.06] text-lg text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Speech Bubbles</p>
                <div className="grid grid-cols-4 gap-1">
                  {BUBBLE_STICKERS.map(b => (
                    <button key={b} onClick={() => addStickerOverlay('speech-bubble', b)}
                      className="h-9 flex items-center justify-center rounded-lg bg-[#151519] border border-white/[0.06] text-lg text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              {(project?.stickerOverlays || []).length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Active Stickers</p>
                  {(project?.stickerOverlays || []).map(s => (
                    <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#151519] border border-white/[0.06] mb-1">
                      <span className="text-lg leading-none">{s.content}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-400">{s.type}</p>
                        <p className="text-[9px] text-zinc-600">{s.startTime.toFixed(1)}s – {s.endTime.toFixed(1)}s</p>
                      </div>
                      <Move className="w-3 h-3 text-zinc-600" />
                      <button onClick={() => removeStickerOverlay(s.id)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Markers Panel ──────────────────────────────── */}
          {activePanel === 'markers' && (
            <div className="space-y-3">
              <button
                onClick={() => addSceneMarker(currentTime, `Scene ${(project?.sceneMarkers || []).length + 1}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/15 transition-colors">
                <Plus className="w-4 h-4" /> Add Marker at {currentTime.toFixed(1)}s
              </button>

              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-zinc-500">Safe Zones Overlay</span>
                <button
                  onClick={() => setShowSafeZones(!showSafeZones)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${showSafeZones ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-transparent'}`}>
                  <ShieldCheck className="w-3 h-3" />
                  {showSafeZones ? 'ON' : 'OFF'}
                </button>
              </div>

              {(project?.sceneMarkers || []).length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">No scene markers yet</p>
              ) : (
                (project?.sceneMarkers || []).map(marker => (
                  <div key={marker.id} className="flex items-center gap-2 px-2 py-2 rounded-xl bg-[#151519] border border-white/[0.06]">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: marker.color }} />
                    <input
                      value={marker.label}
                      onChange={e => updateSceneMarker(marker.id, { label: e.target.value })}
                      className="flex-1 bg-transparent text-xs text-zinc-300 focus:outline-none min-w-0"
                    />
                    <span className="text-[9px] text-zinc-500 tabular-nums shrink-0">{marker.time.toFixed(1)}s</span>
                    <div className="flex gap-0.5">
                      {MARKER_COLORS.map(c => (
                        <button key={c} onClick={() => updateSceneMarker(marker.id, { color: c })}
                          className={`w-3 h-3 rounded-full transition-transform ${marker.color === c ? 'scale-125 ring-1 ring-white/50' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <button onClick={() => jumpToMarker(marker.id)} className="text-zinc-500 hover:text-sky-400 transition-colors"><Play className="w-3 h-3" /></button>
                    <button onClick={() => removeSceneMarker(marker.id)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Beats Panel ────────────────────────────────── */}
          {activePanel === 'beats' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Analyze Audio for Beats</p>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-amber-500/30 bg-[#151519] cursor-pointer transition-all group">
                  <Zap className="w-5 h-5 text-zinc-500 group-hover:text-amber-400" />
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300">
                    {isAnalyzingBeats ? 'Analyzing...' : 'Upload audio to detect beats'}
                  </span>
                  <input ref={beatAudioInputRef} type="file" accept="audio/*" className="hidden" disabled={isAnalyzingBeats}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleBeatAudioUpload(f); e.target.value = ''; }} />
                </label>
                {isAnalyzingBeats && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] text-amber-300">Detecting beats...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">Show Beat Markers</span>
                <button onClick={() => setShowBeatMarkers(!showBeatMarkers)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${showBeatMarkers ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                  {showBeatMarkers ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">Snap Clips to Beats</span>
                <button onClick={() => setSnapToBeats(!snapToBeats)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${snapToBeats ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                  {snapToBeats ? 'ON' : 'OFF'}
                </button>
              </div>

              {(project?.beatMarkers || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-zinc-500">{project!.beatMarkers.length} beats detected</p>
                    <button onClick={clearBeatMarkers} className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="flex items-end gap-px h-10 bg-[#151519] rounded-lg px-2 py-1">
                    {project!.beatMarkers.slice(0, 60).map((beat, i) => (
                      <div key={i} className="flex-1 bg-amber-400 rounded-sm opacity-80 min-w-px"
                        style={{ height: `${Math.max(10, beat.intensity * 100)}%` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Stats Panel ────────────────────────────────── */}
          {activePanel === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Duration" value={formatDuration(stats.totalDuration)} />
                <StatCard label="Clips" value={stats.clipCount} />
                <StatCard label="Text Layers" value={stats.textsAdded} />
                <StatCard label="Subtitles" value={stats.subtitleCount} />
              </div>

              <div className="bg-[#151519] border border-white/[0.06] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-sky-300">{stats.avgClipDuration.toFixed(1)}s</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Avg Clip Duration</p>
              </div>

              {stats.effectsUsed.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Effects Used</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.effectsUsed.map(e => (
                      <span key={e} className="text-[9px] px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20 font-medium capitalize">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {sortedClips.some(c => c.resolution) && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Clip Health</p>
                  <div className="space-y-1">
                    {sortedClips.map(clip => (
                      <div key={clip.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#151519] border border-white/[0.06]">
                        <div className="w-8 h-6 rounded overflow-hidden bg-zinc-900 shrink-0">
                          {clip.thumbnails[0] && <img src={clip.thumbnails[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-[9px] text-zinc-400 truncate flex-1">{clip.name}</span>
                        <HealthBadge value={clip.resolution} />
                        <HealthBadge value={clip.bitrate} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Presets Panel ──────────────────────────────── */}
          {activePanel === 'presets' && (
            <div className="space-y-4">
              {activeClip ? (
                <SavePresetButton clipId={activeClip.id} />
              ) : (
                <p className="text-[10px] text-zinc-600 text-center py-2">Select a clip to save its style as a preset</p>
              )}

              {stylePresets.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">No saved presets yet</p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Saved Presets</p>
                  {stylePresets.map(preset => (
                    <div key={preset.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#151519] border border-white/[0.06]">
                      <Package className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="text-xs text-zinc-200 flex-1 truncate">{preset.name}</span>
                      {activeClip && (
                        <button onClick={() => applyStylePreset(preset.id, activeClip.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors font-medium">
                          Apply
                        </button>
                      )}
                      <button onClick={() => removeStylePreset(preset.id)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Version History</p>
                  <button onClick={() => saveProjectVersion()}
                    className="text-[9px] px-2 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition-colors font-medium">
                    Save Now
                  </button>
                </div>
                {projectVersions.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 text-center py-2">No versions saved</p>
                ) : (
                  <div className="space-y-1">
                    {[...projectVersions].reverse().map(v => (
                      <div key={v.id} className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#151519] border border-white/[0.06]">
                        <RotateCcw className="w-3 h-3 text-zinc-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-zinc-300 truncate">{v.label}</p>
                          <p className="text-[9px] text-zinc-600">{new Date(v.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => restoreProjectVersion(v.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                          Restore
                        </button>
                      </div>
                    ))}
                    <button onClick={clearVersionHistory} className="w-full text-[10px] text-zinc-600 hover:text-red-400 transition-colors py-1 text-center">
                      Clear History
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Export Panel ───────────────────────────────── */}
          {activePanel === 'export' && (
            <div className="space-y-4">
              <button onClick={startExport} disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-all disabled:opacity-50">
                <Download className="w-5 h-5" />
                {isExporting ? `Exporting ${exportProgress}%` : 'Export Video'}
              </button>
              {isExporting && (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${exportProgress}%` }} />
                </div>
              )}

              <button onClick={() => addToExportQueue('WebM')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add to Export Queue
              </button>

              <div className="space-y-2 text-[11px] text-zinc-500">
                <p>Format: WebM (MediaRecorder)</p>
                <p>Resolution: {project?.aspectRatio === '16:9' ? '1920×1080' : project?.aspectRatio === '9:16' ? '1080×1920' : '1080×1080'} ({project?.aspectRatio === '16:9' ? 'Landscape' : project?.aspectRatio === '9:16' ? 'Portrait' : 'Square'})</p>
                <p>Clips: {project?.clips.length ?? 0}</p>
              </div>

              {exportQueue.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Export Queue</p>
                    <button onClick={clearExportQueue} className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors">Clear</button>
                  </div>
                  {exportQueue.map(item => (
                    <div key={item.id} className="px-3 py-2.5 rounded-xl bg-[#151519] border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-300 flex-1 truncate">{item.projectTitle}</span>
                        <ExportStatusBadge status={item.status} progress={item.progress} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-600">{item.format}</span>
                        {(item.status === 'exporting' || item.status === 'completed') && (
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
