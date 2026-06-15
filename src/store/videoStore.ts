import { create } from 'zustand';
import { saveToIndexedDB, loadFromIndexedDB } from '../lib/indexedDBStorage';

// ─── Types ────────────────────────────────────────────────────────

export type AspectRatio = '16:9' | '9:16' | '1:1';
export type TransitionType = 'none' | 'fade' | 'crossfade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'wipe-left' | 'wipe-right';
export type CaptionStyle = 'karaoke' | 'pop-up' | 'tiktok' | 'minimal' | 'bold-highlight';
export type ClipEffect = 'none' | 'shake' | 'zoom-in' | 'zoom-out' | 'fade-in' | 'fade-out' | 'blur-in' | 'blur-out' | 'vhs' | 'glitch';
export type MotionPreset = 'fade-in' | 'fade-out' | 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right' | 'bounce' | 'elastic';

export interface Keyframe {
  time: number;    // seconds from clip start
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity';
  value: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'bounce' | 'elastic';
}

export interface EffectLayer {
  id: string;
  effect: ClipEffect;
  intensity: number;  // 0-100
  enabled: boolean;
}

export interface VideoClip {
  id: string;
  name: string;
  url: string;           // object URL or data URL
  duration: number;       // total seconds of source
  trimStart: number;      // seconds from start
  trimEnd: number;        // seconds from end
  speed: number;          // 0.25 – 2
  volume: number;         // 0 – 1
  muted: boolean;
  filters: VideoFilters;
  transitionIn: TransitionType;
  transitionOut: TransitionType;
  transitionDuration: number;  // seconds, default 0.5
  effectDuration: number;      // seconds for in/out effects, default = full clip
  thumbnails: string[];   // data URLs of frame snapshots
  order: number;
  effect: ClipEffect;
  effectStack: EffectLayer[];
  keyframes: Keyframe[];
  // Clip transform (resize/position for overlay)
  scaleX: number;        // 0.1 – 2, default 1
  scaleY: number;        // 0.1 – 2, default 1
  clipX: number;         // percentage 0-100, default 50 (center)
  clipY: number;         // percentage 0-100, default 50 (center)
  overlayMode: 'full' | 'overlay';  // full = fill frame, overlay = positioned
  opacity: number;       // 0-1, default 1
  offsetX: number;       // pan/crop X offset as percentage -100 to 100, default 0
  offsetY: number;       // pan/crop Y offset as percentage -100 to 100, default 0
  // health data
  resolution?: string;
  bitrate?: string;
  fps?: number;
  codec?: string;
}

export interface VideoFilters {
  brightness: number;   // 0-200, default 100
  contrast: number;     // 0-200, default 100
  saturation: number;   // 0-200, default 100
  blur: number;         // 0-20px, default 0
  grayscale: number;    // 0-100%, default 0
  sepia: number;        // 0-100%, default 0
  hueRotate: number;    // 0-360deg, default 0
}

export const DEFAULT_FILTERS: VideoFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  opacity: number;
  x: number;             // percentage 0-100
  y: number;             // percentage 0-100
  startTime: number;     // seconds on timeline
  endTime: number;        // seconds on timeline
  backgroundColor: string;
  backgroundOpacity: number;
}

export interface StickerOverlay {
  id: string;
  type: 'emoji' | 'shape' | 'arrow' | 'speech-bubble' | 'photo';
  content: string;       // emoji char or SVG path key or image URL for photos
  x: number;             // percentage 0-100
  y: number;             // percentage 0-100
  scale: number;         // 0.1 - 5, default 1
  rotation: number;      // 0-360
  startTime: number;     // seconds on timeline
  endTime: number;        // seconds on timeline
  color: string;
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;
  transitionDuration?: number;  // seconds, default 0.5
  opacity?: number;      // 0-1, default 1
  photoFilters?: VideoFilters; // per-photo filters, only for type === 'photo'
}

export interface SubtitleEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: CaptionStyle;
  position?: 'top' | 'middle' | 'bottom';
}

export interface AudioTrack {
  id: string;
  url: string;
  name: string;
  volume: number;
  muted: boolean;
  startTime: number;
  duration: number;  // actual audio file duration in seconds
  waveform?: number[]; // optional precomputed waveform bars (normalized 0-1)
}

export interface SceneMarker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface BeatMarker {
  time: number;
  intensity: number;  // 0-1
}

export interface StylePreset {
  id: string;
  name: string;
  filters: VideoFilters;
  effect: ClipEffect;
  transitionIn: TransitionType;
  createdAt: string;
}

