import { useEffect, useState, type ReactNode } from 'react';
import { Trash2, Scissors, RotateCcw, Volume2, VolumeX, Gauge, Sparkles, Diamond, Layers, Activity, Zap, ArrowRightLeft, Move, Maximize2, Music, Film } from 'lucide-react';
import { useVideoStore, VideoFilters, DEFAULT_FILTERS, ClipEffect, TransitionType, Keyframe, VideoClip, TextOverlay, SubtitleEntry, MotionPreset, AudioTrack, StickerOverlay } from '../../store/videoStore';

const EFFECTS: { id: ClipEffect; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'shake', label: 'Shake' },
  { id: 'zoom-in', label: 'Zoom In' }, { id: 'zoom-out', label: 'Zoom Out' },
  { id: 'fade-in', label: 'Fade In' }, { id: 'fade-out', label: 'Fade Out' },
  { id: 'blur-in', label: 'Blur In' }, { id: 'blur-out', label: 'Blur Out' },
  { id: 'vhs', label: 'VHS' }, { id: 'glitch', label: 'Glitch' },
];

const TRANSITIONS: { id: TransitionType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'crossfade', label: 'Crossfade' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'wipe-left', label: 'Wipe Left' },
  { id: 'wipe-right', label: 'Wipe Right' },
];

const MOTION_PRESETS: { id: MotionPreset; label: string }[] = [
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'zoom-in', label: 'Zoom In' },
  { id: 'zoom-out', label: 'Zoom Out' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'elastic', label: 'Elastic' },
];

const FILTER_PRESETS: Array<{ name: string; filters: Partial<VideoFilters> }> = [
  { name: 'Natural', filters: {} },
  { name: 'Cinematic', filters: { contrast: 115, saturation: 85, brightness: 96 } },
  { name: 'Vintage', filters: { sepia: 35, contrast: 105, saturation: 75, brightness: 95 } },
  { name: 'Cold', filters: { saturation: 70, hueRotate: 190, brightness: 105 } },
  { name: 'Warm', filters: { saturation: 115, hueRotate: 10, brightness: 104 } },
];

function isFilterChanged(filters: VideoFilters, key: keyof VideoFilters): boolean {
  return filters[key] !== DEFAULT_FILTERS[key];
}

