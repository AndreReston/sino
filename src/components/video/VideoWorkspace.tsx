import { useEffect, useRef } from 'react';
import { useVideoStore } from '../../store/videoStore';
import VideoSidebar from './VideoSidebar';
import VideoPreview from './VideoPreview';
import VideoProperties from './VideoProperties';
import VideoTimeline from './VideoTimeline';
import PlaybackControls from './PlaybackControls';
import VideoTopBar from './VideoTopBar';
import { ArrowLeft, Film, Upload } from 'lucide-react';

interface Props {
  onSave?: () => void;
  onBack?: () => void;
}

export default function VideoWorkspace({ onSave, onBack }: Props) {
  const project = useVideoStore(s => s.project);
  const createProject = useVideoStore(s => s.createProject);
  const addClip = useVideoStore(s => s.addClip);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const isPlaying = useVideoStore(s => s.isPlaying);
  const playbackSpeed = useVideoStore(s => s.playbackSpeed);

  // Autosave on changes
  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      useVideoStore.getState().saveToLocalStorage();
    }, 2000);
    return () => clearTimeout(timer);
  }, [project?.clips, project?.textOverlays, project?.subtitles, project?.audioTracks, project?.title, project?.aspectRatio]);

  // Playback RAF loop
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(rafRef.current); return; }
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const st = useVideoStore.getState();
      const total = st.getTotalDuration();
      const next = st.currentTime + delta * playbackSpeed;
      if (next >= total) {
        st.setCurrentTime(0);
        st.setIsPlaying(false);
        return;
      }
      st.setCurrentTime(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed]);

  // Background music audio element sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const bgMusic = project?.backgroundMusic;
    if (!bgMusic?.url) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    audio.volume = Math.max(0, Math.min(1, bgMusic.volume ?? 0.8));

    const startPlayback = () => {
      const st = useVideoStore.getState();
      // Seek to current project time before playing
      if (isFinite(audio.duration) && audio.duration > 0) {
        const targetTime = st.currentTime % audio.duration;
        if (Math.abs(audio.currentTime - targetTime) > 0.3) {
          audio.currentTime = targetTime;
        }
      }
      audio.play().catch(() => {});
    };

    if (audio.src !== bgMusic.url) {
      audio.preload = 'auto';
      audio.src = bgMusic.url;
      audio.load();
      if (isPlaying) {
        audio.addEventListener('canplay', startPlayback, { once: true });
      }
    } else {
      if (isPlaying) {
        startPlayback();
      } else {
        audio.pause();
      }
    }
  }, [project?.backgroundMusic?.url, project?.backgroundMusic?.volume, isPlaying]);

  // Keep audio in sync with currentTime during seeks (when not playing)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !project?.backgroundMusic?.url || isPlaying) return;
    if (isFinite(audio.duration) && audio.duration > 0) {
      const st = useVideoStore.getState();
      audio.currentTime = st.currentTime % audio.duration;
    }
  }, [project?.backgroundMusic?.url]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const st = useVideoStore.getState();

      if (e.key === ' ') {
        e.preventDefault();
        st.setIsPlaying(!st.isPlaying);
      }

      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && st.activeClipId) {
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
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && st.activeClipId) {
        e.preventDefault();
        st.removeClip(st.activeClipId);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        st.undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        st.redo();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (!useVideoStore.getState().project) createProject();
      addClip({ url, name: file.name, duration: video.duration, trimStart: 0, trimEnd: 0, volume: 1 });
    };
    video.src = url;
  };

  if (!project) {
    return (
      <div className="flex h-screen bg-[#07070a] text-white">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
        </div>
        {onBack && (
          <button onClick={onBack} className="fixed top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full px-6">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center mx-auto mb-5">
                <Film className="w-7 h-7 text-sky-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Video Editor</h1>
              <p className="text-zinc-400 leading-relaxed">Upload video clips and start editing. Trim, add text, filters, transitions, and export.</p>
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
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 py-3.5 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800 flex items-center justify-center gap-2"
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

  return (
    <div className="flex h-screen bg-[#07070a] text-white overflow-hidden select-none">
      {/* Hidden audio element for background music */}
      <audio ref={audioRef} loop preload="auto" />
      <VideoSidebar />
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        <VideoTopBar onSave={onSave} onBack={onBack} />
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