export interface ExportQueueItem {
  id: string;
  projectTitle: string;
  format: string;
  status: 'queued' | 'exporting' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface ProjectVersion {
  id: string;
  snapshot: string;    // JSON of VideoProject
  createdAt: string;
  label: string;
}

export interface VideoProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  clips: VideoClip[];
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  subtitles: SubtitleEntry[];
  audioTracks: AudioTrack[];
  backgroundMusic: AudioTrack | null;
  sceneMarkers: SceneMarker[];
  beatMarkers: BeatMarker[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoStoreState {
  project: VideoProject | null;
  activeClipId: string | null;
  activeTextId: string | null;
  activeSubtitleId: string | null;
  activeStickerOverlayId: string | null;
  activeAudioTrackId: string | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  loopPlayback: boolean;
  selectedClipIds: string[];
  rightPanel: 'clips' | 'filters' | 'text' | 'audio' | 'transitions' | 'subtitles' | 'export' | 'templates';
  history: string[];
  historyIndex: number;
  isExporting: boolean;
  exportProgress: number;
  // New state
  stylePresets: StylePreset[];
  exportQueue: ExportQueueItem[];
  projectVersions: ProjectVersion[];
  showSafeZones: boolean;
  showBeatMarkers: boolean;
  snapToBeats: boolean;
  isAnalyzingBeats: boolean;
}

export interface VideoStoreActions {
  // Project
  createProject: (title?: string) => void;
  updateProject: (updates: Partial<VideoProject>) => void;
  loadProject: (project: VideoProject) => void;
  exportProject: () => VideoProject | null;
  resetStore: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => Promise<void>;

  // Clips
  addClip: (clip: Omit<VideoClip, 'id' | 'order' | 'thumbnails' | 'filters' | 'transitionIn' | 'speed' | 'muted' | 'effect' | 'keyframes' | 'effectStack' | 'scaleX' | 'scaleY' | 'clipX' | 'clipY' | 'overlayMode' | 'transitionDuration' | 'effectDuration' | 'offsetX' | 'offsetY'> & { url: string; name: string; duration: number; trimStart?: number; trimEnd?: number; volume?: number }) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  reorderClip: (id: string, newIndex: number) => void;
  splitClip: (id: string, timeFromStart: number) => void;
  autoSplitClip: (id: string, intervalSeconds: number) => void;
  setClipFilter: (id: string, filter: keyof VideoFilters, value: number) => void;
  resetClipFilters: (id: string) => void;
  setClipEffect: (id: string, effect: ClipEffect) => void;
  addKeyframe: (id: string, keyframe: Keyframe) => void;
  removeKeyframe: (id: string, time: number, property: Keyframe['property']) => void;
  generateThumbnails: (id: string) => void;
  // Effect stack
  addEffectToStack: (clipId: string, effect: ClipEffect) => void;
  removeEffectFromStack: (clipId: string, effectId: string) => void;
  updateEffectInStack: (clipId: string, effectId: string, updates: Partial<EffectLayer>) => void;
  // Health
  analyzeClipHealth: (clipId: string) => void;
  // Motion presets
  applyMotionPreset: (clipId: string, preset: MotionPreset) => void;

  // Text overlays
  addTextOverlay: (text?: string) => void;
  removeTextOverlay: (id: string) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;

  // Stickers
  addStickerOverlay: (type: StickerOverlay['type'], content: string) => void;
  removeStickerOverlay: (id: string) => void;
  updateStickerOverlay: (id: string, updates: Partial<StickerOverlay>) => void;

  // Subtitles
  addSubtitle: (text?: string, start?: number, end?: number) => void;
  removeSubtitle: (id: string) => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleEntry>) => void;
  autoDistributeSubtitles: (texts: string[]) => void;

  // Audio
  addAudioTrack: (url: string, name: string) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  splitAudioTrack: (id: string, timeFromStart: number) => void;
  setBackgroundMusic: (track: AudioTrack | null) => void;
  updateBackgroundMusic: (updates: Partial<AudioTrack>) => void;

  // Scene markers
  addSceneMarker: (time: number, label: string, color?: string) => void;
  removeSceneMarker: (id: string) => void;
  updateSceneMarker: (id: string, updates: Partial<SceneMarker>) => void;
  jumpToMarker: (id: string) => void;

  // Beat detection
  analyzeBeatMarkers: (audioUrl: string) => void;
  clearBeatMarkers: () => void;
  setShowBeatMarkers: (show: boolean) => void;
  setSnapToBeats: (snap: boolean) => void;

  // Style presets
  saveStylePreset: (name: string, clipId: string) => void;
  applyStylePreset: (presetId: string, clipId: string) => void;
  removeStylePreset: (presetId: string) => void;

  // Export queue
  addToExportQueue: (format: string) => void;
  clearExportQueue: () => void;

  // Version history
  saveProjectVersion: (label?: string) => void;
  restoreProjectVersion: (versionId: string) => void;
  clearVersionHistory: () => void;

  // UI
  setShowSafeZones: (show: boolean) => void;

  // Playback
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setLoopPlayback: (loop: boolean) => void;

  // UI
  setActiveClipId: (id: string | null) => void;
  setActiveTextId: (id: string | null) => void;
  setActiveSubtitleId: (id: string | null) => void;
  setActiveStickerOverlayId: (id: string | null) => void;
  setActiveAudioTrackId: (id: string | null) => void;
  toggleClipSelection: (id: string) => void;
  clearClipSelection: () => void;
  removeSelectedClips: () => void;
  setRightPanel: (panel: VideoStoreState['rightPanel']) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Export
  startExport: (options?: { fps?: number; width?: number; height?: number; quality?: number }) => void;

  // Computed
  getTotalDuration: () => number;
  getClipAtTime: (globalTime: number) => { clip: VideoClip; clipStartTime: number; clipLocalTime: number } | null;
  getActiveClip: () => VideoClip | null;
  getProjectStats: () => {
    totalDuration: number;
    clipCount: number;
    effectsUsed: string[];
    textsAdded: number;
    avgClipDuration: number;
    subtitleCount: number;
  };
}

type VStore = VideoStoreState & VideoStoreActions;

const STORAGE_KEY = 'designforge_video_project';
const PRESETS_KEY = 'designforge_video_presets';
const VERSIONS_KEY = 'designforge_video_versions';
const EXPORT_QUEUE_KEY = 'designforge_export_queue';

function uid(): string {
  // S11: Use crypto.randomUUID for collision-resistant IDs
  return crypto.randomUUID();
}

function loadPresetsFromStorage(): StylePreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePresetsToStorage(presets: StylePreset[]) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch { /* quota */ }
}

function loadVersionsFromStorage(): ProjectVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveVersionsToStorage(versions: ProjectVersion[]) {
  try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions.slice(0, 20))); } catch { /* quota */ }
}

// Improved beat detection using decoded audio buffer, short-time energy, and peak picking.
// Returns an array of BeatMarker objects. Falls back to deterministic dummy beats when
// audio decoding is unavailable or fails.
async function detectBeats(audioUrl: string): Promise<BeatMarker[]> {
  try {
    const resp = await fetch(audioUrl);
    const ab = await resp.arrayBuffer();
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) throw new Error('AudioContext not available');

    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(ab);
    // Use first channel (mix to mono if more channels present)
    let data: Float32Array;
    if (buffer.numberOfChannels === 1) {
      data = buffer.getChannelData(0);
    } else {
      const ch0 = buffer.getChannelData(0);
      const ch1 = buffer.getChannelData(1);
      data = new Float32Array(Math.min(ch0.length, ch1.length));
      for (let i = 0; i < data.length; i++) data[i] = (ch0[i] + ch1[i]) * 0.5;
    }

    const sampleRate = buffer.sampleRate;
    // Short-time energy window ~32ms
    const win = Math.max(256, Math.floor(sampleRate * 0.032));
    const hop = Math.floor(win * 0.5);
    const energies: number[] = [];
    for (let i = 0; i + win < data.length; i += hop) {
      let s = 0;
      for (let j = i; j < i + win; j++) s += data[j] * data[j];
      energies.push(s / win);
    }

    // Smooth energies with moving average
    const smooth: number[] = [];
    const ma = 4;
    for (let i = 0; i < energies.length; i++) {
      let sum = 0;
      let count = 0;
      for (let k = -ma; k <= ma; k++) {
        const idx = i + k;
        if (idx >= 0 && idx < energies.length) { sum += energies[idx]; count++; }
      }
      smooth.push(sum / Math.max(1, count));
    }

    // dynamic threshold: mean + 0.8 * std
    const mean = smooth.reduce((a, b) => a + b, 0) / smooth.length || 0;
    const variance = smooth.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, smooth.length - 1);
    const std = Math.sqrt(variance);
    const threshold = mean + Math.max(std * 0.6, mean * 0.4);

    // Peak picking: local maxima above threshold
    const beats: BeatMarker[] = [];
    for (let i = 1; i < smooth.length - 1; i++) {
      if (smooth[i] > threshold && smooth[i] > smooth[i - 1] && smooth[i] >= smooth[i + 1]) {
        const time = (i * hop) / sampleRate;
        const intensity = Math.min(1, (smooth[i] - mean) / Math.max(1e-6, std * 3));
        beats.push({ time, intensity });
      }
    }

    // If no beats detected, fallback to light grid markers
    if (beats.length === 0) {
      const approx = Math.max(1, Math.floor(buffer.duration / 0.5));
      for (let i = 0; i < approx; i++) beats.push({ time: i * 0.5, intensity: 0.6 });
    }

    ctx.close();
    return beats;
  } catch (err) {
    // deterministic fallback: pseudo-random but stable sequence based on URL hash
    const seed = Array.from(audioUrl).reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
    const rng = (n: number) => {
      // xorshift-ish
      let x = (seed + n) >>> 0;
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      return (x >>> 0) / 4294967295;
    };
    const beats = Array.from({ length: 40 }, (_, i) => ({ time: i * 0.5, intensity: 0.5 + rng(i) * 0.5 }));
    return beats;
  }
}

