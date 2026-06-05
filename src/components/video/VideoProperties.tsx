import { Trash2, Scissors, RotateCcw, Volume2, VolumeX, Gauge, Sparkles, Diamond } from 'lucide-react';
import { useVideoStore, VideoFilters, ClipEffect, Keyframe, VideoClip, TextOverlay, SubtitleEntry } from '../../store/videoStore';

const EFFECTS: { id: ClipEffect; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'shake', label: 'Shake' },
  { id: 'zoom-in', label: 'Zoom In' }, { id: 'zoom-out', label: 'Zoom Out' },
  { id: 'fade-in', label: 'Fade In' }, { id: 'fade-out', label: 'Fade Out' },
  { id: 'blur-in', label: 'Blur In' }, { id: 'blur-out', label: 'Blur Out' },
  { id: 'vhs', label: 'VHS' }, { id: 'glitch', label: 'Glitch' },
];

export default function VideoProperties() {
  const project = useVideoStore(s => s.project);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const activeTextId = useVideoStore(s => s.activeTextId);
  const activeSubtitleId = useVideoStore(s => s.activeSubtitleId);
  const activeClip = useVideoStore(s => s.project?.clips.find(c => c.id === s.activeClipId) ?? null);

  if (!activeClipId && !activeTextId && !activeSubtitleId) {
    return (
      <div className="w-64 bg-[#111115] border-l border-zinc-800 p-6 flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-sm text-center">
          Select a clip, text overlay, or subtitle to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#111115] border-l border-zinc-800 overflow-y-auto max-h-screen">
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
    splitClip(clip.id, effectiveDuration / 2);
  };

  const handleDeleteClip = () => {
    removeClip(clip.id);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Clip Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Clip Name</h3>
        <input type="text" value={clip.name} onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500" />
      </div>

      <SectionDivider />

      {/* Trim Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Trim</h3>
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
        <h3 className="text-sm font-semibold text-zinc-200">Playback</h3>
        <div className="space-y-3">
          <LabeledSlider label="Speed" icon={<Gauge className="w-3 h-3" />} value={clip.speed} min={0.25} max={2} step={0.25}
            display={`${clip.speed.toFixed(2)}x`} onChange={handleSpeedChange} />
          <LabeledSlider label="Volume" icon={<Volume2 className="w-3 h-3" />} value={clip.volume} min={0} max={1} step={0.01}
            display={`${Math.round(clip.volume * 100)}%`} onChange={handleVolumeChange} />
          <button onClick={handleMuteToggle}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
              clip.muted ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}>
            {clip.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {clip.muted ? 'Muted' : 'Unmuted'}
          </button>
        </div>
      </div>

      <SectionDivider />

      {/* Effect */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Effect
        </h3>
        <select value={clip.effect} onChange={e => setClipEffect(clip.id, e.target.value as ClipEffect)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500">
          {EFFECTS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      <SectionDivider />

      {/* Keyframes */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <Diamond className="w-3.5 h-3.5 text-sky-400" /> Keyframes
        </h3>
        {clip.keyframes.length === 0 ? (
          <p className="text-xs text-zinc-600">No keyframes. Add from the timeline or use the button below.</p>
        ) : (
          <div className="space-y-1">
            {clip.keyframes.map((kf: Keyframe, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 rounded px-2 py-1.5">
                <span className="text-sky-400 font-mono">{kf.property}</span>
                <span className="text-zinc-500">@{kf.time.toFixed(1)}s</span>
                <span className="text-zinc-300">= {kf.value}</span>
                <button onClick={() => removeKeyframe(clip.id, kf.time, kf.property)}
                  className="ml-auto text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
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

      {/* Filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Filters</h3>
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
                  <label className="text-xs text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <span className="text-xs text-zinc-300">{clip.filters[key]}{key === 'blur' ? 'px' : key === 'hueRotate' ? 'deg' : '%'}</span>
                </div>
                <input type="range" min={min} max={max} step={1} value={clip.filters[key]}
                  onChange={e => handleFilterChange(key, parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
              </div>
            );
          })}
          <button onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium text-zinc-200 transition">
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      </div>

      <SectionDivider />

      {/* Duration */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Duration</h3>
        <div className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Source:</span>
            <span className="text-zinc-300">{clip.duration.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Effective:</span>
            <span className="text-zinc-300">{effectiveDuration.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={handleSplitClip}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded text-sm font-medium text-white transition">
          <Scissors className="w-4 h-4" /> Split Clip
        </button>
        <button onClick={handleDeleteClip}
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

  const handleUpdate = (updates: Partial<TextOverlay>) => {
    updateTextOverlay(textOverlay.id, updates);
  };

  const handleDelete = () => {
    removeTextOverlay(textOverlay.id);
  };

  const fontFamilies = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact'];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Text Content</h3>
        <textarea value={textOverlay.text} onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500 resize-none"
          rows={3} placeholder="Enter text" />
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Font</h3>
        <div className="space-y-3">
          <select value={textOverlay.fontFamily} onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500">
            {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <LabeledSlider label="Font Size" value={textOverlay.fontSize} min={12} max={120} step={1}
            display={`${textOverlay.fontSize}px`} onChange={v => handleUpdate({ fontSize: v })} />
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Appearance</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Text Color</label>
            <input type="color" value={textOverlay.color} onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded cursor-pointer" />
          </div>
          <LabeledSlider label="Opacity" value={textOverlay.opacity} min={0} max={1} step={0.01}
            display={`${Math.round(textOverlay.opacity * 100)}%`} onChange={v => handleUpdate({ opacity: v })} />
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Background Color</label>
            <input type="color" value={textOverlay.backgroundColor} onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded cursor-pointer" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Position</h3>
        <div className="space-y-3">
          <LabeledSlider label="X" value={textOverlay.x} min={0} max={100} step={1}
            display={`${Math.round(textOverlay.x)}%`} onChange={v => handleUpdate({ x: v })} />
          <LabeledSlider label="Y" value={textOverlay.y} min={0} max={100} step={1}
            display={`${Math.round(textOverlay.y)}%`} onChange={v => handleUpdate({ y: v })} />
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Timeline</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Start Time (seconds)</label>
            <input type="number" value={textOverlay.startTime} onChange={e => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">End Time (seconds)</label>
            <input type="number" value={textOverlay.endTime} onChange={e => handleUpdate({ endTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <button onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition">
        <Trash2 className="w-4 h-4" /> Delete Overlay
      </button>

      <p className="text-[10px] text-zinc-600 text-center">Drag on the preview to reposition text</p>
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

  const handleUpdate = (updates: Partial<SubtitleEntry>) => {
    updateSubtitle(subtitle.id, updates);
  };

  const handleDelete = () => {
    removeSubtitle(subtitle.id);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Text Content</h3>
        <textarea value={subtitle.text} onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500 resize-none"
          rows={3} placeholder="Enter subtitle text" />
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Timeline</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Start Time (seconds)</label>
            <input type="number" value={subtitle.startTime} onChange={e => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">End Time (seconds)</label>
            <input type="number" value={subtitle.endTime} onChange={e => handleUpdate({ endTime: parseFloat(e.target.value) || 0 })}
              step={0.1} min={0}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      <SectionDivider />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Style</h3>
        <select value={subtitle.style} onChange={e => handleUpdate({ style: e.target.value as typeof subtitle.style })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500">
          {['karaoke', 'pop-up', 'tiktok', 'minimal', 'bold-highlight'].map(s => (
            <option key={s} value={s}>{s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
          ))}
        </select>
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

// ── Reusable sub-components ──────────────────────────────────────────

function SectionDivider() {
  return <div className="border-b border-zinc-800" />;
}

function LabeledSlider({ label, value, min = 0, max, step, display, onChange, icon }: {
  label: string; value: number; min?: number; max: number; step: number;
  display: string; onChange: (v: number) => void; icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-zinc-400 flex items-center gap-1">{icon}{label}</label>
        <span className="text-xs text-zinc-300">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500" />
    </div>
  );
}
