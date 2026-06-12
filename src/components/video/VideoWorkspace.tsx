import { useEffect, useRef, useState } from 'react';
import { useVideoStore } from '../../store/videoStore';
import VideoSidebar from './VideoSidebar';
import VideoPreview from './VideoPreview';
import VideoProperties from './VideoProperties';
import VideoTimeline from './VideoTimeline';
import PlaybackControls from './PlaybackControls';
import VideoTopBar from './VideoTopBar';
import { ArrowLeft, Film, Upload } from 'lucide-react';
import { uploadMediaForPersistence, getVideoDuration, countEphemeralUrls } from '../../lib/mediaUpload';

interface Props {
  onBack?: () => void;
}

interface AudioSyncTrack {
  url: string;
  volume: number;
  muted: boolean;
  startTime: number;
  duration: number;
}

function syncAudioElement(
  audio: HTMLAudioElement,
  track: AudioSyncTrack,
  timelineTime: number,
  playing: boolean,
  speed: number
) {
  const trackEnd = track.startTime + track.duration;
  const withinRange = timelineTime >= track.startTime && timelineTime < trackEnd;

  audio.volume = track.muted ? 0 : Math.max(0, Math.min(1, track.volume));
  audio.playbackRate = speed;

  if (!withinRange || !playing) {
    if (!audio.paused) audio.pause();
    return;
  }

  const audioTime = timelineTime - track.startTime;

  // Seek if drift is significant (>0.3s) or if audio hasn't started yet
  if (audio.readyState < 2 || Math.abs(audio.currentTime - audioTime) > 0.3) {
    audio.currentTime = Math.max(0, audioTime);
  }

  if (audio.paused) {
    audio.play().catch(() => {});
  }
}

