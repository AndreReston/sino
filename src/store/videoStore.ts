import { create } from 'zustand';

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
  transitionDuration: number;  // seconds, default 0.5
  effectDuration: number;      // seconds for in/out effects, default = full clip
  thumbnails: string[];   // data URLs of frame snapshots
  order: number;
  effect: ClipEffect;
  effectStack: EffectLayer[];
  keyframes: Keyframe[];
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
  type: 'emoji' | 'shape' | 'arrow' | 'speech-bubble';
  content: string;       // emoji char or SVG path key
  x: number;
  y: number;
  scale: number;
  rotation: number;
  startTime: number;
  endTime: number;
  color: string;
}

export interface SubtitleEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: CaptionStyle;
}

export interface AudioTrack {
  id: string;
  url: string;
  name: string;
  volume: number;
  muted: boolean;
  startTime: number;
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
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
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
  loadFromLocalStorage: () => void;

  // Clips
  addClip: (clip: Omit<VideoClip, 'id' | 'order' | 'thumbnails' | 'filters' | 'transitionIn' | 'speed' | 'muted' | 'effect' | 'keyframes' | 'effectStack'> & { url: string; name: string; duration: number; trimStart?: number; trimEnd?: number; volume?: number }) => void;
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
  setBackgroundMusic: (track: AudioTrack | null) => void;

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

  // UI
  setActiveClipId: (id: string | null) => void;
  setActiveTextId: (id: string | null) => void;
  setActiveSubtitleId: (id: string | null) => void;
  setActiveStickerOverlayId: (id: string | null) => void;
  setRightPanel: (panel: VideoStoreState['rightPanel']) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Export
  startExport: () => void;

