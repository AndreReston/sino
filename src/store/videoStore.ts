import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────

export type AspectRatio = '16:9' | '9:16' | '1:1';
export type TransitionType = 'none' | 'fade' | 'crossfade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'wipe-left' | 'wipe-right';
export type CaptionStyle = 'karaoke' | 'pop-up' | 'tiktok' | 'minimal' | 'bold-highlight';
export type ClipEffect = 'none' | 'shake' | 'zoom-in' | 'zoom-out' | 'fade-in' | 'fade-out' | 'blur-in' | 'blur-out' | 'vhs' | 'glitch';

export interface Keyframe {
  time: number;    // seconds from clip start
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity';
  value: number;
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
  thumbnails: string[];   // data URLs of frame snapshots
  order: number;
  effect: ClipEffect;
  keyframes: Keyframe[];
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

export interface VideoProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  clips: VideoClip[];
  textOverlays: TextOverlay[];
  subtitles: SubtitleEntry[];
  audioTracks: AudioTrack[];
  backgroundMusic: AudioTrack | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoStoreState {
  project: VideoProject | null;
  activeClipId: string | null;
  activeTextId: string | null;
  activeSubtitleId: string | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  rightPanel: 'clips' | 'filters' | 'text' | 'audio' | 'transitions' | 'subtitles' | 'export' | 'templates';
  history: string[];
  historyIndex: number;
  isExporting: boolean;
  exportProgress: number;
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
  addClip: (clip: Omit<VideoClip, 'id' | 'order' | 'thumbnails' | 'filters' | 'transitionIn' | 'speed' | 'muted' | 'effect' | 'keyframes'> & { url: string; name: string; duration: number; trimStart?: number; trimEnd?: number; volume?: number }) => void;
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

  // Text overlays
  addTextOverlay: (text?: string) => void;
  removeTextOverlay: (id: string) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;

  // Subtitles
  addSubtitle: (text?: string, start?: number, end?: number) => void;
  removeSubtitle: (id: string) => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleEntry>) => void;

  // Audio
  addAudioTrack: (url: string, name: string) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  setBackgroundMusic: (track: AudioTrack | null) => void;

  // Playback
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;

  // UI
  setActiveClipId: (id: string | null) => void;
  setActiveTextId: (id: string | null) => void;
  setActiveSubtitleId: (id: string | null) => void;
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
}

type VStore = VideoStoreState & VideoStoreActions;

const STORAGE_KEY = 'designforge_video_project';

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useVideoStore = create<VStore>((set, get) => ({
  project: null,
  activeClipId: null,
  activeTextId: null,
  activeSubtitleId: null,
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  rightPanel: 'clips',
  history: [],
  historyIndex: -1,
  isExporting: false,
  exportProgress: 0,

  // ─── Project ─────────────────────────────────────────────────────

  createProject: (title) => {
    const project: VideoProject = {
      id: `proj_${uid()}`,
      title: title || 'Untitled Video',
      aspectRatio: '9:16',
      clips: [],
      textOverlays: [],
      subtitles: [],
      audioTracks: [],
      backgroundMusic: null,
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
    set({
      project,
      activeClipId: project.clips[0]?.id ?? null,
      activeTextId: null,
      activeSubtitleId: null,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1,
      history: [JSON.stringify(project)],
      historyIndex: 0,
    });
  },

  exportProject: () => {
    return get().project;
  },

  resetStore: () => {
    set({
      project: null, activeClipId: null, activeTextId: null, activeSubtitleId: null,
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
        set({ project, history: [raw], historyIndex: 0 });
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
      thumbnails: [],
      order: project.clips.length,
      effect: 'none',
      keyframes: [],
    };
    const clips = [...project.clips, clip];
    set({ project: { ...project, clips }, activeClipId: clip.id });
    get().pushHistory();
    get().generateThumbnails(clip.id);
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
    const clips = [...project.clips];
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

    // Split from the end backwards
    let currentId = id;
    for (let i = splitCount - 1; i >= 1; i--) {
      get().splitClip(currentId, i * intervalSeconds);
      // After split, the left clip keeps the original id
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
      // Fallback: empty thumbnails
      get().updateClip(id, { thumbnails: [] });
    };
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

  // ─── Playback ────────────────────────────────────────────────────

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0.25, Math.min(2, speed)) }),

  // ─── UI ──────────────────────────────────────────────────────────

  setActiveClipId: (id) => set({ activeClipId: id, activeTextId: null, activeSubtitleId: null }),
  setActiveTextId: (id) => set({ activeTextId: id, activeClipId: null, activeSubtitleId: null }),
  setActiveSubtitleId: (id) => set({ activeSubtitleId: id, activeClipId: null, activeTextId: null }),
  setRightPanel: (panel) => set({ rightPanel: panel }),

  // ─── History ──────────────────────────────────────────────────────

  pushHistory: () => {
    const { project, history, historyIndex } = get();
    if (!project) return;
    const json = JSON.stringify(project);
    // Debounce: don't push if identical to current
    if (history[historyIndex] === json) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    // Keep max 50 entries
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
    // Simulate export progress (real export would use MediaRecorder)
    const interval = setInterval(() => {
      const prog = get().exportProgress;
      if (prog >= 100) {
        clearInterval(interval);
        set({ isExporting: false, exportProgress: 0 });
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
}));