export default function VideoProperties() {
  const project = useVideoStore(s => s.project);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const activeTextId = useVideoStore(s => s.activeTextId);
  const activeSubtitleId = useVideoStore(s => s.activeSubtitleId);
  const activeAudioTrackId = useVideoStore(s => s.activeAudioTrackId);
  const activeStickerOverlayId = useVideoStore(s => s.activeStickerOverlayId);
  const activeClip = useVideoStore(s => s.project?.clips.find(c => c.id === s.activeClipId) ?? null);
  const bgm = project?.backgroundMusic ?? null;
  const isBackgroundMusicSelected = !!(bgm && activeAudioTrackId === bgm.id);
  const activeAudioTrack = isBackgroundMusicSelected
    ? bgm
    : project?.audioTracks.find(a => a.id === activeAudioTrackId) ?? null;
  const activeStickerOverlay = useVideoStore(s => s.project?.stickerOverlays.find(s => s.id === s.activeStickerOverlayId) ?? null);

  const hasSelection = activeClipId || activeTextId || activeSubtitleId || activeAudioTrackId || activeStickerOverlayId;

  if (!hasSelection) {
    return (
      <div className="w-64 bg-canvas-surface border-l border-panel-border p-6 flex items-center justify-center min-h-screen">
        <p className="text-theme-muted text-sm text-center">
          Select a clip, photo, text, subtitle, or audio track to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-canvas-surface border-l border-panel-border overflow-y-auto max-h-screen">
      {activeClipId && activeClip && (
        <ClipProperties clip={activeClip} />
      )}
      {activeTextId && project && (
        <TextOverlayProperties
          textOverlay={project.textOverlays.find(t => t.id === activeTextId) as TextOverlay | undefined}
        />
      )}
      {activeSubtitleId && project && (
        <SubtitleProperties
          subtitle={project.subtitles.find(s => s.id === activeSubtitleId) as SubtitleEntry | undefined}
        />
      )}
      {activeStickerOverlayId && activeStickerOverlay && (
        <StickerProperties sticker={activeStickerOverlay} />
      )}
      {activeAudioTrackId && activeAudioTrack && (
        <AudioTrackProperties track={activeAudioTrack} isBackgroundMusic={isBackgroundMusicSelected} />
      )}
    </div>
  );
}

interface ClipPropertiesProps {
  clip: VideoClip;
}

function ClipProperties({ clip }: ClipPropertiesProps) {
  const updateClip = useVideoStore(s => s.updateClip);
  const setClipFilter = useVideoStore(s => s.setClipFilter);
  const resetClipFilters = useVideoStore(s => s.resetClipFilters);
  const setClipEffect = useVideoStore(s => s.setClipEffect);
  const addKeyframe = useVideoStore(s => s.addKeyframe);
  const removeKeyframe = useVideoStore(s => s.removeKeyframe);
  const splitClip = useVideoStore(s => s.splitClip);
  const removeClip = useVideoStore(s => s.removeClip);
  const currentTime = useVideoStore(s => s.currentTime);
  const addEffectToStack = useVideoStore(s => s.addEffectToStack);
  const removeEffectFromStack = useVideoStore(s => s.removeEffectFromStack);
  const updateEffectInStack = useVideoStore(s => s.updateEffectInStack);
  const applyMotionPreset = useVideoStore(s => s.applyMotionPreset);

  const effectiveDuration = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;

  const handleNameChange = (newName: string) => {
    updateClip(clip.id, { name: newName });
  };

  const handleTrimStartChange = (value: number) => {
    const maxTrimStart = Math.max(0, clip.duration - clip.trimEnd - 0.1);
    updateClip(clip.id, { trimStart: Math.min(value, maxTrimStart) });
  };

  const handleTrimEndChange = (value: number) => {
    const maxTrimEnd = Math.max(0, clip.duration - clip.trimStart - 0.1);
    updateClip(clip.id, { trimEnd: Math.min(value, maxTrimEnd) });
  };

  const handleSpeedChange = (value: number) => {
    updateClip(clip.id, { speed: value });
  };

  const handleVolumeChange = (value: number) => {
    updateClip(clip.id, { volume: value });
  };

  const handleMuteToggle = () => {
    updateClip(clip.id, { muted: !clip.muted });
  };

  const handleFilterChange = (filter: keyof VideoFilters, value: number) => {
    setClipFilter(clip.id, filter, value);
  };

  const handleResetFilters = () => {
    resetClipFilters(clip.id);
  };

  const handleSplitClip = () => {
    // U9: Indicate split behavior
    splitClip(clip.id, effectiveDuration / 2);
  };

  const handleDeleteClip = () => {
    // S6: Add confirmation before destructive action
    if (window.confirm(`Delete clip "${clip.name}"? This cannot be undone.`)) {
      removeClip(clip.id);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* U16: Clip identification with thumbnail */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          {clip.thumbnails && clip.thumbnails.length > 0 ? (
            <img src={clip.thumbnails[0]} alt={clip.name} className="w-12 h-12 rounded object-cover border border-panel-border" />
          ) : (
            <div className="w-12 h-12 rounded bg-panel-light border border-panel-border flex items-center justify-center">
              <Film className="w-5 h-5 text-theme-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-theme-muted uppercase tracking-wider">Clip</p>
            <p className="text-sm font-semibold text-theme-primary truncate">{clip.name}</p>
            <p className="text-[9px] text-theme-muted">{clip.duration.toFixed(1)}s</p>
          </div>
        </div>
      </div>

      {/* Clip Name input */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Clip Name</h3>
        <input type="text" value={clip.name} onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
      </div>

      <SectionDivider />

      {/* Trim Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Trim</h3>
        <div className="space-y-3">
          <LabeledSlider label="Trim Start" value={clip.trimStart} max={clip.duration - clip.trimEnd} step={0.1}
            display={`${clip.trimStart.toFixed(2)}s`} onChange={handleTrimStartChange} />
          <LabeledSlider label="Trim End" value={clip.trimEnd} max={clip.duration - clip.trimStart} step={0.1}
            display={`${clip.trimEnd.toFixed(2)}s`} onChange={handleTrimEndChange} />
        </div>
      </div>

      <SectionDivider />

      {/* Playback Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Playback</h3>
        <div className="space-y-3">
          <LabeledSlider label="Speed" icon={<Gauge className="w-3 h-3" />} value={clip.speed} min={0.25} max={2} step={0.25}
            display={`${clip.speed.toFixed(2)}x`} onChange={handleSpeedChange} numberStep={0.25} />
          <div className="flex justify-between text-[9px] text-theme-dim">
            <span>0.5x</span><span>1x</span><span>1.5x</span><span>2x</span>
          </div>
          <LabeledSlider label="Volume" icon={<Volume2 className="w-3 h-3" />} value={clip.volume} min={0} max={1} step={0.01}
            display={`${Math.round(clip.volume * 100)}%`} onChange={handleVolumeChange} />
          <button onClick={handleMuteToggle}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
              clip.muted ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-panel-hover text-theme-secondary hover:bg-panel-hover'
            }`}>
            {clip.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {clip.muted ? 'Muted' : 'Unmuted'}
          </button>
        </div>
      </div>

      <SectionDivider />

      {/* Effect */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Effect
        </h3>
        <select value={clip.effect} onChange={e => setClipEffect(clip.id, e.target.value as ClipEffect)}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
          {EFFECTS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        {clip.effect !== 'none' && (
          <div className="space-y-2 pt-1">
            <div className="bg-panel-light border border-panel-border rounded p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-muted">Effect Duration</span>
                <span className="text-xs text-theme-primary font-mono">
                  {clip.effectDuration > 0 ? `${clip.effectDuration.toFixed(1)}s` : 'Full clip'}
                </span>
              </div>
              <input type="range" min={0} max={effectiveDuration} step={0.1}
                value={clip.effectDuration}
                onChange={e => updateClip(clip.id, { effectDuration: parseFloat(e.target.value) })}
                className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-theme-dim">
                <span>Full clip</span>
                <span>{effectiveDuration.toFixed(1)}s</span>
              </div>
              <p className="text-[10px] text-theme-muted">0 = applies for the entire clip duration</p>
            </div>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* Clip Transform / Overlay */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" /> Transform
        </h3>
        <div className="space-y-2">
          <select value={clip.overlayMode} onChange={e => updateClip(clip.id, { overlayMode: e.target.value as 'full' | 'overlay' })}
            className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
            <option value="full">Full Frame (with Pan/Crop)</option>
            <option value="overlay">Overlay / PIP</option>
          </select>
          <LabeledSlider label="Opacity" value={clip.opacity ?? 1} min={0} max={1} step={0.01}
            display={`${Math.round((clip.opacity ?? 1) * 100)}%`} onChange={v => updateClip(clip.id, { opacity: v })} />

          {/* Pan/Crop controls for full frame mode */}
          {clip.overlayMode === 'full' && (
            <div className="space-y-2 pt-1 text-[11px]">
              <LabeledSlider label="Scale" icon={<Maximize2 className="w-3 h-3" />} value={clip.scaleX} min={0.2} max={3} step={0.05}
                display={`${Math.round(clip.scaleX * 100)}%`} onChange={v => updateClip(clip.id, { scaleX: v, scaleY: v })} />
              <LabeledSlider label="Pan X" value={clip.offsetX} min={-50} max={50} step={1}
                display={`${Math.round(clip.offsetX)}%`} onChange={v => updateClip(clip.id, { offsetX: v })} />
              <LabeledSlider label="Pan Y" value={clip.offsetY} min={-50} max={50} step={1}
                display={`${Math.round(clip.offsetY)}%`} onChange={v => updateClip(clip.id, { offsetY: v })} />
              <button onClick={() => updateClip(clip.id, { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 })}
                className="w-full text-xs px-3 py-2 rounded bg-panel-hover border border-panel-border text-theme-secondary hover:bg-panel-hover transition-colors">
                Reset Transform
              </button>
            </div>
          )}

          {/* Overlay controls */}
          {clip.overlayMode === 'overlay' && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-theme-muted">Drag corners in preview to resize, drag border to reposition.</p>
              <LabeledSlider label="Scale X" icon={<Maximize2 className="w-3 h-3" />} value={clip.scaleX} min={0.1} max={2} step={0.05}
                display={`${(clip.scaleX * 100).toFixed(0)}%`} onChange={v => updateClip(clip.id, { scaleX: v })} />
              <LabeledSlider label="Scale Y" icon={<Maximize2 className="w-3 h-3" />} value={clip.scaleY} min={0.1} max={2} step={0.05}
                display={`${(clip.scaleY * 100).toFixed(0)}%`} onChange={v => updateClip(clip.id, { scaleY: v })} />
              <LabeledSlider label="Position X" icon={<Move className="w-3 h-3" />} value={clip.clipX} min={0} max={100} step={1}
                display={`${Math.round(clip.clipX)}%`} onChange={v => updateClip(clip.id, { clipX: v })} />
              <LabeledSlider label="Position Y" icon={<Move className="w-3 h-3" />} value={clip.clipY} min={0} max={100} step={1}
                display={`${Math.round(clip.clipY)}%`} onChange={v => updateClip(clip.id, { clipY: v })} />
              <button onClick={() => updateClip(clip.id, { scaleX: 1, scaleY: 1, clipX: 50, clipY: 50 })}
                className="w-full text-xs px-3 py-2 rounded bg-panel-hover border border-panel-border text-theme-secondary hover:bg-panel-hover transition-colors">
                Reset Position
              </button>
            </div>
          )}
        </div>
      </div>

      <SectionDivider />

      {/* Transition In */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" /> Transition In
        </h3>
        <select value={clip.transitionIn} onChange={e => updateClip(clip.id, { transitionIn: e.target.value as TransitionType })}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
          {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {clip.transitionIn !== 'none' && (
          <div className="bg-panel-light border border-panel-border rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-muted">Duration</span>
              <span className="text-xs text-theme-primary font-mono">{(clip.transitionDuration ?? 0.5).toFixed(1)}s</span>
            </div>
            <input type="range" min={0.1} max={Math.min(3, effectiveDuration * 0.5)} step={0.1}
              value={clip.transitionDuration ?? 0.5}
              onChange={e => updateClip(clip.id, { transitionDuration: parseFloat(e.target.value) })}
              className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-theme-dim">
              <span>0.1s</span>
              <span>{Math.min(3, effectiveDuration * 0.5).toFixed(1)}s max</span>
            </div>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* Transition Out */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" /> Transition Out
        </h3>
        <select value={clip.transitionOut} onChange={e => updateClip(clip.id, { transitionOut: e.target.value as TransitionType })}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
          {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {clip.transitionOut !== 'none' && (
          <div className="bg-panel-light border border-panel-border rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-muted">Duration</span>
              <span className="text-xs text-theme-primary font-mono">{(clip.transitionDuration ?? 0.5).toFixed(1)}s</span>
            </div>
            <input type="range" min={0.1} max={Math.min(3, effectiveDuration * 0.5)} step={0.1}
              value={clip.transitionDuration ?? 0.5}
              onChange={e => updateClip(clip.id, { transitionDuration: parseFloat(e.target.value) })}
              className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-theme-dim">
              <span>0.1s</span>
              <span>{Math.min(3, effectiveDuration * 0.5).toFixed(1)}s max</span>
            </div>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* Keyframes */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Diamond className="w-3.5 h-3.5 text-sky-400" /> Keyframes
        </h3>
        {(clip.keyframes ?? []).length === 0 ? (
          <p className="text-xs text-theme-dim">No keyframes. Add from the timeline or use the button below.</p>
        ) : (
          <div className="space-y-1">
            {(clip.keyframes ?? []).map((kf: Keyframe, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-theme-secondary bg-panel-light rounded px-2 py-1.5">
                <span className="text-sky-400 font-mono">{kf.property}</span>
                <span className="text-theme-muted">@{kf.time.toFixed(1)}s</span>
                <span className="text-theme-secondary">= {kf.value}</span>
                <button onClick={() => removeKeyframe(clip.id, kf.time, kf.property)}
                  className="ml-auto text-theme-dim hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            addKeyframe(clip.id, { time: currentTime, property: 'opacity', value: 1 });
          }}
          className="w-full text-xs px-3 py-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 hover:bg-sky-500/15 transition-colors"
        >
          Add opacity keyframe at playhead
        </button>
      </div>

      <SectionDivider />

      {/* Effect Stack */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-violet-400" /> Effect Stack
        </h3>
        {(clip.effectStack || []).length === 0 ? (
          <p className="text-xs text-theme-dim">No stacked effects.</p>
        ) : (
          <div className="space-y-1.5">
            {(clip.effectStack || []).map(layer => (
              <div key={layer.id} className="bg-panel-light border border-panel-border rounded p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateEffectInStack(clip.id, layer.id, { enabled: !layer.enabled })}
                    className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${layer.enabled ? 'bg-violet-500 text-white' : 'bg-panel-hover text-theme-muted'}`}
                  >{layer.enabled ? '✓' : '○'}</button>
                  <span className="text-xs text-theme-secondary flex-1 capitalize">{layer.effect.replace('-', ' ')}</span>
                  <button onClick={() => removeEffectFromStack(clip.id, layer.id)} className="text-theme-dim hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs text-theme-muted">Intensity</label>
                    <span className="text-xs text-theme-secondary">{layer.intensity}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={layer.intensity}
                    onChange={e => updateEffectInStack(clip.id, layer.id, { intensity: Number(e.target.value) })}
                    className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-violet-500" />
                </div>
              </div>
            ))}
          </div>
        )}
        <select
          defaultValue=""
          onChange={e => { if (e.target.value) { addEffectToStack(clip.id, e.target.value as ClipEffect); e.target.value = ''; } }}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500"
        >
          <option value="" disabled>+ Add to stack</option>
          {EFFECTS.filter(e => e.id !== 'none').map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      <SectionDivider />

      {/* Motion Presets */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Motion Presets
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {MOTION_PRESETS.map(mp => (
            <button key={mp.id} onClick={() => applyMotionPreset(clip.id, mp.id)}
              className="px-2 py-2 rounded bg-panel-light border border-panel-border text-xs text-theme-secondary hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/5 transition-all text-center">
              {mp.label}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Clip Health */}
      {(clip.resolution || clip.fps || clip.bitrate) && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Clip Health
            </h3>
            <div className="bg-panel-light border border-panel-border rounded p-3 space-y-1.5">
              {clip.resolution && (
                <div className="flex justify-between text-xs">
                  <span className="text-theme-muted">Resolution</span>
                  <span className={`font-medium ${clip.resolution.includes('⚠') ? 'text-amber-300' : 'text-emerald-300'}`}>{clip.resolution}</span>
                </div>
              )}
              {clip.fps && (
                <div className="flex justify-between text-xs">
                  <span className="text-theme-muted">FPS</span>
                  <span className="text-theme-secondary">{clip.fps}</span>
                </div>
              )}
              {clip.bitrate && (
                <div className="flex justify-between text-xs">
                  <span className="text-theme-muted">Bitrate</span>
                  <span className={`font-medium ${clip.bitrate.includes('⚠') ? 'text-amber-300' : 'text-theme-secondary'}`}>{clip.bitrate}</span>
                </div>
              )}
              {clip.codec && (
                <div className="flex justify-between text-xs">
                  <span className="text-theme-muted">Codec</span>
                  <span className="text-theme-secondary">{clip.codec}</span>
                </div>
              )}
            </div>
          </div>
          <SectionDivider />
        </>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Filters</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {FILTER_PRESETS.map(preset => (
            <button key={preset.name} onClick={() => { if (Object.keys(preset.filters).length === 0) resetClipFilters(clip.id); else Object.entries(preset.filters).forEach(([key, value]) => setClipFilter(clip.id, key as keyof VideoFilters, value as number)); }} className="rounded-lg border border-panel-border bg-panel-light px-2 py-1.5 text-left text-[10px] text-theme-secondary hover:border-sky-500/30 hover:text-sky-300">
              {preset.name}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {(Object.keys({ brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 }) as (keyof VideoFilters)[]).map(key => {
            const ranges: Record<keyof VideoFilters, [number, number]> = {
              brightness: [0, 200], contrast: [0, 200], saturation: [0, 200],
              blur: [0, 20], grayscale: [0, 100], sepia: [0, 100], hueRotate: [0, 360],
            };
            const [min, max] = ranges[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={`text-xs flex items-center gap-1 ${isFilterChanged(clip.filters, key) ? 'text-sky-300' : 'text-theme-muted'}`}>{key.replace(/([A-Z])/g, ' $1')}</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-theme-secondary">{clip.filters[key]}{key === 'blur' ? 'px' : key === 'hueRotate' ? 'deg' : '%'}</span>
                    {isFilterChanged(clip.filters, key) && <button onClick={() => setClipFilter(clip.id, key, DEFAULT_FILTERS[key])} className="text-theme-muted hover:text-sky-300" title={`Reset ${key}`}>↺</button>}
                  </div>
                </div>
                <input type="range" min={min} max={max} step={1} value={clip.filters[key]}
                  onChange={e => handleFilterChange(key, parseFloat(e.target.value))}
                  className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-sky-500" />
              </div>
            );
          })}
          <button onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-panel-hover hover:bg-panel-hover rounded text-sm font-medium text-theme-secondary transition">
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      </div>

      <SectionDivider />

      {/* Duration */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Duration</h3>
        <div className="bg-panel-light border border-panel-border rounded p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-theme-muted">Source:</span>
            <span className="text-theme-secondary">{clip.duration.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-theme-muted">Effective:</span>
            <span className="text-theme-secondary">{effectiveDuration.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={handleSplitClip}
          title="Split at midpoint (timeline splits at playhead)"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded text-sm font-medium text-white transition">
          <Scissors className="w-4 h-4" /> Split Clip at Midpoint
        </button>
        <button onClick={handleDeleteClip}
          title="Delete clip (Ctrl+Z to undo)"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition">
          <Trash2 className="w-4 h-4" /> Delete Clip
        </button>
      </div>

      <div className="pb-4" />
    </div>
  );
}

interface TextOverlayPropertiesProps {
  textOverlay?: TextOverlay;
}

function TextOverlayProperties({ textOverlay }: TextOverlayPropertiesProps) {
  const updateTextOverlay = useVideoStore(s => s.updateTextOverlay);
  const removeTextOverlay = useVideoStore(s => s.removeTextOverlay);

  if (!textOverlay) return null;

  // S3: Validate timing inputs
  const handleStartTimeChange = (value: number) => {
    const newValue = Math.max(0, parseFloat(String(value)) || 0);
    // Ensure start < end
    const validValue = Math.min(newValue, textOverlay.endTime);
    updateTextOverlay(textOverlay.id, { startTime: validValue });
  };

  const handleEndTimeChange = (value: number) => {
    const newValue = Math.max(0, parseFloat(String(value)) || 0);
    // Ensure end > start
    const validValue = Math.max(newValue, textOverlay.startTime);
    updateTextOverlay(textOverlay.id, { endTime: validValue });
  };

  const handleUpdate = (updates: Partial<TextOverlay>) => {
    updateTextOverlay(textOverlay.id, updates);
  };

  const handleDelete = () => {
    // S6: Add confirmation before destructive action
    if (window.confirm('Delete this text overlay? This cannot be undone.')) {
      removeTextOverlay(textOverlay.id);
    }
  };

  const fontFamilies = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact'];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Text Content</h3>
        <textarea value={textOverlay.text} onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500 resize-none"
          rows={3} placeholder="Enter text" />
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Font</h3>
        <div className="space-y-3">
          <select value={textOverlay.fontFamily} onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
            {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <LabeledSlider label="Font Size" value={textOverlay.fontSize} min={12} max={120} step={1}
            display={`${textOverlay.fontSize}px`} onChange={v => handleUpdate({ fontSize: v })} />
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Appearance</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Text Color</label>
            <input type="color" value={textOverlay.color} onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-full h-10 bg-panel-light border border-panel-border rounded cursor-pointer" />
          </div>
          <LabeledSlider label="Opacity" value={textOverlay.opacity} min={0} max={1} step={0.01}
            display={`${Math.round(textOverlay.opacity * 100)}%`} onChange={v => handleUpdate({ opacity: v })} />
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Background Color</label>
            <input type="color" value={textOverlay.backgroundColor} onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 bg-panel-light border border-panel-border rounded cursor-pointer" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Position</h3>
        <div className="space-y-3">
          <LabeledSlider label="X" value={textOverlay.x} min={0} max={100} step={1}
            display={`${Math.round(textOverlay.x)}%`} onChange={v => handleUpdate({ x: v })} />
          <LabeledSlider label="Y" value={textOverlay.y} min={0} max={100} step={1}
            display={`${Math.round(textOverlay.y)}%`} onChange={v => handleUpdate({ y: v })} />
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Timeline</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Start Time (seconds)</label>
            <input type="number" value={textOverlay.startTime} onChange={e => handleStartTimeChange(parseFloat(e.target.value))}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">End Time (seconds)</label>
            <input type="number" value={textOverlay.endTime} onChange={e => handleEndTimeChange(parseFloat(e.target.value))}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <button onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition">
        <Trash2 className="w-4 h-4" /> Delete Overlay
      </button>

      <p className="text-[10px] text-theme-dim text-center">Drag on the preview to reposition text</p>
      <div className="pb-4" />
    </div>
  );
}

interface SubtitlePropertiesProps {
  subtitle?: SubtitleEntry;
}

function SubtitleProperties({ subtitle }: SubtitlePropertiesProps) {
  const updateSubtitle = useVideoStore(s => s.updateSubtitle);
  const removeSubtitle = useVideoStore(s => s.removeSubtitle);

  if (!subtitle) return null;

  // S3: Validate timing inputs
  const handleStartTimeChange = (value: number) => {
    const newValue = Math.max(0, parseFloat(String(value)) || 0);
    // Ensure start < end
    const validValue = Math.min(newValue, subtitle.endTime);
    updateSubtitle(subtitle.id, { startTime: validValue });
  };

  const handleEndTimeChange = (value: number) => {
    const newValue = Math.max(0, parseFloat(String(value)) || 0);
    // Ensure end > start
    const validValue = Math.max(newValue, subtitle.startTime);
    updateSubtitle(subtitle.id, { endTime: validValue });
  };

  const handleUpdate = (updates: Partial<SubtitleEntry>) => {
    updateSubtitle(subtitle.id, updates);
  };

  const handleDelete = () => {
    // S6: Add confirmation before destructive action
    if (window.confirm('Delete this subtitle? This cannot be undone.')) {
      removeSubtitle(subtitle.id);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Text Content</h3>
        <textarea value={subtitle.text} onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500 resize-none"
          rows={3} placeholder="Enter subtitle text" />
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Timeline</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Start Time (seconds)</label>
            <input type="number" value={subtitle.startTime} onChange={e => handleStartTimeChange(parseFloat(e.target.value))}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">End Time (seconds)</label>
            <input type="number" value={subtitle.endTime} onChange={e => handleEndTimeChange(parseFloat(e.target.value))}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Style</h3>
        <select value={subtitle.style} onChange={e => handleUpdate({ style: e.target.value as typeof subtitle.style })}
          className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
          {['karaoke', 'pop-up', 'tiktok', 'minimal', 'bold-highlight'].map(s => (
            <option key={s} value={s}>{s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
          ))}
        </select>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Position</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {(['top', 'middle', 'bottom'] as const).map(pos => (
            <button
              key={pos}
              onClick={() => handleUpdate({ position: pos })}
              className={`px-2 py-2 rounded text-xs font-medium transition-all ${
                (subtitle.position ?? 'bottom') === pos
                  ? 'bg-sky-500 text-white'
                  : 'bg-panel-hover text-theme-muted hover:bg-panel-hover hover:text-theme-secondary'
              }`}
            >
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      <button onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition">
        <Trash2 className="w-4 h-4" /> Delete Subtitle
      </button>

      <div className="pb-4" />
    </div>
  );
}

interface StickerPropertiesProps {
  sticker: StickerOverlay;
}

function StickerProperties({ sticker }: StickerPropertiesProps) {
  const updateStickerOverlay = useVideoStore(s => s.updateStickerOverlay);
  const removeStickerOverlay = useVideoStore(s => s.removeStickerOverlay);
  const [aspectLock, setAspectLock] = useState(true);

  const handleUpdate = (updates: Partial<StickerOverlay>) => {
    updateStickerOverlay(sticker.id, updates);
  };

  const handleDelete = () => {
    removeStickerOverlay(sticker.id);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Photo Properties
        </h3>
        <div className="bg-panel-light border border-panel-border rounded p-3 space-y-2">
          {sticker.type === 'photo' && (
            <div className="w-full h-20 rounded overflow-hidden border border-panel-border bg-panel-hover">
              <img src={sticker.content} alt="Photo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-theme-muted">Type</span>
            <span className="text-theme-secondary capitalize">{sticker.type}</span>
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Scale & Transform</h3>
        <LabeledSlider label="Position X" icon={<Move className="w-3 h-3" />} value={sticker.x} min={0} max={100} step={1}
          display={`${Math.round(sticker.x)}%`} onChange={v => handleUpdate({ x: v })} />
        <LabeledSlider label="Position Y" icon={<Move className="w-3 h-3" />} value={sticker.y} min={0} max={100} step={1}
          display={`${Math.round(sticker.y)}%`} onChange={v => handleUpdate({ y: v })} />
        <LabeledSlider label="Scale" icon={<Maximize2 className="w-3 h-3" />} value={sticker.scale} min={0.1} max={5} step={0.1}
          display={`${(sticker.scale * 100).toFixed(0)}%`} onChange={v => handleUpdate({ scale: v })} />
        <label className="flex items-center gap-2 text-xs text-theme-muted">
          <input type="checkbox" checked={aspectLock} onChange={e => setAspectLock(e.target.checked)} />
          Lock photo aspect ratio
        </label>
        <LabeledSlider label="Rotation" icon={<RotateCcw className="w-3 h-3" />} value={sticker.rotation} min={0} max={360} step={5}
          display={`${sticker.rotation}°`} onChange={v => handleUpdate({ rotation: v })} />
        <LabeledSlider label="Opacity" icon={<Diamond className="w-3 h-3" />} value={sticker.opacity ?? 1} min={0} max={1} step={0.05}
          display={`${Math.round((sticker.opacity ?? 1) * 100)}%`} onChange={v => handleUpdate({ opacity: v })} />
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Timing</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Start Time</label>
            <input type="number" value={sticker.startTime.toFixed(2)} onChange={e => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">End Time</label>
            <input type="number" value={sticker.endTime.toFixed(2)} onChange={e => handleUpdate({ endTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Transitions</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Transition In</label>
            <select value={sticker.transitionIn ?? 'none'} onChange={e => handleUpdate({ transitionIn: e.target.value as TransitionType })}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
              {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Transition Out</label>
            <select value={sticker.transitionOut ?? 'none'} onChange={e => handleUpdate({ transitionOut: e.target.value as TransitionType })}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500">
              {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <LabeledSlider label="Duration" icon={<ArrowRightLeft className="w-3 h-3" />} value={sticker.transitionDuration ?? 0.5} min={0.1} max={2} step={0.1}
            display={`${(sticker.transitionDuration ?? 0.5).toFixed(2)}s`} onChange={v => handleUpdate({ transitionDuration: v })} />
        </div>
      </div>

      {sticker.type === 'photo' && (
        <>
          <SectionDivider />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-theme-primary">Filters</h3>
              <button
                onClick={() => handleUpdate({ photoFilters: { ...DEFAULT_FILTERS } })}
                className="text-[10px] text-theme-muted hover:text-sky-300 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2">
              {(Object.keys(DEFAULT_FILTERS) as (keyof VideoFilters)[]).map(key => {
                const ranges: Record<keyof VideoFilters, [number, number]> = {
                  brightness: [0, 200], contrast: [0, 200], saturation: [0, 200],
                  blur: [0, 20], grayscale: [0, 100], sepia: [0, 100], hueRotate: [0, 360],
                };
                const [min, max] = ranges[key];
                const filters = sticker.photoFilters ?? DEFAULT_FILTERS;
                const value = filters[key];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-theme-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <span className="text-xs text-theme-secondary">{value}{key === 'blur' ? 'px' : key === 'hueRotate' ? 'deg' : '%'}</span>
                    </div>
                    <input type="range" min={min} max={max} step={1} value={value}
                      onChange={e => handleUpdate({ photoFilters: { ...(sticker.photoFilters ?? DEFAULT_FILTERS), [key]: parseFloat(e.target.value) } })}
                      className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-sky-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <SectionDivider />

      <button onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-900/30 text-red-400 text-sm font-medium hover:bg-red-900/50 transition">
        <Trash2 className="w-4 h-4" /> Delete Photo
      </button>
      <p className="text-[10px] text-theme-muted text-center">
        Press <kbd className="px-1 py-0.5 rounded bg-panel-hover text-theme-muted">Del</kbd> to remove · Drag on preview to reposition
      </p>
    </div>
  );
}

interface AudioTrackPropertiesProps {
  track: AudioTrack;
  isBackgroundMusic?: boolean;
}

function AudioTrackProperties({ track, isBackgroundMusic = false }: AudioTrackPropertiesProps) {
  const updateAudioTrack = useVideoStore(s => s.updateAudioTrack);
  const updateBackgroundMusic = useVideoStore(s => s.updateBackgroundMusic);
  const removeAudioTrack = useVideoStore(s => s.removeAudioTrack);
  const setBackgroundMusic = useVideoStore(s => s.setBackgroundMusic);
  const splitAudioTrack = useVideoStore(s => s.splitAudioTrack);

  const handleUpdate = (updates: Partial<AudioTrack>) => {
    if (isBackgroundMusic) updateBackgroundMusic(updates);
    else updateAudioTrack(track.id, updates);
  };

  const handleSplit = () => {
    if (isBackgroundMusic) return;
    splitAudioTrack(track.id, track.duration / 2);
  };

  const handleDelete = () => {
    if (isBackgroundMusic) setBackgroundMusic(null);
    else removeAudioTrack(track.id);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-violet-400" /> {isBackgroundMusic ? 'Background Music' : 'Audio Track'}
        </h3>
        <div className="bg-panel-light border border-panel-border rounded p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-theme-muted">Name</span>
            <span className="text-theme-secondary truncate max-w-[120px]">{track.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-theme-muted">Duration</span>
            <span className="text-theme-secondary">{track.duration.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Volume</h3>
        <LabeledSlider label="Volume" icon={<Volume2 className="w-3 h-3" />} value={track.volume} min={0} max={1} step={0.01}
          display={`${Math.round(track.volume * 100)}%`} onChange={v => handleUpdate({ volume: v })} />
        <button onClick={() => handleUpdate({ muted: !track.muted })}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
            track.muted ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-panel-hover text-theme-secondary hover:bg-panel-hover'
          }`}>
          {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {track.muted ? 'Muted' : 'Unmuted'}
        </button>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-theme-primary">Timing</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-theme-muted">Start Offset (seconds)</label>
            <input type="number" value={track.startTime} onChange={e => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-panel-light border border-panel-border rounded text-theme-primary text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        {!isBackgroundMusic && (
          <button onClick={handleSplit}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded text-sm font-medium text-white transition">
            <Scissors className="w-4 h-4" /> Split Audio
          </button>
        )}
        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition">
          <Trash2 className="w-4 h-4" /> Delete {isBackgroundMusic ? 'Music' : 'Audio'}
        </button>
      </div>

      <p className="text-[10px] text-theme-muted text-center">
        Press <kbd className="px-1 py-0.5 rounded bg-panel-hover text-theme-muted">Del</kbd> to remove
        {!isBackgroundMusic && <> · <kbd className="px-1 py-0.5 rounded bg-panel-hover text-theme-muted">S</kbd> to split at playhead</>}
      </p>
      <div className="pb-4" />
    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────

function SectionDivider() {
  return <div className="border-b border-panel-border" />;
}

function LabeledSlider({ label, value, min = 0, max, step, display, onChange, icon, numberStep }: {
  label: string; value: number; min?: number; max: number; step: number;
  display: string; onChange: (v: number) => void; icon?: ReactNode; numberStep?: number;
}) {
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onChange(Math.max(min, Math.min(max, parsed)));
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-theme-muted flex items-center gap-1">{icon}{label}</label>
        <span className="text-xs text-theme-secondary">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-panel-hover rounded-lg appearance-none cursor-pointer accent-sky-500" />
      <input type="number" min={min} max={max} step={numberStep ?? step} value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={() => commit(localValue)}
        onKeyDown={e => { if (e.key === 'Enter') { commit(localValue); e.currentTarget.blur(); } }}
        className="w-full px-2 py-1 bg-panel-light border border-panel-border rounded text-xs text-theme-secondary focus:outline-none focus:border-sky-500/40" />
    </div>
  );
}
