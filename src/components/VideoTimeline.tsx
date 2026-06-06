import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  ZoomIn, ZoomOut, Film,
} from 'lucide-react';
import { useStore } from '../store/useStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default function VideoTimeline() {
  const {
    videoTrack,
    activeVideoClipId,
    setVideoPlaying,
    setVideoCurrentTime,
    setVideoTimelineZoom,
    addVideoClip,
    setActiveVideoClip,
  } = useStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDraggingHead, setIsDraggingHead] = useState(false);
  const [dragClipId, setDragClipId] = useState<string | null>(null);
  const [dragTrimClip, setDragTrimClip] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  const { clips, isPlaying, currentTime, totalDuration, zoom: timelineZoom } = videoTrack;

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const next = useStore.getState().videoTrack.currentTime + delta;
      if (next >= totalDuration) {
        useStore.getState().setVideoCurrentTime(0);
        useStore.getState().setVideoPlaying(false);
        return;
      }
      useStore.getState().setVideoCurrentTime(next);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, totalDuration]);

  // Playback head drag
  const handleTrackMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(totalDuration, x / timelineZoom));
    setVideoCurrentTime(time);
    setIsDraggingHead(true);
  }, [totalDuration, timelineZoom, setVideoCurrentTime]);

  useEffect(() => {
    if (!isDraggingHead) return;
    const handleMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min(totalDuration, x / timelineZoom));
      useStore.getState().setVideoCurrentTime(time);
    };
    const handleUp = () => setIsDraggingHead(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingHead, timelineZoom, totalDuration]);

  // Clip reposition drag
  useEffect(() => {
    if (!dragClipId) return;
    const clip = clips.find((c) => c.id === dragClipId);
    if (!clip) return;
    const handleMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newStart = Math.max(0, x / timelineZoom - (clip.duration - clip.trimStart - clip.trimEnd) / 2);
      useStore.getState().updateVideoClip(dragClipId, { startTime: Math.max(0, newStart) });
    };
    const handleUp = () => setDragClipId(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragClipId, clips, timelineZoom]);

  // Trim handle drag
  useEffect(() => {
    if (!dragTrimClip) return;
    const { id, side } = dragTrimClip;
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    const handleMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const timeAtCursor = x / timelineZoom;
      if (side === 'left') {
        const newTrimStart = Math.max(0, Math.min(clip.duration - clip.trimEnd - 0.1, timeAtCursor - clip.startTime));
        useStore.getState().updateVideoClip(id, { trimStart: newTrimStart });
      } else {
        const clipEnd = clip.startTime + clip.duration - clip.trimStart;
        const newTrimEnd = Math.max(0, Math.min(clip.duration - clip.trimStart - 0.1, clipEnd - timeAtCursor));
        useStore.getState().updateVideoClip(id, { trimEnd: newTrimEnd });
      }
    };
    const handleUp = () => setDragTrimClip(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragTrimClip, clips, timelineZoom]);

  const trackWidth = totalDuration * timelineZoom;
  const playheadX = currentTime * timelineZoom;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    try {
      const clipInfo = JSON.parse(data);
      addVideoClip({
        name: clipInfo.name,
        url: clipInfo.url,
        thumbnailUrl: clipInfo.thumbnailUrl || '',
        duration: clipInfo.duration || 5,
        startTime: currentTime,
        trimStart: 0,
        trimEnd: 0,
        volume: 1,
      });
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-[#0c0c10] border-t border-white/[0.06] select-none">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
        {/* Transport controls */}
        <button
          onClick={() => { setVideoCurrentTime(0); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          title="Go to start"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setVideoPlaying(!isPlaying)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/20"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={() => { setVideoCurrentTime(totalDuration); setVideoPlaying(false); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          title="Go to end"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Time display */}
        <div className="flex items-center gap-1 ml-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-xs font-mono tabular-nums text-emerald-300">{formatTime(currentTime)}</span>
          <span className="text-xs text-zinc-600">/</span>
          <span className="text-xs font-mono tabular-nums text-zinc-500">{formatTime(totalDuration)}</span>
        </div>

        <div className="flex-1" />

        {/* Clip count */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/60 border border-white/[0.04] text-xs text-zinc-500">
          <Film className="w-3 h-3" />
          {clips.length} clip{clips.length !== 1 ? 's' : ''}
        </div>

        {/* Timeline zoom */}
        <button
          onClick={() => setVideoTimelineZoom(Math.max(20, timelineZoom - 20))}
          className="w-7 h-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500/40 rounded-full transition-all"
            style={{ width: `${Math.min(100, ((timelineZoom - 20) / 180) * 100)}%` }}
          />
        </div>
        <button
          onClick={() => setVideoTimelineZoom(Math.min(200, timelineZoom + 20))}
          className="w-7 h-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline track */}
      <div
        className="relative overflow-x-auto overflow-y-hidden"
        style={{ height: 64 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Time ruler */}
        <div
          className="absolute top-0 left-0 h-5 border-b border-white/[0.04]"
          style={{ width: trackWidth + 100 }}
        >
          {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: i * timelineZoom }}
            >
              <div className="w-px h-2 bg-zinc-700" />
              {i % 5 === 0 && (
                <span className="text-[9px] text-zinc-600 mt-0.5">{i}s</span>
              )}
            </div>
          ))}
        </div>

        {/* Track area */}
        <div
          ref={trackRef}
          className="absolute top-5 left-0 right-0 bottom-0"
          style={{ width: trackWidth + 100 }}
          onMouseDown={handleTrackMouseDown}
        >
          {/* Clip track background */}
          <div className="absolute inset-y-0 left-0 right-0 bg-zinc-900/30 rounded" />

          {/* Video clips */}
          {clips.map((clip) => {
            const clipDuration = clip.duration - clip.trimStart - clip.trimEnd;
            const clipWidth = clipDuration * timelineZoom;
            const clipLeft = (clip.startTime + clip.trimStart) * timelineZoom;
            const isActive = activeVideoClipId === clip.id;

            return (
              <div
                key={clip.id}
                className={`absolute top-1 bottom-1 rounded-lg overflow-hidden transition-shadow cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'hover:ring-1 hover:ring-white/20'
                }`}
                style={{
                  left: clipLeft,
                  width: Math.max(clipWidth, 20),
                }}
                onClick={(e) => { e.stopPropagation(); setActiveVideoClip(clip.id); }}
                onMouseDown={(e) => { e.stopPropagation(); setDragClipId(clip.id); }}
              >
                {/* Thumbnail strip background */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-sky-900/60 via-sky-800/40 to-sky-900/60"
                >
                  {clip.thumbnailUrl && (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `url(${clip.thumbnailUrl})`,
                        backgroundSize: `${timelineZoom * 2}px 100%`,
                        backgroundRepeat: 'repeat-x',
                      }}
                    />
                  )}
                </div>

                {/* Waveform decoration */}
                <div className="absolute inset-0 flex items-center gap-px px-1 opacity-40">
                  {Array.from({ length: Math.max(1, Math.floor(clipWidth / 6)) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full bg-sky-300"
                      style={{ height: `${20 + Math.sin(i * 0.7) * 30 + Math.random() * 20}%` }}
                    />
                  ))}
                </div>

                {/* Clip label */}
                <div className="absolute top-1 left-2 right-2 flex items-center gap-1.5 min-w-0">
                  <Film className="w-3 h-3 text-sky-300 shrink-0" />
                  <span className="text-[10px] text-white/80 font-medium truncate">{clip.name}</span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-1 right-2">
                  <span className="text-[9px] text-sky-200/60 font-mono">{clipDuration.toFixed(1)}s</span>
                </div>

                {/* Left trim handle */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize hover:bg-emerald-400/30 transition-colors z-10"
                  onMouseDown={(e) => { e.stopPropagation(); setDragTrimClip({ id: clip.id, side: 'left' }); }}
                >
                  <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/40 rounded-full" />
                </div>

                {/* Right trim handle */}
                <div
                  className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize hover:bg-emerald-400/30 transition-colors z-10"
                  onMouseDown={(e) => { e.stopPropagation(); setDragTrimClip({ id: clip.id, side: 'right' }); }}
                >
                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/40 rounded-full" />
                </div>
              </div>
            );
          })}

          {/* Playback head */}
          <div
            className="absolute top-0 bottom-0 w-px bg-emerald-400 z-20 pointer-events-none"
            style={{ left: playheadX, transition: isDraggingHead ? 'none' : 'left 0.05s linear' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-400 rotate-45 rounded-sm shadow-md" />
          </div>
        </div>

        {/* Empty state */}
        {clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Film className="w-4 h-4" />
              <span>Drop video clips here or import from the Uploads panel</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
