import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trash2, ZoomIn, ZoomOut, Film, Type, Volume2,
  Music, Smile, Maximize2, Image as ImageIcon,
} from 'lucide-react';
import { useVideoStore, VideoClip } from '../../store/videoStore';

export default function VideoTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const project = useVideoStore(s => s.project);
  const currentTime = useVideoStore(s => s.currentTime);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const activeTextId = useVideoStore(s => s.activeTextId);
  const activeSubtitleId = useVideoStore(s => s.activeSubtitleId);
  const activeAudioTrackId = useVideoStore(s => s.activeAudioTrackId);
  const activeStickerOverlayId = useVideoStore(s => s.activeStickerOverlayId);
  const selectedClipIds = useVideoStore(s => s.selectedClipIds || []);
  const setCurrentTime = useVideoStore(s => s.setCurrentTime);
  const setActiveClipId = useVideoStore(s => s.setActiveClipId);
  const setActiveTextId = useVideoStore(s => s.setActiveTextId);
  const setActiveSubtitleId = useVideoStore(s => s.setActiveSubtitleId);
  const reorderClip = useVideoStore(s => s.reorderClip);
  const splitClip = useVideoStore(s => s.splitClip);
  const removeClip = useVideoStore(s => s.removeClip);
  const updateClip = useVideoStore(s => s.updateClip);
  const updateTextOverlay = useVideoStore(s => s.updateTextOverlay);
  const updateSubtitle = useVideoStore(s => s.updateSubtitle);
  const updateStickerOverlay = useVideoStore(s => s.updateStickerOverlay);
  const setActiveStickerOverlayId = useVideoStore(s => s.setActiveStickerOverlayId);
  const setActiveAudioTrackId = useVideoStore(s => s.setActiveAudioTrackId);
  const toggleClipSelection = useVideoStore(s => s.toggleClipSelection);
  const clearClipSelection = useVideoStore(s => s.clearClipSelection);
  const removeSelectedClips = useVideoStore(s => s.removeSelectedClips);
  const getTotalDuration = useVideoStore(s => s.getTotalDuration);
  const showBeatMarkers = useVideoStore(s => s.showBeatMarkers);
  const jumpToMarker = useVideoStore(s => s.jumpToMarker);

  const [containerWidth, setContainerWidth] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(80);

  // Drag/trim state
  const [dragClipId, setDragClipId] = useState<string | null>(null);
  const [dragClipOverIndex, setDragClipOverIndex] = useState<number | null>(null);
  const [trimClipId, setTrimClipId] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  const [dragTextId, setDragTextId] = useState<string | null>(null);
  const [trimTextId, setTrimTextId] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  const [dragSubtitleId, setDragSubtitleId] = useState<string | null>(null);
  const [trimSubtitleId, setTrimSubtitleId] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  const [dragStickerId, setDragStickerId] = useState<string | null>(null);
  const [trimPhotoId, setTrimPhotoId] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  const [draggingPlayhead, setDraggingPlayhead] = useState(false);

  // Keep mutable refs so mouse handlers always see current values
  const ppsRef = useRef(80);
  const sortedClipsRef = useRef<VideoClip[]>([]);
  const totalDurationRef = useRef(0);
  // Store initial values for drag operations
  const dragInitRef = useRef<{
    startX: number;
    origStart?: number;
    origEnd?: number;
  }>({ startX: 0 });

  // Measure container width
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const totalDuration = getTotalDuration();
  // Use manual zoom (timelineZoom) when user has adjusted it, otherwise fit to container
  const useFitToContainer = timelineZoom === 80; // default zoom value
  const pps = useFitToContainer && containerWidth > 0 && totalDuration > 0
    ? containerWidth / totalDuration
    : timelineZoom;
  const trackWidth = Math.max(containerWidth, totalDuration * pps + 100);

  const sortedClips = useMemo(
    () => [...(project?.clips || [])].sort((a, b) => a.order - b.order),
    [project?.clips]
  );

  // Keep refs in sync
  useEffect(() => { ppsRef.current = pps; }, [pps]);
  useEffect(() => { sortedClipsRef.current = sortedClips; }, [sortedClips]);
  useEffect(() => { totalDurationRef.current = totalDuration; }, [totalDuration]);

  const getScrollOffset = () => scrollRef.current?.scrollLeft || 0;

  const getClipLeft = useCallback((index: number, clips = sortedClips, p = pps): number => {
    let sec = 0;
    for (let i = 0; i < index; i++) {
      const c = clips[i];
      sec += (c.duration - c.trimStart - c.trimEnd) / Math.max(0.25, c.speed);
    }
    return sec * p;
  }, [sortedClips, pps]);

  const getClipWidth = useCallback((clip: (typeof sortedClips)[0], p = pps): number => {
    return Math.max(8, ((clip.duration - clip.trimStart - clip.trimEnd) / Math.max(0.25, clip.speed)) * p);
  }, [pps]);

  const getRulerMarks = () => {
    const marks: { time: number; label: string }[] = [];
    const interval = pps > 60 ? 1 : pps > 20 ? 5 : 10;
    for (let t = 0; t <= totalDuration; t += interval) {
      marks.push({ time: t, label: `${Math.floor(t)}s` });
    }
    return marks;
  };

  const getWaveformBars = (seed: string, count: number) => {
    const bars: number[] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
    for (let i = 0; i < count; i++) {
      const value = ((hash + i * 37) % 100) / 100;
      bars.push(0.18 + value * 0.82);
    }
    return bars;
  };

  const playheadX = currentTime * pps;

  const getClipAtTime = useVideoStore(s => s.getClipAtTime);

  // ── Track click to seek ────────────────────────────────────────────────
  const handleTrackMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-noseek]')) return;
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + getScrollOffset();
    const t = Math.max(0, Math.min(totalDuration, x / pps));
    setCurrentTime(t);
    clearClipSelection();
    // Auto-switch active clip to whichever clip owns this time
    const info = getClipAtTime(t);
    if (info) setActiveClipId(info.clip.id);
  }, [pps, totalDuration, setCurrentTime, setActiveClipId, getClipAtTime, clearClipSelection]);

  // ── Playhead drag ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!draggingPlayhead) return;
    const move = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + getScrollOffset();
      const t = Math.max(0, Math.min(totalDurationRef.current, x / ppsRef.current));
      setCurrentTime(t);
      const st = useVideoStore.getState();
      const info = st.getClipAtTime(t);
      if (info && info.clip.id !== st.activeClipId) st.setActiveClipId(info.clip.id);
    };
    const up = () => setDraggingPlayhead(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [draggingPlayhead, setCurrentTime]);

  // ── Clip drag reorder ──────────────────────────────────────────────────
  useEffect(() => {
    if (!dragClipId) return;
    const getDropIndex = (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left + getScrollOffset();
      const clips = sortedClipsRef.current;
      const p = ppsRef.current;
      let pos = 0;
      for (let i = 0; i < clips.length; i++) {
        const w = getClipWidth(clips[i], p);
        if (x < pos + w / 2) return i;
        pos += w;
      }
      return clips.length - 1;
    };
    const move = (e: MouseEvent) => setDragClipOverIndex(getDropIndex(e.clientX));
    const up = (e: MouseEvent) => {
      const newIndex = getDropIndex(e.clientX);
      const oldIndex = sortedClipsRef.current.findIndex(c => c.id === dragClipId);
      if (oldIndex !== newIndex && newIndex >= 0) reorderClip(dragClipId, newIndex);
      setDragClipId(null);
      setDragClipOverIndex(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragClipId, getClipWidth, reorderClip]);

  // ── Clip trim ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!trimClipId) return;
    const { id, side } = trimClipId;
    const clip = project?.clips.find(c => c.id === id);
    if (!clip) return;
    const clipIndex = sortedClips.findIndex(c => c.id === id);
    const clipLeft = getClipLeft(clipIndex);
    const clipRight = clipLeft + getClipWidth(clip);

    const move = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + getScrollOffset();
      if (side === 'left') {
        const delta = x - clipLeft;
        updateClip(id, { trimStart: Math.max(0, Math.min(clip.duration - clip.trimEnd - 0.1, delta / ppsRef.current)) });
      } else {
        const delta = clipRight - x;
        updateClip(id, { trimEnd: Math.max(0, Math.min(clip.duration - clip.trimStart - 0.1, delta / ppsRef.current)) });
      }
    };
    const up = () => setTrimClipId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [trimClipId]);

  // ── Text overlay drag ──────────────────────────────────────────────────
  useEffect(() => {
    if (!dragTextId) return;
    const overlay = project?.textOverlays.find(t => t.id === dragTextId);
    if (!overlay) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      const dur = origEnd - origStart;
      const newStart = Math.max(0, origStart + deltaSec);
      updateTextOverlay(dragTextId, { startTime: newStart, endTime: newStart + dur });
    };
    const up = () => setDragTextId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragTextId, updateTextOverlay]);

  // ── Text overlay trim ──────────────────────────────────────────────────
  useEffect(() => {
    if (!trimTextId) return;
    const { id, side } = trimTextId;
    const overlay = project?.textOverlays.find(t => t.id === id);
    if (!overlay) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      if (side === 'left') {
        updateTextOverlay(id, { startTime: Math.max(0, Math.min(origEnd - 0.1, origStart + deltaSec)) });
      } else {
        updateTextOverlay(id, { endTime: Math.max(origStart + 0.1, origEnd + deltaSec) });
      }
    };
    const up = () => setTrimTextId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [trimTextId, updateTextOverlay]);

  // ── Subtitle drag ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!dragSubtitleId) return;
    const sub = project?.subtitles.find(s => s.id === dragSubtitleId);
    if (!sub) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      const dur = origEnd - origStart;
      const newStart = Math.max(0, origStart + deltaSec);
      updateSubtitle(dragSubtitleId, { startTime: newStart, endTime: newStart + dur });
    };
    const up = () => setDragSubtitleId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragSubtitleId, updateSubtitle]);

  // ── Subtitle trim ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!trimSubtitleId) return;
    const { id, side } = trimSubtitleId;
    const sub = project?.subtitles.find(s => s.id === id);
    if (!sub) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      if (side === 'left') {
        updateSubtitle(id, { startTime: Math.max(0, Math.min(origEnd - 0.1, origStart + deltaSec)) });
      } else {
        updateSubtitle(id, { endTime: Math.max(origStart + 0.1, origEnd + deltaSec) });
      }
    };
    const up = () => setTrimSubtitleId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [trimSubtitleId, updateSubtitle]);

  // ── Sticker timeline drag ──────────────────────────────────────────────
  useEffect(() => {
    if (!dragStickerId) return;
    const sticker = project?.stickerOverlays?.find(s => s.id === dragStickerId);
    if (!sticker) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      const dur = origEnd - origStart;
      const newStart = Math.max(0, origStart + deltaSec);
      updateStickerOverlay(dragStickerId, { startTime: newStart, endTime: newStart + dur });
    };
    const up = () => setDragStickerId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragStickerId, updateStickerOverlay]);

  // ── Photo overlay trim ───────────────────────────────────────────────
  useEffect(() => {
    if (!trimPhotoId) return;
    const { id, side } = trimPhotoId;
    const sticker = project?.stickerOverlays?.find(s => s.id === id);
    if (!sticker) return;
    const { origStart, origEnd, startX } = dragInitRef.current as { origStart: number; origEnd: number; startX: number };

    const move = (e: MouseEvent) => {
      const deltaSec = (e.clientX - startX) / ppsRef.current;
      if (side === 'left') {
        updateStickerOverlay(id, { startTime: Math.max(0, Math.min(origEnd - 0.1, origStart + deltaSec)) });
      } else {
        updateStickerOverlay(id, { endTime: Math.max(origStart + 0.1, origEnd + deltaSec) });
      }
    };
    const up = () => setTrimPhotoId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [trimPhotoId, updateStickerOverlay]);

  if (!project) return null;

  const rulerMarks = getRulerMarks();

  return (
    <div className="bg-surface border-t border-panel-border flex flex-col select-none" style={{ minHeight: 200 }}>
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-panel-border shrink-0">
        <span className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold mr-1">Timeline</span>
        <div className="flex-1" />
        <span className="text-[10px] text-theme-secondary">{sortedClips.length} clip{sortedClips.length !== 1 ? 's' : ''}</span>
        {selectedClipIds.length > 0 && (
          <>
            <div className="w-px h-4 bg-panel-divider mx-1" />
            <span className="text-[10px] text-sky-400">{selectedClipIds.length} selected</span>
            <button onClick={() => removeSelectedClips()} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] hover:bg-red-500/20" title="Delete selected clips">Delete</button>
            <button onClick={clearClipSelection} className="px-1.5 py-0.5 rounded bg-panel-hover text-theme-muted text-[10px]" title="Clear selection">Clear</button>
          </>
        )}
        <div className="w-px h-4 bg-panel-divider mx-1" />
        <button onClick={() => setTimelineZoom(z => Math.max(20, z - 15))} className="w-6 h-6 flex items-center justify-center rounded text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors">
          <ZoomOut className="w-3 h-3" />
        </button>
        <div className="w-20 h-1.5 bg-panel-divider rounded-full overflow-hidden">
          <div className="h-full bg-sky-500/40 rounded-full transition-all" style={{ width: `${Math.min(100, ((timelineZoom - 20) / 160) * 100)}%` }} />
        </div>
        <button onClick={() => setTimelineZoom(z => Math.min(180, z + 15))} className="w-6 h-6 flex items-center justify-center rounded text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors">
          <ZoomIn className="w-3 h-3" />
        </button>
        <span className="text-[10px] text-theme-secondary w-10 text-center">{Math.round(timelineZoom)}px/s</span>
      </div>

      {/* Timeline scroll area */}
      <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-auto" style={{ minHeight: 0 }}>
        <div ref={scrollRef} className="relative" style={{ width: trackWidth }}>

          {/* Ruler */}
          <div
            className="h-6 border-b border-panel-divider relative cursor-pointer shrink-0 sticky top-0 z-20 bg-surface"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left + getScrollOffset();
              const t = Math.max(0, Math.min(totalDuration, x / pps));
              setCurrentTime(t);
              clearClipSelection();
              const info = getClipAtTime(t);
              if (info) setActiveClipId(info.clip.id);
            }}
          >
            {rulerMarks.map(m => (
              <div key={`r-${m.time}`} className="absolute flex flex-col items-center" style={{ left: m.time * pps }}>
                <div className="w-px h-2 bg-theme-secondary" />
                <span className="text-[9px] text-theme-secondary mt-px">{m.label}</span>
              </div>
            ))}
            {showBeatMarkers && (project.beatMarkers || []).map((beat, i) => (
              <div key={`beat-${i}`} className="absolute top-0 bottom-0 w-px pointer-events-none"
                style={{ left: beat.time * pps, backgroundColor: `rgba(251,191,36,${beat.intensity * 0.6 + 0.2})` }} />
            ))}
            {(project.sceneMarkers || []).map(marker => (
              <div key={marker.id} className="absolute top-0 flex flex-col items-center cursor-pointer z-10 group"
                style={{ left: marker.time * pps }}
                onClick={e => { e.stopPropagation(); jumpToMarker(marker.id); }}
                title={marker.label}
              >
                <div className="w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `8px solid ${marker.color}` }} />
                <div className="w-px flex-1" style={{ backgroundColor: marker.color }} />
                <div className="absolute top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                  style={{ backgroundColor: marker.color }}>
                  {marker.label}
                </div>
              </div>
            ))}
            <div
              className="absolute top-0 w-3 h-3 bg-sky-400 -translate-x-1/2 cursor-col-resize z-10"
              style={{ left: playheadX, clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)' }}
              onMouseDown={() => setDraggingPlayhead(true)}
            />
          </div>

          {/* Track rows */}
          <div className="flex">
            {/* Labels */}
            <div className="w-20 shrink-0 border-r border-panel-divider flex flex-col sticky left-0 z-10 bg-surface">
              <div className="h-14 flex items-center gap-1 px-2 border-b border-panel-divider">
                <Film className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Video</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-panel-divider">
                <Type className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Text</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-panel-divider">
                <Smile className="w-3 h-3 text-pink-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Stickers</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-panel-divider">
                <ImageIcon className="w-3 h-3 text-teal-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Photos</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-panel-divider">
                <Music className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Audio</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2">
                <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-theme-muted font-medium">Subtitles</span>
              </div>
            </div>

            {/* Content */}
            <div ref={trackRef} className="flex-1 relative" onMouseDown={handleTrackMouseDown}>

              {/* ─── VIDEO TRACK ─────────────────────────────────── */}
              <div className="h-14 border-b border-panel-divider relative">
                {dragClipId && dragClipOverIndex !== null && (
                  <div className="absolute top-0 bottom-0 w-0.5 bg-sky-400 z-30 pointer-events-none rounded-full"
                    style={{ left: getClipLeft(dragClipOverIndex) }} />
                )}
                {sortedClips.map((clip, index) => {
                  const left = getClipLeft(index);
                  const width = getClipWidth(clip);
                  const isActive = activeClipId === clip.id;
                  const isSelected = selectedClipIds.includes(clip.id);
                  const isDragging = dragClipId === clip.id;
                  const effDur = (clip.duration - clip.trimStart - clip.trimEnd) / Math.max(0.25, clip.speed);

                  return (
                    <div
                      key={clip.id}
                      data-noseek="1"
                      className={`absolute top-1 bottom-1 rounded-lg overflow-hidden group transition-all ${
                        isActive ? 'ring-2 ring-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.15)] z-10' : isSelected ? 'ring-2 ring-sky-400/50 z-10' : 'hover:ring-1 hover:ring-sky-500/30 z-[5]'
                      } ${isDragging ? 'opacity-40 scale-y-95 z-20' : ''}`}
                      style={{ left, width: Math.max(width, 8) }}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('[data-trim]')) return;
                        e.stopPropagation();
                        if (e.ctrlKey || e.metaKey) toggleClipSelection(clip.id);
                        else clearClipSelection();
                        setActiveClipId(clip.id);
                        // Seek to the start of this clip so preview shows correct frame
                        setCurrentTime(getClipLeft(index) / pps);
                      }}
                      onDoubleClick={(e) => {
                        if ((e.target as HTMLElement).closest('[data-trim]')) return;
                        e.stopPropagation();
                        const rect = trackRef.current!.getBoundingClientRect();
                        const clickX = e.clientX - rect.left + getScrollOffset();
                        const timeFromStart = (clickX - left) / pps;
                        if (timeFromStart > 0.05) splitClip(clip.id, timeFromStart);
                      }}
                    >
                      {clip.thumbnails[0] && (
                        <div className="absolute inset-0">
                          <img src={clip.thumbnails[0]} alt="" className="w-full h-full object-cover opacity-40" draggable={false} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/60 via-sky-900/35 to-sky-950/60" />

                      {clip.effect !== 'none' && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-accent-violet-muted text-[8px] text-accent-violet font-bold uppercase leading-none">{clip.effect}</div>
                      )}
                      {clip.speed !== 1 && (
                        <div className="absolute top-1 right-6 px-1 py-0.5 rounded bg-accent-amber-muted text-[8px] text-accent-amber font-bold leading-none">{clip.speed}x</div>
                      )}

                      {/* Clip body - draggable area for reordering */}
                      <div
                        className="absolute inset-0 flex items-center justify-center px-3 cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => {
                          if ((e.target as HTMLElement).closest('[data-trim]')) return;
                          e.stopPropagation();
                          setDragClipId(clip.id);
                        }}
                      >
                        <span className="text-[10px] font-medium text-white truncate drop-shadow-md" title={clip.name}>{clip.name}</span>
                      </div>
                      <div className="absolute bottom-0.5 right-1 pointer-events-none">
                        <span className="text-[8px] text-theme-muted-secondary font-mono">{effDur.toFixed(1)}s</span>
                      </div>

                      {/* Effect duration bar — shows configured effect duration as a sub-bar */}
                      {clip.effect !== 'none' && (
                        <div className="absolute bottom-0 left-0 h-1 bg-accent-violet pointer-events-none"
                          style={{
                            width: clip.effectDuration > 0
                              ? `${Math.min(100, (clip.effectDuration / effDur) * 100)}%`
                              : '100%'
                          }}
                          title={`Effect: ${clip.effect} — ${clip.effectDuration > 0 ? clip.effectDuration.toFixed(1) + 's' : 'full clip'}`}
                        />
                      )}

                      {/* Transition duration indicator on left edge */}
                      {clip.transitionIn !== 'none' && (
                        <div className="absolute top-0 left-0 h-full bg-sky-500/20 pointer-events-none"
                          style={{ width: `${Math.min(100, ((clip.transitionDuration ?? 0.5) / effDur) * 100)}%` }}
                          title={`Transition: ${clip.transitionIn} — ${(clip.transitionDuration ?? 0.5).toFixed(1)}s`}
                        />
                      )}

                      {/* Left trim handle */}
                      <div data-trim="left"
                        className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-sky-400/30 z-20 transition-colors group"
                        onMouseDown={(e) => { e.stopPropagation(); setTrimClipId({ id: clip.id, side: 'left' }); }}>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-theme-secondary group-hover:bg-theme-primary rounded-r transition-colors" />
                      </div>
                      {/* Right trim handle */}
                      <div data-trim="right"
                        className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-sky-400/30 z-20 transition-colors group"
                        onMouseDown={(e) => { e.stopPropagation(); setTrimClipId({ id: clip.id, side: 'right' }); }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-theme-secondary group-hover:bg-theme-primary rounded-l transition-colors" />
                      </div>

                      <button data-trim="del"
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-red-600 hover:bg-red-700 transition-all z-10"
                        onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                        title="Delete clip">
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                      <button data-trim="overlay"
                        className="absolute top-0.5 right-7 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-violet-600 hover:bg-violet-700 transition-all z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          useVideoStore.getState().updateClip(clip.id, { overlayMode: 'overlay', clipX: 50, clipY: 50 });
                        }}
                        title="Convert to overlay">
                        <Maximize2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ─── TEXT TRACK ──────────────────────────────────── */}
              <div className="h-10 border-b border-panel-divider relative">
                {project.textOverlays.map(overlay => {
                  const left = overlay.startTime * pps;
                  const width = Math.max(8, (overlay.endTime - overlay.startTime) * pps);
                  const isActive = activeTextId === overlay.id;
                  return (
                    <div key={overlay.id} data-noseek="1"
                      className={`absolute top-0.5 bottom-0.5 rounded flex items-center group ${
                        dragTextId === overlay.id ? 'opacity-50 scale-y-95 z-20' : ''
                      } ${
                        isActive ? 'ring-2 ring-amber-400/60 bg-amber-500/20' : 'bg-amber-500/15 hover:bg-amber-500/25'
                      } border border-amber-500/30 transition-all`}
                      style={{ left, width }}
                      onClick={(e) => { e.stopPropagation(); setActiveTextId(overlay.id); }}
                    >
                      <div data-trim="left"
                        className="absolute top-0 bottom-0 left-0 w-2.5 cursor-col-resize hover:bg-amber-400/20 z-10 flex items-center justify-start pl-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: overlay.startTime, origEnd: overlay.endTime };
                          setTrimTextId({ id: overlay.id, side: 'left' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-amber rounded-full" />
                      </div>
                      <div className="flex-1 flex items-center px-3 h-full overflow-hidden cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => {
                          if ((e.target as HTMLElement).closest('[data-trim]')) return;
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: overlay.startTime, origEnd: overlay.endTime };
                          setDragTextId(overlay.id);
                        }}>
                        <Type className="w-2.5 h-2.5 text-amber-400 shrink-0 mr-1" />
                        <span className="text-[9px] text-accent-amber-light truncate flex-1" title={overlay.text}>{overlay.text}</span>
                        {width > 60 && <span className="text-[8px] text-accent-amber-muted font-mono ml-1 shrink-0">{(overlay.endTime - overlay.startTime).toFixed(1)}s</span>}
                      </div>
                      <div data-trim="right"
                        className="absolute top-0 bottom-0 right-0 w-2.5 cursor-col-resize hover:bg-amber-400/20 z-10 flex items-center justify-end pr-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: overlay.startTime, origEnd: overlay.endTime };
                          setTrimTextId({ id: overlay.id, side: 'right' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-amber rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── STICKERS TRACK ──────────────────────────────── */}
              <div className="h-10 border-b border-panel-divider relative">
                {(project.stickerOverlays || []).filter(s => s.type !== 'photo').length === 0 && (
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                    <span className="text-[9px] text-theme-muted">No stickers</span>
                  </div>
                )}
                {(project.stickerOverlays || []).filter(s => s.type !== 'photo').map(sticker => {
                  const dur = sticker.endTime - sticker.startTime;
                  const left = sticker.startTime * pps;
                  const width = Math.max(8, dur * pps);
                  const isDragging = dragStickerId === sticker.id;
                  return (
                    <div key={sticker.id} data-noseek="1"
                      className={`absolute top-0.5 bottom-0.5 rounded border border-pink-500/30 flex items-center group ${
                        isDragging ? 'opacity-50 bg-pink-500/30' : 'bg-pink-500/15 hover:bg-pink-500/25'
                      }`}
                      style={{ left, width }}
                      onMouseDown={(e) => {
                        if ((e.target as HTMLElement).closest('[data-trim]')) return;
                        e.stopPropagation();
                        dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                        setDragStickerId(sticker.id);
                      }}
                      title={sticker.content}
                    >
                      {/* U3: Add trim handles for sticker overlays */}
                      <div data-trim="left"
                        className="absolute top-0 bottom-0 left-0 w-2.5 cursor-col-resize hover:bg-pink-400/20 z-10 flex items-center justify-start pl-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                          setTrimPhotoId({ id: sticker.id, side: 'left' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-pink rounded-full" />
                      </div>
                      <div className="flex-1 flex items-center px-3 h-full overflow-hidden cursor-grab active:cursor-grabbing">
                        <Smile className="w-2.5 h-2.5 text-pink-400 shrink-0 mr-1" />
                        <span className="text-[9px] text-accent-pink-light truncate flex-1" title={sticker.content}>{sticker.content}</span>
                        {width > 60 && <span className="text-[8px] text-accent-pink-muted font-mono ml-1 shrink-0">{(sticker.endTime - sticker.startTime).toFixed(1)}s</span>}
                      </div>
                      <div data-trim="right"
                        className="absolute top-0 bottom-0 right-0 w-2.5 cursor-col-resize hover:bg-pink-400/20 z-10 flex items-center justify-end pr-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                          setTrimPhotoId({ id: sticker.id, side: 'right' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-pink rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── PHOTOS TRACK ─────────────────────────────────── */}
              <div className="h-10 border-b border-panel-divider relative">
                {(() => {
                  const photoStickers = (project.stickerOverlays || []).filter(s => s.type === 'photo');
                  if (photoStickers.length === 0) {
                    return (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-[9px] text-theme-muted">No photos</span>
                      </div>
                    );
                  }
                  return photoStickers.map(sticker => {
                    const dur = sticker.endTime - sticker.startTime;
                    const left = sticker.startTime * pps;
                    const width = Math.max(8, dur * pps);
                    const isActive = activeStickerOverlayId === sticker.id;
                    return (
                      <div key={sticker.id} data-noseek="1"
                        className={`absolute top-0.5 bottom-0.5 rounded border border-teal-500/30 flex items-center group ${
                          isActive ? 'bg-teal-500/25 ring-2 ring-teal-400/60' : 'bg-teal-500/15 hover:bg-teal-500/25'
                        }`}
                        style={{ left, width }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStickerOverlayId(sticker.id);
                        }}
                        title="Photo overlay"
                      >
                        <div data-trim="left"
                          className="absolute top-0 bottom-0 left-0 w-2.5 cursor-col-resize hover:bg-teal-400/20 z-10 flex items-center justify-start pl-0.5 transition-colors"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                            setTrimPhotoId({ id: sticker.id, side: 'left' });
                          }}>
                          <div className="w-0.5 h-4 bg-accent-teal rounded-full" />
                        </div>
                        <div className="flex-1 flex items-center px-3 h-full overflow-hidden cursor-grab active:cursor-grabbing"
                          onMouseDown={(e) => {
                            if ((e.target as HTMLElement).closest('[data-trim]')) return;
                            e.stopPropagation();
                            setActiveStickerOverlayId(sticker.id);
                            dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                            setDragStickerId(sticker.id);
                          }}>
                          <ImageIcon className="w-2.5 h-2.5 text-teal-400 shrink-0 mr-1" />
                          <span className="text-[9px] text-accent-teal-light truncate flex-1">Photo</span>
                          {width > 50 && <span className="text-[8px] text-accent-teal-muted font-mono ml-1 shrink-0">{dur.toFixed(1)}s</span>}
                        </div>
                        <div data-trim="right"
                          className="absolute top-0 bottom-0 right-0 w-2.5 cursor-col-resize hover:bg-teal-400/20 z-10 flex items-center justify-end pr-0.5 transition-colors"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            dragInitRef.current = { startX: e.clientX, origStart: sticker.startTime, origEnd: sticker.endTime };
                            setTrimPhotoId({ id: sticker.id, side: 'right' });
                          }}>
                          <div className="w-0.5 h-4 bg-accent-teal rounded-full" />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* ─── AUDIO TRACK ─────────────────────────────────── */}
              <div className="h-10 border-b border-panel-divider relative">
                {project.audioTracks.map(track => {
                  const left = track.startTime * pps;
                  const width = track.duration > 0 ? track.duration * pps : Math.max(60, totalDuration * pps * 0.3);
                  const isSelected = activeAudioTrackId === track.id;
                  return (
                    <div key={track.id} data-noseek="1"
                      className={`absolute top-0.5 bottom-0.5 rounded flex items-center px-1.5 cursor-pointer select-none ${
                        isSelected ? 'bg-violet-500/25 border-2 border-violet-400/60' : 'bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25'
                      }`}
                      style={{ left, width }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAudioTrackId(bgm.id);
                      }}
                    >
                      <div className="absolute inset-x-1 top-1 bottom-1 flex items-end gap-px opacity-40 pointer-events-none">
                        {getWaveformBars(bgm.name, Math.max(8, Math.floor(width / 4))).map((bar, i) => (
                          <div key={i} className="flex-1 bg-emerald-300 rounded-t-sm" style={{ height: `${Math.max(12, bar * 100)}%` }} />
                        ))}
                      </div>
                      <Volume2 className="w-2.5 h-2.5 text-emerald-400 shrink-0 mr-1" />
                      <span className="text-[9px] text-accent-emerald-light truncate">{bgm.name}</span>
                      {bgm.duration > 0 && <span className="text-[8px] text-accent-emerald-muted font-mono ml-1 shrink-0">{bgm.duration.toFixed(1)}s</span>}
                    </div>
                  );
                })()}
              </div>

              {/* ─── SUBTITLES TRACK ─────────────────────────────── */}
              <div className="h-10 relative">
                {project.subtitles.map(sub => {
                  const left = sub.startTime * pps;
                  const width = Math.max(8, (sub.endTime - sub.startTime) * pps);
                  const isActive = activeSubtitleId === sub.id;
                  return (
                    <div key={sub.id} data-noseek="1"
                      className={`absolute top-0.5 bottom-0.5 rounded flex items-center group ${
                        dragSubtitleId === sub.id ? 'opacity-50 scale-y-95 z-20' : ''
                      } ${
                        isActive ? 'ring-2 ring-cyan-400/60 bg-cyan-500/20' : 'bg-cyan-500/15 hover:bg-cyan-500/25'
                      } border border-cyan-500/30 transition-all`}
                      style={{ left, width }}
                      onClick={(e) => { e.stopPropagation(); setActiveSubtitleId(sub.id); }}
                    >
                      <div data-trim="left"
                        className="absolute top-0 bottom-0 left-0 w-2.5 cursor-col-resize hover:bg-rose-400/20 z-10 flex items-center justify-start pl-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: sub.startTime, origEnd: sub.endTime };
                          setTrimSubtitleId({ id: sub.id, side: 'left' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-rose rounded-full" />
                      </div>
                      <div className="flex-1 flex items-center px-3 h-full overflow-hidden cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => {
                          if ((e.target as HTMLElement).closest('[data-trim]')) return;
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: sub.startTime, origEnd: sub.endTime };
                          setDragSubtitleId(sub.id);
                        }}>
                        <span className="text-[9px] text-accent-rose-light truncate flex-1" title={sub.text}>{sub.text}</span>
                        {width > 50 && <span className="text-[8px] text-accent-rose-muted font-mono ml-1 shrink-0">{(sub.endTime - sub.startTime).toFixed(1)}s</span>}
                      </div>
                      <div data-trim="right"
                        className="absolute top-0 bottom-0 right-0 w-2.5 cursor-col-resize hover:bg-rose-400/20 z-10 flex items-center justify-end pr-0.5 transition-colors"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dragInitRef.current = { startX: e.clientX, origStart: sub.startTime, origEnd: sub.endTime };
                          setTrimSubtitleId({ id: sub.id, side: 'right' });
                        }}>
                        <div className="w-0.5 h-4 bg-accent-rose rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── PLAYHEAD ────────────────────────────────────── */}
              <div className="absolute top-0 bottom-0 w-px bg-sky-400 pointer-events-none z-20"
                style={{ left: playheadX, transition: draggingPlayhead ? 'none' : 'left 0.05s linear' }}>
                <div className="absolute -top-0.5 -left-1 w-2.5 h-2 bg-sky-400 rounded-sm shadow-md" />
              </div>
            </div>
          </div>

          {sortedClips.length === 0 && project.textOverlays.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-theme-dim">Drop video clips here or use the sidebar to start editing</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-1 border-t border-panel-divider shrink-0">
        <span className="text-[9px] text-theme-secondary"><kbd className="px-1 py-0.5 rounded bg-panel-light text-theme-secondary text-[8px]">Space</kbd> Play/Pause</span>
        <span className="text-[9px] text-theme-secondary"><kbd className="px-1 py-0.5 rounded bg-panel-light text-theme-secondary text-[8px]">S</kbd> Split at playhead</span>
        <span className="text-[9px] text-theme-secondary"><kbd className="px-1 py-0.5 rounded bg-panel-light text-theme-secondary text-[8px]">Del</kbd> Remove selected</span>
        <span className="text-[9px] text-theme-secondary"><kbd className="px-1 py-0.5 rounded bg-panel-light text-theme-secondary text-[8px]">Ctrl+Z</kbd> Undo</span>
        <span className="text-[9px] text-theme-secondary opacity-50">Drag clips to reorder • Double-click to split • Drag edges to trim</span>
      </div>
    </div>
  );
}