export default function VideoWorkspace({ onBack }: Props) {
  const project = useVideoStore(s => s.project);
  const createProject = useVideoStore(s => s.createProject);
  const addClip = useVideoStore(s => s.addClip);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const trackAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const lastAudioSyncRef = useRef<number>(0);
  const isPlaying = useVideoStore(s => s.isPlaying);
  const playbackSpeed = useVideoStore(s => s.playbackSpeed);

  // Autosave on changes
  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      useVideoStore.getState().saveToLocalStorage();
    }, 2000);
    return () => clearTimeout(timer);
  }, [project?.clips, project?.textOverlays, project?.stickerOverlays, project?.subtitles, project?.audioTracks, project?.backgroundMusic, project?.title, project?.aspectRatio]);

  // ── Ensure audio elements exist for each track ─────────────────────
  useEffect(() => {
    if (!project) return;
    const trackIds = new Set(project.audioTracks.map(t => t.id));
    // Remove stale
    for (const [id, el] of trackAudioRefs.current) {
      if (!trackIds.has(id)) {
        el.pause();
        el.removeAttribute('src');
        trackAudioRefs.current.delete(id);
      }
    }
    // Create new
    for (const track of project.audioTracks) {
      if (!trackAudioRefs.current.has(track.id)) {
        const audio = new Audio();
        audio.preload = 'auto';
        trackAudioRefs.current.set(track.id, audio);
      }
    }
  }, [project?.audioTracks]);

  // ── Set audio src when tracks change ───────────────────────────────
  useEffect(() => {
    if (!project) return;
    for (const track of project.audioTracks) {
      const audio = trackAudioRefs.current.get(track.id);
      if (!audio || !track.url) continue;
      if (!audio.src || !audio.src.endsWith(track.url)) {
        audio.src = track.url;
        audio.load();
      }
    }
  }, [project?.audioTracks]);

  // ── Set bg music src when it changes ───────────────────────────────
  useEffect(() => {
    const audio = bgAudioRef.current;
    const bgMusic = project?.backgroundMusic;
    if (!audio) return;
    if (!bgMusic?.url) {
      audio.pause();
      audio.removeAttribute('src');
      return;
    }
    if (audio.src !== bgMusic.url) {
      audio.src = bgMusic.url;
      audio.load();
    }
  }, [project?.backgroundMusic?.url]);

  // ── Seek audio when user scrubs timeline (not playing) ─────────────
  const prevTimeRef = useRef(0);
  useEffect(() => {
    const unsub = useVideoStore.subscribe((state, prev) => {
      if (state.isPlaying) return; // RAF loop handles sync during playback
      if (state.currentTime === prev.currentTime) return;
      if (Math.abs(state.currentTime - prevTimeRef.current) < 0.05) return;
      prevTimeRef.current = state.currentTime;

      const time = state.currentTime;
      const bgMusic = state.project?.backgroundMusic;
      const bgAudio = bgAudioRef.current;
      if (bgAudio && bgMusic?.url) {
        syncAudioElement(bgAudio, bgMusic, time, false, state.playbackSpeed);
      }

      for (const track of state.project?.audioTracks ?? []) {
        const audio = trackAudioRefs.current.get(track.id);
        if (audio && track.url) {
          syncAudioElement(audio, track, time, false, state.playbackSpeed);
        }
      }
    });
    return unsub;
  }, []);

  // ── Playback RAF loop with integrated audio sync ───────────────────
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); return; }
    lastTickRef.current = performance.now();
    lastAudioSyncRef.current = 0;

    const tick = (now: number) => {
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const st = useVideoStore.getState();
      const total = st.getTotalDuration();
      const next = st.currentTime + delta * playbackSpeed;

      if (next >= total) {
        st.setCurrentTime(0);
        st.setIsPlaying(false);
        const sorted = [...(st.project?.clips || [])].sort((a, b) => a.order - b.order);
        if (sorted.length > 0) st.setActiveClipId(sorted[0].id);
        return;
      }
      st.setCurrentTime(next);
      const info = st.getClipAtTime(next);
      const hasNonClipSelection = st.activeStickerOverlayId || st.activeTextId || st.activeSubtitleId || st.activeAudioTrackId;
      if (info && info.clip.id !== st.activeClipId && !hasNonClipSelection) {
        st.setActiveClipId(info.clip.id);
      }

      // Sync audio every ~100ms during playback to avoid drift
      if (now - lastAudioSyncRef.current > 100) {
        lastAudioSyncRef.current = now;
        const bgMusic = st.project?.backgroundMusic;
        const bgAudio = bgAudioRef.current;
        if (bgAudio && bgMusic?.url) {
          syncAudioElement(bgAudio, bgMusic, next, true, playbackSpeed);
        }
        if (st.project) {
          for (const track of st.project.audioTracks) {
            const audio = trackAudioRefs.current.get(track.id);
            if (audio && track.url) {
              syncAudioElement(audio, track, next, true, playbackSpeed);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed]);

  // ── Play/pause audio when playback state changes ───────────────────
  useEffect(() => {
    const st = useVideoStore.getState();
    const time = st.currentTime;

    const bgMusic = project?.backgroundMusic;
    const bgAudio = bgAudioRef.current;
    if (bgAudio && bgMusic?.url) {
      syncAudioElement(bgAudio, bgMusic, time, isPlaying, playbackSpeed);
    }

    if (project) {
      for (const track of project.audioTracks) {
        const audio = trackAudioRefs.current.get(track.id);
        if (audio && track.url) {
          syncAudioElement(audio, track, time, isPlaying, playbackSpeed);
        }
      }
    }
  }, [isPlaying, playbackSpeed, project?.backgroundMusic, project?.audioTracks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const [, el] of trackAudioRefs.current) {
        el.pause();
        el.removeAttribute('src');
      }
      trackAudioRefs.current.clear();
    };
  }, []);

  // Keyboard shortcuts — context-aware based on what's selected
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const st = useVideoStore.getState();

      // Space = play/pause (always available)
      if (e.key === ' ') {
        e.preventDefault();
        st.setIsPlaying(!st.isPlaying);
      }

      // S = split (clip or audio track depending on what's selected)
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
        if (st.activeClipId) {
          e.preventDefault();
          const clip = st.project?.clips.find(c => c.id === st.activeClipId);
          if (clip) {
            const sorted = [...(st.project?.clips || [])].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex(c => c.id === clip.id);
            let timeFromStart = st.currentTime;
            for (let i = 0; i < idx; i++) {
              const c = sorted[i];
              timeFromStart -= (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
            }
            if (timeFromStart > 0) st.splitClip(st.activeClipId, timeFromStart);
          }
        } else if (st.activeAudioTrackId) {
          e.preventDefault();
          const track = st.project?.audioTracks.find(a => a.id === st.activeAudioTrackId);
          if (track) {
            const audioTime = st.currentTime - track.startTime;
            if (audioTime > 0 && audioTime < track.duration) {
              st.splitAudioTrack(st.activeAudioTrackId, audioTime);
            }
          }
        }
      }

      // Delete/Backspace = remove selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (st.activeClipId) {
          e.preventDefault();
          st.removeClip(st.activeClipId);
        } else if (st.activeAudioTrackId) {
          e.preventDefault();
          const bgm = st.project?.backgroundMusic;
          if (bgm && bgm.id === st.activeAudioTrackId) {
            st.setBackgroundMusic(null);
          } else {
            st.removeAudioTrack(st.activeAudioTrackId);
          }
        } else if (st.activeStickerOverlayId) {
          e.preventDefault();
          st.removeStickerOverlay(st.activeStickerOverlayId);
        } else if (st.activeTextId) {
          e.preventDefault();
          st.removeTextOverlay(st.activeTextId);
        } else if (st.activeSubtitleId) {
          e.preventDefault();
          st.removeSubtitle(st.activeSubtitleId);
        }
      }

      // Ctrl+Z = undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        st.undo();
      }

      // Ctrl+Y / Ctrl+Shift+Z = redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        st.redo();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleVideoUpload = async (file: File) => {
    setUploadError(null);
    if (!useVideoStore.getState().project) createProject();
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
    }
  };

  if (!project) {
    return (
      <div className="flex h-screen bg-canvas-bg text-theme-primary">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
        </div>
        {onBack && (
          <button onClick={onBack} className="fixed top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-lg border border-panel-border bg-panel-light text-xs text-theme-secondary hover:text-theme-primary hover:border-panel-border transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full px-6">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center mx-auto mb-5">
                <Film className="w-7 h-7 text-sky-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-theme-primary mb-3">Video Editor</h1>
              <p className="text-theme-muted leading-relaxed">Upload video clips and start editing. Trim, add text, filters, transitions, and export.</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => createProject()}
                className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-sky-400 hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)]"
              >
                Create New Project
              </button>
              <button
                onClick={() => { createProject(); setTimeout(() => fileInputRef.current?.click(), 100); }}
                className="w-full rounded-xl border border-panel-border bg-panel py-3.5 text-sm font-medium text-theme-secondary transition-all hover:border-panel-hover hover:bg-panel-hover flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Import Video to Start
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const brokenMediaCount = project ? countEphemeralUrls(project) : 0;

  return (
    <div className="flex h-screen bg-canvas-bg text-theme-primary overflow-hidden select-none">
      {/* Hidden audio element for background music */}
      <audio ref={bgAudioRef} preload="auto" />
      <VideoSidebar />
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        {(uploadError || brokenMediaCount > 0) && (
          <div className="shrink-0 px-4 py-2 border-b border-panel-divider bg-panel-light space-y-1">
            {uploadError && (
              <p className="text-xs text-red-300">{uploadError}</p>
            )}
            {brokenMediaCount > 0 && (
              <p className="text-xs text-amber-300">
                {brokenMediaCount} media file{brokenMediaCount > 1 ? 's' : ''} could not be loaded (temporary links expired).
                Sign in and re-upload your clips, audio, and photos.
              </p>
            )}
          </div>
        )}
        <VideoTopBar onBack={onBack} />
        <div className="flex flex-1 min-w-0 min-h-0">
          <VideoPreview videoRef={videoRef} />
          <VideoProperties />
        </div>
        <VideoTimeline />
        <PlaybackControls videoRef={videoRef} />
      </div>
    </div>
  );
}