// Extract a compact waveform summary (array of `barCount` normalized values 0..1)
async function extractWaveform(audioUrl: string, barCount = 200): Promise<number[]> {
  try {
    const resp = await fetch(audioUrl);
    const ab = await resp.arrayBuffer();
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) throw new Error('AudioContext not available');

    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(ab);
    const ch = buffer.numberOfChannels >= 2 ? 2 : 1;
    // mix down to mono
    const len = buffer.length;
    const mono = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      let sum = 0;
      for (let c = 0; c < ch; c++) sum += buffer.getChannelData(c)[i] || 0;
      mono[i] = sum / ch;
    }

    const blockSize = Math.floor(len / barCount) || 1;
    const bars: number[] = [];
    for (let b = 0; b < barCount; b++) {
      let max = 0;
      const start = b * blockSize;
      const end = Math.min(len, start + blockSize);
      for (let i = start; i < end; i++) {
        const v = Math.abs(mono[i]);
        if (v > max) max = v;
      }
      bars.push(max);
    }
    // normalize
    const maxVal = Math.max(...bars, 1e-6);
    const normalized = bars.map((v) => Math.min(1, v / maxVal));
    ctx.close();
    return normalized;
  } catch (err) {
    // fallback deterministic pseudo-waveform
    const seed = Array.from(audioUrl).reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
    const rng = (n: number) => {
      let x = (seed + n) >>> 0;
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      return (x >>> 0) / 4294967295;
    };
    return Array.from({ length: barCount }, (_, i) => 0.15 + rng(i) * 0.85);
  }
}

// Motion preset keyframe builders
function buildMotionKeyframes(preset: MotionPreset, clipDuration: number): Keyframe[] {
  const d = clipDuration;
  switch (preset) {
    case 'fade-in':
      return [
        { time: 0, property: 'opacity', value: 0, easing: 'ease-out' },
        { time: Math.min(1, d * 0.3), property: 'opacity', value: 1, easing: 'linear' },
      ];
    case 'fade-out':
      return [
        { time: Math.max(0, d * 0.7), property: 'opacity', value: 1, easing: 'ease-in' },
        { time: d, property: 'opacity', value: 0, easing: 'linear' },
      ];
    case 'zoom-in':
      return [
        { time: 0, property: 'scale', value: 0.7, easing: 'ease-out' },
        { time: Math.min(1.5, d * 0.4), property: 'scale', value: 1, easing: 'linear' },
      ];
    case 'zoom-out':
      return [
        { time: 0, property: 'scale', value: 1.3, easing: 'ease-out' },
        { time: Math.min(1.5, d * 0.4), property: 'scale', value: 1, easing: 'linear' },
      ];
    case 'slide-left':
      return [
        { time: 0, property: 'x', value: -100, easing: 'ease-out' },
        { time: Math.min(0.8, d * 0.3), property: 'x', value: 0, easing: 'linear' },
      ];
    case 'slide-right':
      return [
        { time: 0, property: 'x', value: 100, easing: 'ease-out' },
        { time: Math.min(0.8, d * 0.3), property: 'x', value: 0, easing: 'linear' },
      ];
    case 'bounce':
      return [
        { time: 0, property: 'scale', value: 0, easing: 'bounce' },
        { time: Math.min(0.6, d * 0.2), property: 'scale', value: 1.15, easing: 'ease-out' },
        { time: Math.min(1, d * 0.35), property: 'scale', value: 1, easing: 'linear' },
      ];
    case 'elastic':
      return [
        { time: 0, property: 'scale', value: 0, easing: 'elastic' },
        { time: Math.min(1, d * 0.4), property: 'scale', value: 1, easing: 'ease-out' },
      ];
    default:
      return [];
  }
}

