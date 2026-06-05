import { useState, useRef } from 'react';
import { Film, Type, Sliders, Volume2, Wand2, Download, Upload, Plus, Trash2, Music, Mic, ArrowLeft, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { useVideoStore, DEFAULT_FILTERS, VideoFilters, TransitionType, CaptionStyle, ClipEffect } from '../../store/videoStore';

type Panel = 'clips' | 'text' | 'filters' | 'effects' | 'audio' | 'transitions' | 'subtitles' | 'export';

const PANELS: { id: Panel; icon: React.ReactNode; label: string }[] = [
  { id: 'clips', icon: <Film className="w-4 h-4" />, label: 'Clips' },
  { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
  { id: 'filters', icon: <Sliders className="w-4 h-4" />, label: 'Filters' },
  { id: 'effects', icon: <Sparkles className="w-4 h-4" />, label: 'Effects' },
  { id: 'audio', icon: <Volume2 className="w-4 h-4" />, label: 'Audio' },
  { id: 'transitions', icon: <Wand2 className="w-4 h-4" />, label: 'Trans.' },
  { id: 'subtitles', icon: <Layers className="w-4 h-4" />, label: 'Subs' },
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

const STOCK_VIDEOS = [
  { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300', label: 'Team' },
  { url: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=300', label: 'Nature' },
  { url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=300', label: 'Office' },
  { url: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=300', label: 'City' },
  { url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=300', label: 'Forest' },
  { url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=300', label: 'Galaxy' },
];

export default function VideoSidebar() {
  const [activePanel, setActivePanel] = useState<Panel>('clips');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const {
    project, activeClipId, updateClip, addClip, removeClip, reorderClip,
    addTextOverlay, removeTextOverlay, updateTextOverlay,
    addSubtitle, removeSubtitle, updateSubtitle,
    setClipFilter, resetClipFilters, addAudioTrack, removeAudioTrack, setBackgroundMusic,
    setActiveClipId, setActiveTextId, activeTextId,
    updateProject, startExport, isExporting, exportProgress, setClipEffect,
  } = useVideoStore();

  const activeClip = project?.clips.find(c => c.id === activeClipId);
  const sortedClips = [...(project?.clips ?? [])].sort((a, b) => a.order - b.order);

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      addClip({ url, name: file.name, duration: video.duration, trimStart: 0, trimEnd: 0, volume: 1 });
    };
    video.src = url;
  };

  const handleAudioUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    addAudioTrack(url, file.name);
  };

  return (
    <aside className="flex h-full bg-[#0f0f12] border-r border-white/[0.06] shrink-0" style={{ width: 280 }}>
      {/* Icon rail */}
      <div className="flex flex-col items-center w-14 border-r border-white/[0.06] py-3 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mb-3">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {PANELS.map(p => (
          <button key={p.id} title={p.label} onClick={() => setActivePanel(p.id)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all text-xs gap-0.5
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
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* Clips Panel */}
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
                      activeClipId === clip.id ? 'border-sky-500/40 bg-sky-500/10 text-sky-200' : 'border-white/[0.06] bg-[#151519] text-zinc-300 hover:border-white/[0.12]'}
                    `}
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

          {/* Text Panel */}
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

          {/* Filters Panel */}
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

          {/* Effects Panel */}
          {activePanel === 'effects' && (
            <div className="space-y-2">
              {!activeClip ? (
                <p className="text-xs text-zinc-600 text-center py-8">Select a clip to apply effects</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium truncate max-w-[140px]">{activeClip.name}</span>
                    <span className="text-[10px] text-zinc-500">Current: {activeClip.effect}</span>
                  </div>
                  {EFFECTS.map(eff => (
                    <button
                      key={eff.id}
                      onClick={() => setClipEffect(activeClip.id, eff.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
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
                </>
              )}
            </div>
          )}

          {/* Audio Panel */}
          {activePanel === 'audio' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Background Music</p>
                <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/[0.08] hover:border-sky-500/30 bg-[#151519] cursor-pointer transition-all group">
                  <Music className="w-4 h-4 text-zinc-500 group-hover:text-sky-400" />
                  <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300">Upload music</span>
                  <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(f); e.target.value = ''; }} />
                </label>
                {project?.backgroundMusic && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06]">
                    <Mic className="w-3 h-3 text-sky-400" />
                    <span className="text-xs text-zinc-300 truncate flex-1">{project.backgroundMusic.name}</span>
                    <button onClick={() => setBackgroundMusic(null)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Audio Tracks</p>
                {project?.audioTracks.map(track => (
                  <div key={track.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06] mb-1">
                    <Volume2 className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="text-xs text-zinc-300 truncate flex-1">{track.name}</span>
                    <button onClick={() => removeAudioTrack(track.id)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transitions Panel */}
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

          {/* Subtitles Panel */}
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
            </div>
          )}

          {/* Export Panel */}
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
              <div className="space-y-2 text-[11px] text-zinc-500">
                <p>Format: WebM (MediaRecorder)</p>
                <p>Resolution: {project?.aspectRatio === '16:9' ? '1920×1080' : project?.aspectRatio === '9:16' ? '1080×1920' : '1080×1080'} ({project?.aspectRatio === '16:9' ? 'Landscape' : project?.aspectRatio === '9:16' ? 'Portrait' : 'Square'})</p>
                <p>Clips: {project?.clips.length ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
