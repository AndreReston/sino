import { useState, useEffect, useRef, useCallback } from 'react';
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
  const setCurrentTime = useVideoStore(s => s.setCurrentTime);
  const setIsPlaying = useVideoStore(s => s.setIsPlaying);
  const splitClip = useVideoStore(s => s.splitClip);
  const removeClip = useVideoStore(s => s.removeClip);
  const undo = useVideoStore(s => s.undo);
  const redo = useVideoStore(s => s.redo);
  const activeClipId = useVideoStore(s => s.activeClipId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback loop — hooks must be at top level
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const isPlaying = useVideoStore(s => s.isPlaying);
  const playbackSpeed = useVideoStore(s => s.playbackSpeed);
  const currentTime = useVideoStore(s => s.currentTime);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const st = useVideoStore.getState();

      // Space = play/pause
      if (e.key === ' ') {
        e.preventDefault();
        st.setIsPlaying(!st.isPlaying);
      }

      // S = split at playhead
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey && st.activeClipId) {
          e.preventDefault();
          const clip = st.project?.clips.find(c => c.id === st.activeClipId);
          if (clip) {
            const sortedClips = [...(st.project?.clips || [])].sort((a, b) => a.order - b.order);
            const idx = sortedClips.findIndex(c => c.id === clip.id);
            let timeFromStart = st.currentTime;
            for (let i = 0; i < idx; i++) {
              const c = sortedClips[i];
              timeFromStart -= (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
            }
            if (timeFromStart > 0) {
              st.splitClip(st.activeClipId, timeFromStart);
            }
          }
        }
      }

      // Delete/Backspace = remove selected clip
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (st.activeClipId) {
          e.preventDefault();
          st.removeClip(st.activeClipId);
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

  // No project: creation screen
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

  // Full editor workspace
  return (
    <div className="flex h-screen bg-[#07070a] text-white overflow-hidden select-none">
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