export const useVideoStore = create<VStore>((set, get) => ({
  project: null,
  activeClipId: null,
  activeTextId: null,
  activeSubtitleId: null,
  activeStickerOverlayId: null,
  activeAudioTrackId: null,
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  loopPlayback: false,
  selectedClipIds: [],
  rightPanel: 'clips',
  history: [],
  historyIndex: -1,
  isExporting: false,
  exportProgress: 0,
  stylePresets: loadPresetsFromStorage(),
  exportQueue: (() => {
    try {
      const raw = localStorage.getItem(EXPORT_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })(),
  projectVersions: loadVersionsFromStorage(),
  showSafeZones: false,
  showBeatMarkers: false,
  snapToBeats: false,
  isAnalyzingBeats: false,

  // ─── Project ─────────────────────────────────────────────────────

  createProject: (title) => {
    const project: VideoProject = {
      id: `proj_${uid()}`,
      title: title || 'Untitled Video',
      aspectRatio: '16:9',
      clips: [],
      textOverlays: [],
      stickerOverlays: [],
      subtitles: [],
      audioTracks: [],
      backgroundMusic: null,
      sceneMarkers: [],
      beatMarkers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ project, history: [JSON.stringify(project)], historyIndex: 0, activeClipId: null, selectedClipIds: [], currentTime: 0, isPlaying: false });
  },

  updateProject: (updates) => {
    const { project } = get();
    if (!project) return;
    const next = { ...project, ...updates, updatedAt: new Date().toISOString() };
    set({ project: next });
    get().pushHistory();
  },

  loadProject: (project) => {
    // Migrate old projects that lack new fields
    const migrateAudioTrack = (t: any): AudioTrack => ({ ...t, duration: t.duration ?? 0 });
    const migrated: VideoProject = {
      ...project,
      stickerOverlays: project.stickerOverlays || [],
      sceneMarkers: project.sceneMarkers || [],
      beatMarkers: project.beatMarkers || [],
      audioTracks: (project.audioTracks || []).map(migrateAudioTrack),
      backgroundMusic: project.backgroundMusic ? migrateAudioTrack(project.backgroundMusic) : null,
      clips: project.clips.map(c => ({
        ...c,
        transitionDuration: (c as any).transitionDuration ?? 0.5,
        effectDuration: (c as any).effectDuration ?? 0,
        effect: c.effect || 'none',
        keyframes: c.keyframes || [],
        effectStack: c.effectStack || [],
        opacity: (c as any).opacity ?? 1,
      })),
      subtitles: (project.subtitles || []).map((s: any) => ({
        ...s,
        position: s.position ?? 'bottom',
      })),
    };
    set({
      project: migrated,
      activeClipId: migrated.clips[0]?.id ?? null,
      activeTextId: null,
      activeSubtitleId: null,
      activeStickerOverlayId: null,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1,
      history: [JSON.stringify(migrated)],
      historyIndex: 0,
      selectedClipIds: migrated.clips[0]?.id ? [migrated.clips[0].id] : [],
    });
  },

  exportProject: () => {
    return get().project;
  },

  resetStore: () => {
    set({
      project: null, activeClipId: null, activeTextId: null, activeSubtitleId: null,
      activeStickerOverlayId: null,
      currentTime: 0, isPlaying: false, playbackSpeed: 1, loopPlayback: false, selectedClipIds: [], rightPanel: 'clips',
      history: [], historyIndex: -1, isExporting: false, exportProgress: 0,
    });
  },

  saveToLocalStorage: () => {
    const { project } = get();
    if (!project) return;
    const serialized = JSON.stringify(project);
    try {
      saveToIndexedDB(STORAGE_KEY, project);
    } catch { /* quota exceeded */ }
    // Also save to localStorage as a lightweight fallback for migration
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch { /* quota exceeded */ }
  },

  loadFromLocalStorage: async () => {
    try {
      // Try IndexedDB first (primary storage)
      const data = await loadFromIndexedDB(STORAGE_KEY);
      if (data) {
        const project = data as VideoProject;
        const migratedClips = project.clips.map(clip => ({
          ...clip,
          effect: clip.effect || ('none' as ClipEffect),
          keyframes: clip.keyframes || ([] as Keyframe[]),
          effectStack: clip.effectStack || ([] as EffectLayer[]),
          transitionDuration: (clip as any).transitionDuration ?? 0.5,
          effectDuration: (clip as any).effectDuration ?? 0,
          scaleX: (clip as any).scaleX ?? 1,
          scaleY: (clip as any).scaleY ?? 1,
          clipX: (clip as any).clipX ?? 50,
          clipY: (clip as any).clipY ?? 50,
          overlayMode: (clip as any).overlayMode ?? 'full',
          opacity: (clip as any).opacity ?? 1,
          offsetX: (clip as any).offsetX ?? 0,
          offsetY: (clip as any).offsetY ?? 0,
        }));
        const migratedSubtitles = (project.subtitles || []).map((s: any) => ({
          ...s,
          position: s.position ?? 'bottom',
        }));
        const migratedProject: VideoProject = {
          ...project,
          stickerOverlays: project.stickerOverlays || [],
          sceneMarkers: project.sceneMarkers || [],
          beatMarkers: project.beatMarkers || [],
          clips: migratedClips,
          subtitles: migratedSubtitles,
        };
        const serialized = JSON.stringify(migratedProject);
        set({ project: migratedProject, history: [serialized], historyIndex: 0 });
        return;
      }
    } catch { /* IndexedDB error, fall through to localStorage */ }

    // Fallback: try localStorage for migration from older versions
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const project = JSON.parse(raw) as VideoProject;
        const migratedClips = project.clips.map(clip => ({
          ...clip,
          effect: clip.effect || ('none' as ClipEffect),
          keyframes: clip.keyframes || ([] as Keyframe[]),
          effectStack: clip.effectStack || ([] as EffectLayer[]),
          transitionDuration: (clip as any).transitionDuration ?? 0.5,
          effectDuration: (clip as any).effectDuration ?? 0,
          scaleX: (clip as any).scaleX ?? 1,
          scaleY: (clip as any).scaleY ?? 1,
          clipX: (clip as any).clipX ?? 50,
          clipY: (clip as any).clipY ?? 50,
          overlayMode: (clip as any).overlayMode ?? 'full',
          opacity: (clip as any).opacity ?? 1,
          offsetX: (clip as any).offsetX ?? 0,
          offsetY: (clip as any).offsetY ?? 0,
        }));
        const migratedSubtitles2 = (project.subtitles || []).map((s: any) => ({
          ...s,
          position: s.position ?? 'bottom',
        }));
        const migratedProject: VideoProject = {
          ...project,
          stickerOverlays: project.stickerOverlays || [],
          sceneMarkers: project.sceneMarkers || [],
          beatMarkers: project.beatMarkers || [],
          clips: migratedClips,
          subtitles: migratedSubtitles2,
        };
        set({ project: migratedProject, history: [raw], historyIndex: 0 });
        // Migrate to IndexedDB
        saveToIndexedDB(STORAGE_KEY, migratedProject);
      }
    } catch { /* parse error */ }
  },

  // ─── Clips ──────────────────────────────────────────────────────
  // load exportQueue from localStorage if present
  addToExportQueue: (format) => {
    const { project } = get();
    if (!project) return;
    const item: ExportQueueItem = {
      id: `export_${uid()}`,
      projectTitle: project.title,
      format,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    set(state => {
      const next = [...state.exportQueue, item];
      try { localStorage.setItem(EXPORT_QUEUE_KEY, JSON.stringify(next)); } catch {}
      return { exportQueue: next };
    });

    // Start simulated processing for UI responsiveness
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      set(state => ({
        exportQueue: state.exportQueue.map(q => q.id === item.id ? { ...q, status: 'exporting', progress: Math.min(99, Math.round(progress)) } : q),
      }));
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        set(state => {
          const next = state.exportQueue.map(q => q.id === item.id ? { ...q, status: 'completed', progress: 100, completedAt: new Date().toISOString() } : q);
          try { localStorage.setItem(EXPORT_QUEUE_KEY, JSON.stringify(next)); } catch {}
          return { exportQueue: next };
        });
      }
    }, 300);
  },

  clearExportQueue: () => {
    try { localStorage.removeItem(EXPORT_QUEUE_KEY); } catch {}
    set({ exportQueue: [] });
  },
  

  removeClip: (id) => {
    const { project, activeClipId } = get();
    if (!project) return;
    let clips = project.clips.filter(c => c.id !== id);
    clips.forEach((c, i) => { c.order = i; });
    set({
      project: { ...project, clips },
      activeClipId: activeClipId === id ? (clips[0]?.id ?? null) : activeClipId,
      selectedClipIds: (get().selectedClipIds || []).filter(selectedId => selectedId !== id),
    });
    get().pushHistory();
  },

  updateClip: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c => c.id === id ? { ...c, ...updates } : c);
    set({ project: { ...project, clips } });
  },

  reorderClip: (id, newIndex) => {
    const { project } = get();
    if (!project) return;
    // Sort by current order first so newIndex maps correctly to visual position
    const clips = [...project.clips].sort((a, b) => a.order - b.order);
    const oldIndex = clips.findIndex(c => c.id === id);
    if (oldIndex < 0) return;
    // S12: Validate newIndex is within bounds to prevent incorrect insertion
    if (newIndex < 0 || newIndex >= clips.length) return;
    const [moved] = clips.splice(oldIndex, 1);
    clips.splice(newIndex, 0, moved);
    clips.forEach((c, i) => { c.order = i; });
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  splitClip: (id, timeFromStart) => {
    const { project } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === id);
    if (!clip) return;
    const effectiveDuration = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;
    if (timeFromStart <= 0 || timeFromStart >= effectiveDuration) return;

    const splitPointInSource = clip.trimStart + timeFromStart * clip.speed;

    const left: VideoClip = {
      ...clip,
      id: `clip_${uid()}`,
      trimEnd: clip.duration - splitPointInSource,
      order: clip.order,
    };
    const right: VideoClip = {
      ...clip,
      id: `clip_${uid()}`,
      trimStart: splitPointInSource,
      order: clip.order + 1,
    };

    const clips = [...project.clips];
    const idx = clips.findIndex(c => c.id === id);
    // S10: Guard against findIndex returning -1 to prevent array corruption
    if (idx < 0) return;
    clips.splice(idx, 1, left, right);
    clips.forEach((c, i) => { c.order = i; });
    set({ project: { ...project, clips }, activeClipId: left.id, selectedClipIds: [left.id] });
    get().pushHistory();
    get().generateThumbnails(left.id);
    get().generateThumbnails(right.id);
  },

  autoSplitClip: (id, intervalSeconds) => {
    const { project } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === id);
    if (!clip) return;
    const effectiveDuration = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;
    const splitCount = Math.floor(effectiveDuration / intervalSeconds);
    if (splitCount < 1) return;

    let currentId = id;
    for (let i = splitCount - 1; i >= 1; i--) {
      get().splitClip(currentId, i * intervalSeconds);
    }
  },

  setClipFilter: (id, filter, value) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c =>
      c.id === id ? { ...c, filters: { ...c.filters, [filter]: value } } : c
    );
    set({ project: { ...project, clips } });
  },

  resetClipFilters: (id) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c =>
      c.id === id ? { ...c, filters: { ...DEFAULT_FILTERS } } : c
    );
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  setClipEffect: (id, effect) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c => c.id === id ? { ...c, effect } : c);
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  addKeyframe: (id, keyframe) => {
    const { project } = get();
    if (!project) return;
    // S14: Validate keyframe time is within clip duration and not negative
    const clip = project.clips.find(c => c.id === id);
    if (!clip) return;
    if (keyframe.time < 0 || keyframe.time > clip.duration) {
      console.warn(`Keyframe time ${keyframe.time} out of bounds for clip duration ${clip.duration}`);
      return;
    }
    const clips = project.clips.map(c => {
      if (c.id !== id) return c;
      const existing = c.keyframes.filter(k => !(k.time === keyframe.time && k.property === keyframe.property));
      return { ...c, keyframes: [...existing, keyframe].sort((a, b) => a.time - b.time) };
    });
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  removeKeyframe: (id, time, property) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c => {
      if (c.id !== id) return c;
      return { ...c, keyframes: c.keyframes.filter(k => !(k.time === time && k.property === property)) };
    });
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  generateThumbnails: (id) => {
    const { project } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === id);
    if (!clip) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    // S15: Wrap video.src assignment in try-catch to handle CORS/network errors
    try {
      video.src = clip.url;
    } catch (e) {
      console.error(`Failed to set video src: ${e}`);
      get().updateClip(id, { thumbnails: [] });
      return;
    }

    const thumbs: string[] = [];
    const thumbCount = Math.min(8, Math.max(2, Math.ceil(clip.duration / 2)));

    video.onloadedmetadata = () => {
      const interval = clip.duration / thumbCount;
      let currentIdx = 0;

      const captureFrame = () => {
        if (currentIdx >= thumbCount) {
          get().updateClip(id, { thumbnails: thumbs });
          return;
        }
        video.currentTime = Math.min(clip.trimStart + currentIdx * interval, video.duration - 0.1);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = Math.round(160 * (video.videoHeight / Math.max(1, video.videoWidth)));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
        }
        currentIdx++;
        captureFrame();
      };

      captureFrame();
    };

    video.onerror = (e) => {
      // S15: Log error for debugging thumbnail generation failures
      console.warn(`Video thumbnail generation failed: ${e}`);
      get().updateClip(id, { thumbnails: [] });
    };
  },

  addEffectToStack: (clipId, effect) => {
    const { project } = get();
    if (!project) return;
    const newLayer: EffectLayer = { id: `ef_${uid()}`, effect, intensity: 100, enabled: true };
    const clips = project.clips.map(c =>
      c.id === clipId ? { ...c, effectStack: [...(c.effectStack || []), newLayer] } : c
    );
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  removeEffectFromStack: (clipId, effectId) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c =>
      c.id === clipId ? { ...c, effectStack: (c.effectStack || []).filter(e => e.id !== effectId) } : c
    );
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  updateEffectInStack: (clipId, effectId, updates) => {
    const { project } = get();
    if (!project) return;
    const clips = project.clips.map(c =>
      c.id === clipId
        ? { ...c, effectStack: (c.effectStack || []).map(e => e.id === effectId ? { ...e, ...updates } : e) }
        : c
    );
    set({ project: { ...project, clips } });
  },

  analyzeClipHealth: (clipId) => {
    const { project } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === clipId);
    if (!clip) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = clip.url;
    video.onloadedmetadata = () => {
      const w = video.videoWidth;
      let quality: string;

      if (w >= 3840) { quality = '4K'; }
      else if (w >= 1920) { quality = '1080p'; }
      else if (w >= 1280) { quality = '720p'; }
      else if (w >= 854) { quality = '480p ⚠'; }
      else { quality = `${w}p ⚠`; }

      // Estimate bitrate from file size if possible
      const fps = 24; // default estimate

      get().updateClip(clipId, {
        resolution: quality,
        fps,
        codec: 'H.264',
        bitrate: w >= 1920 ? 'High' : w >= 1280 ? 'Medium' : 'Low ⚠',
      });
    };
  },

  applyMotionPreset: (clipId, preset) => {
    const { project } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === clipId);
    if (!clip) return;
    const effectiveDuration = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;
    const newKeyframes = buildMotionKeyframes(preset, effectiveDuration);
    // Merge, removing same property keyframes at same times
    const merged = [...clip.keyframes];
    for (const kf of newKeyframes) {
      const idx = merged.findIndex(k => k.time === kf.time && k.property === kf.property);
      if (idx >= 0) merged[idx] = kf;
      else merged.push(kf);
    }
    merged.sort((a, b) => a.time - b.time);
    const clips = project.clips.map(c => c.id === clipId ? { ...c, keyframes: merged } : c);
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  // ─── Text Overlays ────────────────────────────────────────────────

  addTextOverlay: (text) => {
    const { project, currentTime } = get();
    if (!project) return;
    const total = get().getTotalDuration();
    const overlay: TextOverlay = {
      id: `text_${uid()}`,
      text: text || 'Your text here',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: '600',
      color: '#ffffff',
      opacity: 1,
      x: 50,
      y: 50,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, total || currentTime + 3),
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
    };
    set({ project: { ...project, textOverlays: [...project.textOverlays, overlay] }, activeTextId: overlay.id });
    get().pushHistory();
  },

  removeTextOverlay: (id) => {
    const { project, activeTextId } = get();
    if (!project) return;
    set({
      project: { ...project, textOverlays: project.textOverlays.filter(t => t.id !== id) },
      activeTextId: activeTextId === id ? null : activeTextId,
    });
    get().pushHistory();
  },

  updateTextOverlay: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const textOverlays = project.textOverlays.map(t => t.id === id ? { ...t, ...updates } : t);
    set({ project: { ...project, textOverlays } });
  },

  // ─── Stickers ────────────────────────────────────────────────────

  addStickerOverlay: (type, content) => {
    const { project, currentTime } = get();
    if (!project) return;
    const total = get().getTotalDuration();
    const sticker: StickerOverlay = {
      id: `sticker_${uid()}`,
      type,
      content,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, total || currentTime + 5),
      color: '#ffffff',
      opacity: 1,
      ...(type === 'photo' ? { photoFilters: { ...DEFAULT_FILTERS } } : {}),
    };
    set({
      project: { ...project, stickerOverlays: [...(project.stickerOverlays || []), sticker] },
      activeStickerOverlayId: sticker.id,
      activeClipId: null,
      activeTextId: null,
      activeSubtitleId: null,
      activeAudioTrackId: null,
    });
    get().pushHistory();
  },

  removeStickerOverlay: (id) => {
    const { project, activeStickerOverlayId } = get();
    if (!project) return;
    set({
      project: { ...project, stickerOverlays: (project.stickerOverlays || []).filter(s => s.id !== id) },
      activeStickerOverlayId: activeStickerOverlayId === id ? null : activeStickerOverlayId,
    });
    get().pushHistory();
  },

  updateStickerOverlay: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const stickerOverlays = (project.stickerOverlays || []).map(s => s.id === id ? { ...s, ...updates } : s);
    set({ project: { ...project, stickerOverlays } });
  },

  // ─── Subtitles ───────────────────────────────────────────────────

  addSubtitle: (text, start, end) => {
    const { project, currentTime } = get();
    if (!project) return;
    const sub: SubtitleEntry = {
      id: `sub_${uid()}`,
      text: text || 'Subtitle text',
      startTime: start ?? currentTime,
      endTime: end ?? currentTime + 3,
      style: 'tiktok',
      position: 'bottom',
    };
    set({ project: { ...project, subtitles: [...project.subtitles, sub] }, activeSubtitleId: sub.id });
    get().pushHistory();
  },

  removeSubtitle: (id) => {
    const { project, activeSubtitleId } = get();
    if (!project) return;
    set({
      project: { ...project, subtitles: project.subtitles.filter(s => s.id !== id) },
      activeSubtitleId: activeSubtitleId === id ? null : activeSubtitleId,
    });
    get().pushHistory();
  },

  updateSubtitle: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const subtitles = project.subtitles.map(s => s.id === id ? { ...s, ...updates } : s);
    set({ project: { ...project, subtitles } });
  },

  autoDistributeSubtitles: (texts) => {
    const { project } = get();
    if (!project || texts.length === 0) return;
    const total = get().getTotalDuration();
    const segDuration = total / texts.length;
    const subtitles: SubtitleEntry[] = texts.map((text, i) => ({
      id: `sub_${uid()}`,
      text,
      startTime: i * segDuration,
      endTime: (i + 1) * segDuration,
      style: 'tiktok' as CaptionStyle,
      position: 'bottom' as const,
    }));
    set({ project: { ...project, subtitles: [...project.subtitles, ...subtitles] } });
    get().pushHistory();
  },

  // ─── Audio ───────────────────────────────────────────────────────

  addAudioTrack: (url, name) => {
    const { project } = get();
    if (!project) return;
    // Read actual duration before storing with timeout
    const tempAudio = new Audio(url);
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        // Proceed with 0 duration as fallback
        const track: AudioTrack = {
          id: `audio_${uid()}`,
          url,
          name,
          volume: 1,
          muted: false,
          startTime: 0,
          duration: 0,
        };
        const { project: p } = get();
        if (p) {
          set({ project: { ...p, audioTracks: [...p.audioTracks, track] } });
          get().pushHistory();
        }
        console.warn(`Audio track "${name}" loaded with unknown duration (timeout)`);
      }
    }, 8000);

    tempAudio.addEventListener('loadedmetadata', () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      const dur = isFinite(tempAudio.duration) && tempAudio.duration > 0 ? tempAudio.duration : 0;
      const track: AudioTrack = {
        id: `audio_${uid()}`,
        url,
        name,
        volume: 1,
        muted: false,
        startTime: 0,
        duration: dur,
      };
      const { project: p } = get();
      if (!p) return;
      set({ project: { ...p, audioTracks: [...p.audioTracks, track] } });
      get().pushHistory();
    }, { once: true });
    tempAudio.addEventListener('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.warn(`Failed to load audio track "${name}"`);
      }
    }, { once: true });
    tempAudio.load();
  },

  removeAudioTrack: (id) => {
    const { project, activeAudioTrackId } = get();
    if (!project) return;
    set({
      project: { ...project, audioTracks: project.audioTracks.filter(a => a.id !== id) },
      activeAudioTrackId: activeAudioTrackId === id ? null : activeAudioTrackId,
    });
    get().pushHistory();
  },

  splitAudioTrack: (id, timeFromStart) => {
    const { project } = get();
    if (!project) return;
    const track = project.audioTracks.find(a => a.id === id);
    if (!track || timeFromStart <= 0 || timeFromStart >= track.duration) return;
    const first: AudioTrack = { ...track, duration: timeFromStart };
    const second: AudioTrack = {
      ...track,
      id: `audio_${uid()}`,
      name: `${track.name} (split)`,
      startTime: track.startTime + timeFromStart,
      duration: track.duration - timeFromStart,
    };
    const audioTracks = project.audioTracks.map(a => a.id === id ? first : a);
    audioTracks.push(second);
    set({ project: { ...project, audioTracks } });
    get().pushHistory();
  },

  updateAudioTrack: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const audioTracks = project.audioTracks.map(a => a.id === id ? { ...a, ...updates } : a);
    set({ project: { ...project, audioTracks } });
  },

  setBackgroundMusic: (track) => {
    const { project, activeAudioTrackId } = get();
    if (!project) return;
    const wasBgmSelected = project.backgroundMusic?.id === activeAudioTrackId;
    set({
      project: { ...project, backgroundMusic: track },
      ...(track
        ? {
            activeAudioTrackId: track.id,
            activeClipId: null,
            activeTextId: null,
            activeSubtitleId: null,
            activeStickerOverlayId: null,
          }
        : wasBgmSelected ? { activeAudioTrackId: null } : {}),
    });
    get().pushHistory();
  },

  updateBackgroundMusic: (updates) => {
    const { project } = get();
    if (!project?.backgroundMusic) return;
    set({ project: { ...project, backgroundMusic: { ...project.backgroundMusic, ...updates } } });
  },

  // ─── Scene Markers ─────────────────────────────────────────────

  addSceneMarker: (time, label, color = '#f59e0b') => {
    const { project } = get();
    if (!project) return;
    const marker: SceneMarker = { id: `marker_${uid()}`, time, label, color };
    const sceneMarkers = [...(project.sceneMarkers || []), marker].sort((a, b) => a.time - b.time);
    set({ project: { ...project, sceneMarkers } });
    get().pushHistory();
  },

  removeSceneMarker: (id) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, sceneMarkers: (project.sceneMarkers || []).filter(m => m.id !== id) } });
    get().pushHistory();
  },

  updateSceneMarker: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const sceneMarkers = (project.sceneMarkers || []).map(m => m.id === id ? { ...m, ...updates } : m);
    set({ project: { ...project, sceneMarkers } });
  },

  jumpToMarker: (id) => {
    const { project } = get();
    const marker = (project?.sceneMarkers || []).find(m => m.id === id);
    if (marker) get().setCurrentTime(marker.time);
  },

  // ─── Beat Detection ────────────────────────────────────────────

  analyzeBeatMarkers: async (audioUrl) => {
    set({ isAnalyzingBeats: true });
    try {
      const [beats, waveform] = await Promise.all([detectBeats(audioUrl), extractWaveform(audioUrl, 160)]);
      const { project } = get();
      if (project) {
        // attach waveform to matching audio track or backgroundMusic when possible
        let updatedProject = { ...project, beatMarkers: beats } as VideoProject;
        if (project.backgroundMusic && project.backgroundMusic.url === audioUrl) {
          updatedProject = { ...updatedProject, backgroundMusic: { ...project.backgroundMusic, waveform } };
        } else {
          const updatedTracks = (project.audioTracks || []).map(t => t.url === audioUrl ? { ...t, waveform } : t);
          updatedProject = { ...updatedProject, audioTracks: updatedTracks };
        }
        set({ project: updatedProject, showBeatMarkers: true });
      }
    } finally {
      set({ isAnalyzingBeats: false });
    }
  },

  clearBeatMarkers: () => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, beatMarkers: [] } });
  },

  setShowBeatMarkers: (show) => set({ showBeatMarkers: show }),
  setSnapToBeats: (snap) => set({ snapToBeats: snap }),

  // ─── Style Presets ─────────────────────────────────────────────

  saveStylePreset: (name, clipId) => {
    const { project, stylePresets } = get();
    if (!project) return;
    const clip = project.clips.find(c => c.id === clipId);
    if (!clip) return;
    const preset: StylePreset = {
      id: `preset_${uid()}`,
      name,
      filters: { ...clip.filters },
      effect: clip.effect,
      transitionIn: clip.transitionIn,
      createdAt: new Date().toISOString(),
    };
    const updated = [...stylePresets, preset];
    set({ stylePresets: updated });
    savePresetsToStorage(updated);
  },

  applyStylePreset: (presetId, clipId) => {
    const { project, stylePresets } = get();
    if (!project) return;
    const preset = stylePresets.find(p => p.id === presetId);
    if (!preset) return;
    const clips = project.clips.map(c =>
      c.id === clipId
        ? { ...c, filters: { ...preset.filters }, effect: preset.effect, transitionIn: preset.transitionIn }
        : c
    );
    set({ project: { ...project, clips } });
    get().pushHistory();
  },

  removeStylePreset: (presetId) => {
    const updated = get().stylePresets.filter(p => p.id !== presetId);
    set({ stylePresets: updated });
    savePresetsToStorage(updated);
  },

  // ─── Export Queue ─────────────────────────────────────────────

  addToExportQueue: (format) => {
    const { project } = get();
    if (!project) return;
    const item: ExportQueueItem = {
      id: `export_${uid()}`,
      projectTitle: project.title,
      format,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ exportQueue: [...state.exportQueue, item] }));

    // Simulate export
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        set(state => ({
          exportQueue: state.exportQueue.map(q =>
            q.id === item.id ? { ...q, status: 'completed', progress: 100, completedAt: new Date().toISOString() } : q
          ),
        }));
      } else {
        set(state => ({
          exportQueue: state.exportQueue.map(q =>
            q.id === item.id ? { ...q, status: 'exporting', progress: Math.round(progress) } : q
          ),
        }));
      }
    }, 300);
  },

  clearExportQueue: () => set({ exportQueue: [] }),

  // ─── Version History ──────────────────────────────────────────

  saveProjectVersion: (label) => {
    const { project, projectVersions } = get();
    if (!project) return;
    const version: ProjectVersion = {
      id: `v_${uid()}`,
      snapshot: JSON.stringify(project),
      createdAt: new Date().toISOString(),
      label: label || `Version ${projectVersions.length + 1}`,
    };
    const updated = [...projectVersions, version].slice(-20); // keep last 20
    set({ projectVersions: updated });
    saveVersionsToStorage(updated);
  },

  restoreProjectVersion: (versionId) => {
    const { projectVersions } = get();
    const version = projectVersions.find(v => v.id === versionId);
    if (!version) return;
    try {
      const project = JSON.parse(version.snapshot) as VideoProject;
      get().loadProject(project);
    } catch { /* parse error */ }
  },

  clearVersionHistory: () => {
    set({ projectVersions: [] });
    saveVersionsToStorage([]);
  },

  // ─── UI ──────────────────────────────────────────────────────────

  setShowSafeZones: (show) => set({ showSafeZones: show }),

  toggleClipSelection: (id) => {
    const { selectedClipIds } = get();
    const exists = selectedClipIds.includes(id);
    set({ selectedClipIds: exists ? selectedClipIds.filter(selectedId => selectedId !== id) : [...selectedClipIds, id] });
  },
  clearClipSelection: () => set({ selectedClipIds: [] }),
  removeSelectedClips: () => {
    const { project, selectedClipIds } = get();
    if (!project || selectedClipIds.length === 0) return;
    const selected = new Set(selectedClipIds);
    const clips = project.clips.filter(c => !selected.has(c.id));
    clips.forEach((c, i) => { c.order = i; });
    set({
      project: { ...project, clips },
      activeClipId: clips[0]?.id ?? null,
      selectedClipIds: [],
    });
    get().pushHistory();
  },

  // ─── Playback ────────────────────────────────────────────────────

  setCurrentTime: (time) => {
    const total = get().getTotalDuration();
    const next = total > 0 ? Math.max(0, Math.min(total, time)) : Math.max(0, time);
    set({ currentTime: next });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0.25, Math.min(2, speed)) }),
  setLoopPlayback: (loop) => set({ loopPlayback: loop }),

  // ─── UI ──────────────────────────────────────────────────────────

  setActiveClipId: (id) => set({ activeClipId: id, activeTextId: null, activeSubtitleId: null, activeStickerOverlayId: null, activeAudioTrackId: null }),
  setActiveTextId: (id) => set({ activeTextId: id, activeClipId: null, activeSubtitleId: null, activeStickerOverlayId: null, activeAudioTrackId: null, selectedClipIds: [] }),
  setActiveSubtitleId: (id) => set({ activeSubtitleId: id, activeClipId: null, activeTextId: null, activeStickerOverlayId: null, activeAudioTrackId: null, selectedClipIds: [] }),
  setActiveStickerOverlayId: (id) => set({ activeStickerOverlayId: id, activeClipId: null, activeTextId: null, activeSubtitleId: null, activeAudioTrackId: null, selectedClipIds: [] }),
  setActiveAudioTrackId: (id) => set({ activeAudioTrackId: id, activeClipId: null, activeTextId: null, activeSubtitleId: null, activeStickerOverlayId: null, selectedClipIds: [] }),
  setRightPanel: (panel) => set({ rightPanel: panel }),

  // ─── History ──────────────────────────────────────────────────────

  pushHistory: () => {
    const { project, history, historyIndex } = get();
    if (!project) return;
    const json = JSON.stringify(project);
    if (history[historyIndex] === json) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const project = JSON.parse(history[newIndex]);
    set({ project, historyIndex: newIndex });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const project = JSON.parse(history[newIndex]);
    set({ project, historyIndex: newIndex });
  },

  // ─── Export ───────────────────────────────────────────────────────

  startExport: async (options: { fps?: number; width?: number; height?: number; quality?: number; format?: 'webm' | 'mp4' } = {}) => {
    const { project } = get();
    if (!project) return;

    const format = options.format || 'webm';
    set({ isExporting: true, exportProgress: 0 });

    try {
      const { exportVideo, downloadBlob, transcodeWebMToMP4 } = await import('../lib/videoExport');

      const webmBlob = await exportVideo(project, {
        fps: options.fps || 30,
        width: options.width,
        height: options.height,
        quality: options.quality,
        onProgress: (progress) => {
          set({ exportProgress: Math.round(progress) });
        },
      });

      if (format === 'webm') {
        const filename = `${project.title || 'video'}_${Date.now()}.webm`;
        downloadBlob(webmBlob, filename);
        get().addToExportQueue('WebM');
      } else if (format === 'mp4') {
        // Try in-browser transcoding via ffmpeg.wasm
        try {
          set({ exportProgress: 10 });
          const mp4 = await transcodeWebMToMP4(webmBlob, (p) => set({ exportProgress: Math.round(10 + p * 0.8) }));
          const filename = `${project.title || 'video'}_${Date.now()}.mp4`;
          downloadBlob(mp4, filename);
          get().addToExportQueue('MP4');
        } catch (e) {
          console.warn('MP4 transcoding failed, falling back to WebM download', e);
          const filename = `${project.title || 'video'}_${Date.now()}.webm`;
          downloadBlob(webmBlob, filename);
          get().addToExportQueue('WebM');
        }
      }

      set({ isExporting: false, exportProgress: 0 });
    } catch (error) {
      console.error('Export failed:', error);
      set({ isExporting: false, exportProgress: 0 });
    }
  },

  // ─── Computed ─────────────────────────────────────────────────────

  getTotalDuration: () => {
    const { project } = get();
    if (!project) return 0;
    return project.clips.reduce((sum, c) => {
      return sum + (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
    }, 0);
  },

  // Returns { clip, clipStartTime, clipLocalTime } for the clip that owns globalTime
  getClipAtTime: (globalTime: number) => {
    const { project } = get();
    if (!project || project.clips.length === 0) return null;
    const sorted = [...project.clips].sort((a, b) => a.order - b.order);
    let acc = 0;
    for (const clip of sorted) {
      const dur = (clip.duration - clip.trimStart - clip.trimEnd) / Math.max(0.25, clip.speed);
      if (globalTime < acc + dur) {
        return { clip, clipStartTime: acc, clipLocalTime: globalTime - acc };
      }
      acc += dur;
    }
    // Past the end — return last clip
    const last = sorted[sorted.length - 1];
    const lastDur = (last.duration - last.trimStart - last.trimEnd) / Math.max(0.25, last.speed);
    return { clip: last, clipStartTime: acc - lastDur, clipLocalTime: lastDur };
  },

  getActiveClip: () => {
    const { project, activeClipId } = get();
    if (!project || !activeClipId) return null;
    return project.clips.find(c => c.id === activeClipId) ?? null;
  },

  getProjectStats: () => {
    const { project } = get();
    if (!project) return { totalDuration: 0, clipCount: 0, effectsUsed: [], textsAdded: 0, avgClipDuration: 0, subtitleCount: 0 };
    const total = get().getTotalDuration();
    const effectsUsed = [...new Set(project.clips.filter(c => c.effect !== 'none').map(c => c.effect))];
    const avgClipDuration = project.clips.length > 0 ? total / project.clips.length : 0;
    return {
      totalDuration: total,
      clipCount: project.clips.length,
      effectsUsed,
      textsAdded: project.textOverlays.length,
      avgClipDuration,
      subtitleCount: project.subtitles.length,
    };
  },
}));