  // Computed
  getTotalDuration: () => number;
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

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

// Beat detection simulation — real implementation would use Web Audio API
async function detectBeats(audioUrl: string): Promise<BeatMarker[]> {
  return new Promise((resolve) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      // Fallback: generate dummy beats every ~0.5s
      resolve(Array.from({ length: 40 }, (_, i) => ({ time: i * 0.5, intensity: Math.random() * 0.5 + 0.5 })));
      return;
    }

    const ctx = new AudioContext();
    const request = new XMLHttpRequest();
    request.open('GET', audioUrl, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      ctx.decodeAudioData(request.response, (buffer) => {
        const data = buffer.getChannelData(0);
        const sampleRate = buffer.sampleRate;
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
        const beats: BeatMarker[] = [];
        let prevEnergy = 0;

        for (let i = 0; i < data.length - windowSize; i += windowSize) {
          let energy = 0;
          for (let j = i; j < i + windowSize; j++) {
            energy += data[j] * data[j];
          }
          energy /= windowSize;
          if (energy > prevEnergy * 1.5 && energy > 0.01) {
            beats.push({ time: i / sampleRate, intensity: Math.min(1, energy * 10) });
          }
          prevEnergy = energy;
        }

        ctx.close();
        resolve(beats);
      }, () => {
        resolve(Array.from({ length: 30 }, (_, i) => ({ time: i * 0.5, intensity: 0.7 })));
      });
    };
    request.onerror = () => {
      resolve(Array.from({ length: 30 }, (_, i) => ({ time: i * 0.5, intensity: 0.7 })));
    };
    request.send();
  });
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
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  rightPanel: 'clips',
  history: [],
  historyIndex: -1,
  isExporting: false,
  exportProgress: 0,
  stylePresets: loadPresetsFromStorage(),
  exportQueue: [],
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
    set({ project, history: [JSON.stringify(project)], historyIndex: 0, activeClipId: null, currentTime: 0, isPlaying: false });
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
    const migrated: VideoProject = {
      ...project,
      stickerOverlays: project.stickerOverlays || [],
      sceneMarkers: project.sceneMarkers || [],
      beatMarkers: project.beatMarkers || [],
      clips: project.clips.map(c => ({
        ...c,
        transitionDuration: (c as any).transitionDuration ?? 0.5,
        effectDuration: (c as any).effectDuration ?? 0,
        effect: c.effect || 'none',
        keyframes: c.keyframes || [],
        effectStack: c.effectStack || [],
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
    });
  },

  exportProject: () => {
    return get().project;
  },

  resetStore: () => {
    set({
      project: null, activeClipId: null, activeTextId: null, activeSubtitleId: null,
      activeStickerOverlayId: null,
      currentTime: 0, isPlaying: false, playbackSpeed: 1, rightPanel: 'clips',
      history: [], historyIndex: -1, isExporting: false, exportProgress: 0,
    });
  },

  saveToLocalStorage: () => {
    const { project } = get();
    if (!project) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch { /* quota exceeded */ }
  },

  loadFromLocalStorage: () => {
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
        }));
        const migratedProject: VideoProject = {
          ...project,
          stickerOverlays: project.stickerOverlays || [],
          sceneMarkers: project.sceneMarkers || [],
          beatMarkers: project.beatMarkers || [],
          clips: migratedClips,
        };
        set({ project: migratedProject, history: [raw], historyIndex: 0 });
      }
    } catch { /* parse error */ }
  },

  // ─── Clips ──────────────────────────────────────────────────────

  addClip: (clipData) => {
    const { project } = get();
    if (!project) return;
    const clip: VideoClip = {
      id: `clip_${uid()}`,
      name: clipData.name,
      url: clipData.url,
      duration: clipData.duration,
      trimStart: clipData.trimStart ?? 0,
      trimEnd: clipData.trimEnd ?? 0,
      speed: 1,
      volume: clipData.volume ?? 1,
      muted: false,
      filters: { ...DEFAULT_FILTERS },
      transitionIn: 'none',
      transitionDuration: 0.5,
      effectDuration: 0,  // 0 = full clip duration
      thumbnails: [],
      order: project.clips.length,
      effect: 'none',
      effectStack: [],
      keyframes: [],
    };
    const clips = [...project.clips, clip];
    set({ project: { ...project, clips }, activeClipId: clip.id });
    get().pushHistory();
    get().generateThumbnails(clip.id);
    setTimeout(() => get().analyzeClipHealth(clip.id), 500);
  },

  removeClip: (id) => {
    const { project, activeClipId } = get();
    if (!project) return;
    let clips = project.clips.filter(c => c.id !== id);
    clips.forEach((c, i) => { c.order = i; });
    set({
      project: { ...project, clips },
      activeClipId: activeClipId === id ? (clips[0]?.id ?? null) : activeClipId,
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
    clips.splice(idx, 1, left, right);
    clips.forEach((c, i) => { c.order = i; });
    set({ project: { ...project, clips }, activeClipId: left.id });
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
    video.src = clip.url;
    video.muted = true;

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

    video.onerror = () => {
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
    };
    set({ project: { ...project, stickerOverlays: [...(project.stickerOverlays || []), sticker] }, activeStickerOverlayId: sticker.id });
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
    }));
    set({ project: { ...project, subtitles: [...project.subtitles, ...subtitles] } });
    get().pushHistory();
  },

  // ─── Audio ───────────────────────────────────────────────────────

  addAudioTrack: (url, name) => {
    const { project } = get();
    if (!project) return;
    const track: AudioTrack = {
      id: `audio_${uid()}`,
      url,
      name,
      volume: 1,
      muted: false,
      startTime: 0,
    };
    set({ project: { ...project, audioTracks: [...project.audioTracks, track] } });
    get().pushHistory();
  },

  removeAudioTrack: (id) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, audioTracks: project.audioTracks.filter(a => a.id !== id) } });
    get().pushHistory();
  },

  updateAudioTrack: (id, updates) => {
    const { project } = get();
    if (!project) return;
    const audioTracks = project.audioTracks.map(a => a.id === id ? { ...a, ...updates } : a);
    set({ project: { ...project, audioTracks } });
  },

  setBackgroundMusic: (track) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, backgroundMusic: track } });
    get().pushHistory();
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
      const beats = await detectBeats(audioUrl);
      const { project } = get();
      if (project) {
        set({ project: { ...project, beatMarkers: beats }, showBeatMarkers: true });
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

  // ─── Playback ────────────────────────────────────────────────────

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0.25, Math.min(2, speed)) }),

  // ─── UI ──────────────────────────────────────────────────────────

  setActiveClipId: (id) => set({ activeClipId: id, activeTextId: null, activeSubtitleId: null, activeStickerOverlayId: null }),
  setActiveTextId: (id) => set({ activeTextId: id, activeClipId: null, activeSubtitleId: null, activeStickerOverlayId: null }),
  setActiveSubtitleId: (id) => set({ activeSubtitleId: id, activeClipId: null, activeTextId: null, activeStickerOverlayId: null }),
  setActiveStickerOverlayId: (id) => set({ activeStickerOverlayId: id, activeClipId: null, activeTextId: null, activeSubtitleId: null }),
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

  startExport: () => {
    set({ isExporting: true, exportProgress: 0 });
    const interval = setInterval(() => {
      const prog = get().exportProgress;
      if (prog >= 100) {
        clearInterval(interval);
        set({ isExporting: false, exportProgress: 0 });
        get().addToExportQueue('WebM');
      } else {
        set({ exportProgress: prog + 5 });
      }
    }, 200);
  },

  // ─── Computed ─────────────────────────────────────────────────────

  getTotalDuration: () => {
    const { project } = get();
    if (!project) return 0;
    return project.clips.reduce((sum, c) => {
      return sum + (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
    }, 0);
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
