import { Trash2, Scissors, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';
import { useVideoStore, VideoFilters } from '../../store/videoStore';

export default function VideoProperties() {
  const store = useVideoStore();
  const { project, activeClipId, activeTextId, activeSubtitleId } = store;
  const activeClip = store.getActiveClip();

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
        <ClipProperties clip={activeClip} store={store} />
      )}
      {activeTextId && project && (
        <TextOverlayProperties
          textOverlay={project.textOverlays.find(t => t.id === activeTextId)}
          store={store}
        />
      )}
      {activeSubtitleId && project && (
        <SubtitleProperties
          subtitle={project.subtitles.find(s => s.id === activeSubtitleId)}
          store={store}
        />
      )}
    </div>
  );
}

interface ClipPropertiesProps {
  clip: ReturnType<typeof useVideoStore>['getActiveClip'];
  store: ReturnType<typeof useVideoStore>;
}

function ClipProperties({ clip, store }: ClipPropertiesProps) {
  if (!clip) return null;

  const effectiveDuration =
    (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;

  const handleNameChange = (newName: string) => {
    store.updateClip(clip.id, { name: newName });
  };

  const handleTrimStartChange = (value: number) => {
    const maxTrimStart = Math.max(0, clip.duration - clip.trimEnd - 0.1);
    store.updateClip(clip.id, { trimStart: Math.min(value, maxTrimStart) });
  };

  const handleTrimEndChange = (value: number) => {
    const maxTrimEnd = Math.max(0, clip.duration - clip.trimStart - 0.1);
    store.updateClip(clip.id, { trimEnd: Math.min(value, maxTrimEnd) });
  };

  const handleSpeedChange = (value: number) => {
    store.updateClip(clip.id, { speed: value });
  };

  const handleVolumeChange = (value: number) => {
    store.updateClip(clip.id, { volume: value });
  };

  const handleMuteToggle = () => {
    store.updateClip(clip.id, { muted: !clip.muted });
  };

  const handleFilterChange = (filter: keyof VideoFilters, value: number) => {
    store.setClipFilter(clip.id, filter, value);
  };

  const handleResetFilters = () => {
    store.resetClipFilters(clip.id);
  };

  const handleSplitClip = () => {
    store.splitClip(clip.id, effectiveDuration / 2);
  };

  const handleDeleteClip = () => {
    store.removeClip(clip.id);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Clip Name Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Clip Name</h3>
        <input
          type="text"
          value={clip.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500 placeholder-zinc-600"
          placeholder="Clip name"
        />
      </div>

      <div className="border-b border-zinc-800" />

      {/* Trim Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Trim</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Trim Start</label>
              <span className="text-xs text-zinc-300">
                {clip.trimStart.toFixed(2)}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={clip.duration - clip.trimEnd}
              step="0.1"
              value={clip.trimStart}
              onChange={(e) => handleTrimStartChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Trim End</label>
              <span className="text-xs text-zinc-300">{clip.trimEnd.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max={clip.duration - clip.trimStart}
              step="0.1"
              value={clip.trimEnd}
              onChange={(e) => handleTrimEndChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Playback Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Playback</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                Speed
              </label>
              <span className="text-xs text-zinc-300">{clip.speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={clip.speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Volume
              </label>
              <span className="text-xs text-zinc-300">{Math.round(clip.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={clip.volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
          <button
            onClick={handleMuteToggle}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
              clip.muted
                ? 'bg-sky-500 text-white hover:bg-sky-600'
                : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            {clip.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {clip.muted ? 'Muted' : 'Unmuted'}
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Filters Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Filters</h3>
        <div className="space-y-3">
          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Brightness</label>
              <span className="text-xs text-zinc-300">{clip.filters.brightness}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={clip.filters.brightness}
              onChange={(e) =>
                handleFilterChange('brightness', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Contrast</label>
              <span className="text-xs text-zinc-300">{clip.filters.contrast}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={clip.filters.contrast}
              onChange={(e) =>
                handleFilterChange('contrast', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Saturation</label>
              <span className="text-xs text-zinc-300">{clip.filters.saturation}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={clip.filters.saturation}
              onChange={(e) =>
                handleFilterChange('saturation', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Blur */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Blur</label>
              <span className="text-xs text-zinc-300">{clip.filters.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={clip.filters.blur}
              onChange={(e) => handleFilterChange('blur', parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Grayscale</label>
              <span className="text-xs text-zinc-300">{clip.filters.grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={clip.filters.grayscale}
              onChange={(e) =>
                handleFilterChange('grayscale', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Sepia */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Sepia</label>
              <span className="text-xs text-zinc-300">{clip.filters.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={clip.filters.sepia}
              onChange={(e) => handleFilterChange('sepia', parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Hue Rotate */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Hue Rotate</label>
              <span className="text-xs text-zinc-300">{clip.filters.hueRotate}deg</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={clip.filters.hueRotate}
              onChange={(e) =>
                handleFilterChange('hueRotate', parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        <button
          onClick={handleResetFilters}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-medium text-zinc-200 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Duration Info */}
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

      <div className="border-b border-zinc-800" />

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleSplitClip}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded text-sm font-medium text-white transition"
        >
          <Scissors className="w-4 h-4" />
          Split Clip
        </button>
        <button
          onClick={handleDeleteClip}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete Clip
        </button>
      </div>

      <div className="pb-4" />
    </div>
  );
}

interface TextOverlayPropertiesProps {
  textOverlay?: ReturnType<typeof useVideoStore>['project']['textOverlays'][0];
  store: ReturnType<typeof useVideoStore>;
}

function TextOverlayProperties({ textOverlay, store }: TextOverlayPropertiesProps) {
  if (!textOverlay) return null;

  const handleUpdate = (updates: Partial<typeof textOverlay>) => {
    store.updateTextOverlay(textOverlay.id, updates);
  };

  const handleDelete = () => {
    store.removeTextOverlay(textOverlay.id);
  };

  const fontFamilies = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact', 'Comic Sans MS'];
  const fontWeights = ['300', '400', '500', '600', '700', '800', '900'];

  return (
    <div className="p-4 space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Text Content</h3>
        <textarea
          value={textOverlay.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500 placeholder-zinc-600 resize-none"
          rows={3}
          placeholder="Enter text"
        />
      </div>

      <div className="border-b border-zinc-800" />

      {/* Font Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Font</h3>
        <div className="space-y-3">
          {/* Font Family */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Font Family</label>
            <select
              value={textOverlay.fontFamily}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Font Size</label>
              <span className="text-xs text-zinc-300">{textOverlay.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="120"
              step="1"
              value={textOverlay.fontSize}
              onChange={(e) => handleUpdate({ fontSize: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Font Weight</label>
            <select
              value={textOverlay.fontWeight}
              onChange={(e) => handleUpdate({ fontWeight: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            >
              {fontWeights.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Color Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Appearance</h3>
        <div className="space-y-3">
          {/* Text Color */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Text Color</label>
            <input
              type="color"
              value={textOverlay.color}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded cursor-pointer"
            />
          </div>

          {/* Text Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Text Opacity</label>
              <span className="text-xs text-zinc-300">{Math.round(textOverlay.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={textOverlay.opacity}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Background Color */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Background Color</label>
            <input
              type="color"
              value={textOverlay.backgroundColor}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded cursor-pointer"
            />
          </div>

          {/* Background Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Background Opacity</label>
              <span className="text-xs text-zinc-300">
                {Math.round(textOverlay.backgroundOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={textOverlay.backgroundOpacity}
              onChange={(e) =>
                handleUpdate({ backgroundOpacity: parseFloat(e.target.value) })
              }
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Position Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Position</h3>
        <div className="space-y-3">
          {/* X Position */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">X Position</label>
              <span className="text-xs text-zinc-300">{Math.round(textOverlay.x)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={textOverlay.x}
              onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Y Position */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400">Y Position</label>
              <span className="text-xs text-zinc-300">{Math.round(textOverlay.y)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={textOverlay.y}
              onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Timeline Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Timeline</h3>
        <div className="space-y-3">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Start Time (seconds)</label>
            <input
              type="number"
              value={textOverlay.startTime}
              onChange={(e) => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">End Time (seconds)</label>
            <input
              type="number"
              value={textOverlay.endTime}
              onChange={(e) => handleUpdate({ endTime: parseFloat(e.target.value) || 0 })}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Delete Button */}
      <div className="space-y-2">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete Overlay
        </button>
      </div>

      <div className="pb-4" />
    </div>
  );
}

interface SubtitlePropertiesProps {
  subtitle?: ReturnType<typeof useVideoStore>['project']['subtitles'][0];
  store: ReturnType<typeof useVideoStore>;
}

function SubtitleProperties({ subtitle, store }: SubtitlePropertiesProps) {
  if (!subtitle) return null;

  const handleUpdate = (updates: Partial<typeof subtitle>) => {
    store.updateSubtitle(subtitle.id, updates);
  };

  const handleDelete = () => {
    store.removeSubtitle(subtitle.id);
  };

  const styles: Array<'karaoke' | 'pop-up' | 'tiktok' | 'minimal' | 'bold-highlight'> = [
    'karaoke',
    'pop-up',
    'tiktok',
    'minimal',
    'bold-highlight',
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Text Content</h3>
        <textarea
          value={subtitle.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500 placeholder-zinc-600 resize-none"
          rows={3}
          placeholder="Enter subtitle text"
        />
      </div>

      <div className="border-b border-zinc-800" />

      {/* Timeline Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Timeline</h3>
        <div className="space-y-3">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Start Time (seconds)</label>
            <input
              type="number"
              value={subtitle.startTime}
              onChange={(e) => handleUpdate({ startTime: parseFloat(e.target.value) || 0 })}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">End Time (seconds)</label>
            <input
              type="number"
              value={subtitle.endTime}
              onChange={(e) => handleUpdate({ endTime: parseFloat(e.target.value) || 0 })}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Style Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Style</h3>
        <select
          value={subtitle.style}
          onChange={(e) =>
            handleUpdate({ style: e.target.value as typeof subtitle.style })
          }
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-sky-500"
        >
          {styles.map((style) => (
            <option key={style} value={style}>
              {style.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="border-b border-zinc-800" />

      {/* Delete Button */}
      <div className="space-y-2">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium text-white transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete Subtitle
        </button>
      </div>

      <div className="pb-4" />
    </div>
  );
}
