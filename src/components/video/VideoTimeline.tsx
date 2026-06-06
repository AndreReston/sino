import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Trash2, ZoomIn, ZoomOut, Film, Type, Volume2,
  Music,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

export default function VideoTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const project = useVideoStore(s => s.project);
  const currentTime = useVideoStore(s => s.currentTime);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const activeTextId = useVideoStore(s => s.activeTextId);
  const setCurrentTime = useVideoStore(s => s.setCurrentTime);
  const setActiveClipId = useVideoStore(s => s.setActiveClipId);
  const setActiveTextId = useVideoStore(s => s.setActiveTextId);
  const reorderClip = useVideoStore(s => s.reorderClip);
  const splitClip = useVideoStore(s => s.splitClip);
  const removeClip = useVideoStore(s => s.removeClip);
  const updateClip = useVideoStore(s => s.updateClip);
  const updateTextOverlay = useVideoStore(s => s.updateTextOverlay);
  const getTotalDuration = useVideoStore(s => s.getTotalDuration);
  const showBeatMarkers = useVideoStore(s => s.showBeatMarkers);
  const jumpToMarker = useVideoStore(s => s.jumpToMarker);

  const [containerWidth, setContainerWidth] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(80);
  const [dragClipId, setDragClipId] = useState<string | null>(null);
  const [trimClipId, setTrimClipId] = useState<{ id: string; side: 'left' | 'right' } | null>(null);
  const [dragTextId, setDragTextId] = useState<string | null>(null);
  const [dragTextStartX, setDragTextStartX] = useState(0);

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
  const trackWidth = Math.max(containerWidth, totalDuration * timelineZoom + 100);
  const pps = containerWidth > 0 && totalDuration > 0 ? containerWidth / totalDuration : timelineZoom;

  // Playhead position
  const playheadX = currentTime * pps;

  // ── Ruler marks ──────────────────────────────────────────────────────
  const getRulerMarks = () => {
    const marks: { time: number; label: string }[] = [];
    const interval = pps > 60 ? 1 : pps > 20 ? 5 : 10;
    for (let t = 0; t <= totalDuration; t += interval) {
      marks.push({ time: t, label: `${Math.floor(t)}s` });
    }
    return marks;
  };
  const rulerMarks = getRulerMarks();

  // ── Clip positioning ────────────────────────────────────────────────
  const sortedClips = React.useMemo(
    () => [...(project?.clips || [])].sort((a, b) => a.order - b.order),
    [project?.clips]
  );

  const getClipLeft = (index: number): number => {
    let sec = 0;
    for (let i = 0; i < index; i++) {
      sec += (sortedClips[i].duration - sortedClips[i].trimStart - sortedClips[i].trimEnd) / Math.max(0.25, sortedClips[i].speed);
    }
    return sec * pps;
  };

  const getClipWidth = (clip: typeof sortedClips[0]): number => {
    return Math.max(8, ((clip.duration - clip.trimStart - clip.trimEnd) / Math.max(0.25, clip.speed)) * pps);
  };

  // ── Ruler / track click to seek ──────────────────────────────────────
  const handleTrackMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
    const time = Math.max(0, Math.min(totalDuration, x / pps));
    setCurrentTime(time);
  }, [pps, totalDuration, setCurrentTime]);

  // ── Playhead drag ────────────────────────────────────────────────────
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  useEffect(() => {
    if (!draggingPlayhead) return;
    const move = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
      setCurrentTime(Math.max(0, Math.min(totalDuration, x / pps)));
    };
    const up = () => setDraggingPlayhead(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [draggingPlayhead, pps, totalDuration, setCurrentTime]);

  // ── Clip drag reorder ────────────────────────────────────────────────
  useEffect(() => {
    if (!dragClipId) return;
    const move = () => { /* visual feedback implicit */ };
    const up = (e: MouseEvent) => {
      if (!trackRef.current) { setDragClipId(null); return; }
      const rect = trackRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      let newIndex = sortedClips.findIndex(c => c.id === dragClipId);
      let pos = 0;
      for (let i = 0; i < sortedClips.length; i++) {
        const w = getClipWidth(sortedClips[i]);
        if (dropX < pos + w / 2) { newIndex = i; break; }
        pos += w;
        if (i === sortedClips.length - 1) newIndex = sortedClips.length - 1;
      }
      const oldIndex = sortedClips.findIndex(c => c.id === dragClipId);
      if (oldIndex !== newIndex && newIndex !== -1) reorderClip(dragClipId, newIndex);
      setDragClipId(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragClipId, sortedClips, pps, reorderClip]);

  // ── Trim handle drag ─────────────────────────────────────────────────
  useEffect(() => {
    if (!trimClipId) return;
    const { id, side } = trimClipId;
    const clip = project?.clips.find(c => c.id === id);
    if (!clip) return;

    const move = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (side === 'left') {
        const clipStart = getClipLeft(sortedClips.findIndex(c => c.id === id));
        // Approximate trim from pixel delta
        const delta = (e.clientX - rect.left) - clipStart;
        const newTrimStart = Math.max(0, Math.min(clip.duration - clip.trimEnd - 0.1, delta / pps));
        updateClip(id, { trimStart: newTrimStart });
      } else {
        const clipsEnd = getClipLeft(sortedClips.findIndex(c => c.id === id)) + getClipWidth(clip);
        const delta = clipsEnd - (e.clientX - rect.left);
        const newTrimEnd = Math.max(0, Math.min(clip.duration - clip.trimStart - 0.1, delta / pps));
        updateClip(id, { trimEnd: newTrimEnd });
      }
    };
    const up = () => setTrimClipId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [trimClipId, project?.clips, sortedClips, pps, updateClip]);

  // ── Text overlay drag ────────────────────────────────────────────────
  useEffect(() => {
    if (!dragTextId) return;
    const overlay = project?.textOverlays.find(t => t.id === dragTextId);
    if (!overlay) return;
    const origStart = overlay.startTime;
    const origEnd = overlay.endTime;
    const startX = dragTextStartX;

    const move = (e: MouseEvent) => {
      const deltaPx = e.clientX - startX;
      const deltaSec = deltaPx / pps;
      const duration = origEnd - origStart;
      const newStart = Math.max(0, origStart + deltaSec);
      updateTextOverlay(dragTextId, { startTime: newStart, endTime: newStart + duration });
    };
    const up = () => setDragTextId(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragTextId, dragTextStartX, project?.textOverlays, pps, updateTextOverlay]);

  if (!project) return null;

  return (
    <div className="bg-[#0c0c10] border-t border-zinc-800 flex flex-col" style={{ minHeight: 200 }}>
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800/60 shrink-0">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">Timeline</span>
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-600">{sortedClips.length} clip{sortedClips.length !== 1 ? 's' : ''}</span>
        <div className="w-px h-4 bg-zinc-800 mx-1" />
        <button onClick={() => setTimelineZoom(Math.max(20, timelineZoom - 15))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors">
          <ZoomOut className="w-3 h-3" />
        </button>
        <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500/40 rounded-full transition-all" style={{ width: `${Math.min(100, ((timelineZoom - 20) / 160) * 100)}%` }} />
        </div>
        <button onClick={() => setTimelineZoom(Math.min(180, timelineZoom + 15))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors">
          <ZoomIn className="w-3 h-3" />
        </button>
        <span className="text-[10px] text-zinc-600 w-10 text-center">{Math.round(timelineZoom)}px/s</span>
      </div>

      {/* Timeline area with tracks */}
      <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-hidden" style={{ minHeight: 0 }}>
        <div ref={scrollRef} className="relative" style={{ width: trackWidth, minHeight: 160 }}>
          {/* Ruler */}
          <div
            className="h-6 border-b border-zinc-800/50 relative cursor-pointer shrink-0"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setCurrentTime(Math.max(0, Math.min(totalDuration, x / pps)));
            }}
          >
            {rulerMarks.map(m => (
              <div key={`r-${m.time}`} className="absolute flex flex-col items-center" style={{ left: m.time * pps }}>
                <div className="w-px h-2 bg-zinc-600" />
                <span className="text-[9px] text-zinc-600 mt-px">{m.label}</span>
              </div>
            ))}

            {/* Beat markers on ruler */}
            {showBeatMarkers && (project?.beatMarkers || []).map((beat, i) => (
              <div key={`beat-${i}`} className="absolute top-0 bottom-0 w-px pointer-events-none"
                style={{ left: beat.time * pps, backgroundColor: `rgba(251,191,36,${beat.intensity * 0.6 + 0.2})` }} />
            ))}

            {/* Scene markers on ruler */}
            {(project?.sceneMarkers || []).map(marker => (
              <div key={marker.id} className="absolute top-0 flex flex-col items-center cursor-pointer z-10 group"
                style={{ left: marker.time * pps }}
                onClick={e => { e.stopPropagation(); jumpToMarker(marker.id); }}
                title={marker.label}>
                <div className="w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `8px solid ${marker.color}` }} />
                <div className="w-px flex-1" style={{ backgroundColor: marker.color }} />
                <div className="absolute top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5 rounded text-[8px] font-medium text-white"
                  style={{ backgroundColor: marker.color }}>
                  {marker.label}
                </div>
              </div>
            ))}

            {/* Playhead on ruler */}
            <div
              className="absolute top-0 w-3 h-3 bg-sky-400 -translate-x-1/2 cursor-col-resize z-10"
              style={{ left: playheadX, clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)' }}
              onMouseDown={() => setDraggingPlayhead(true)}
            />
          </div>

          {/* ─── Track labels ─────────────────────────────────────── */}
          <div className="flex">
            <div className="w-20 shrink-0 border-r border-zinc-800/40 flex flex-col">
              <div className="h-14 flex items-center gap-1 px-2 border-b border-zinc-800/30">
                <Film className="w-3 h-3 text-sky-400" />
                <span className="text-[10px] text-zinc-400 font-medium">Video</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-zinc-800/30">
                <Type className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-zinc-400 font-medium">Text</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2 border-b border-zinc-800/30">
                <Music className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] text-zinc-400 font-medium">Audio</span>
              </div>
              <div className="h-10 flex items-center gap-1 px-2">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-zinc-400 font-medium">SFX</span>
              </div>
            </div>

            {/* ─── Track content area ──────────────────────────────── */}
            <div ref={trackRef} className="flex-1 relative" onMouseDown={handleTrackMouseDown}>

              {/* VIDEO TRACK */}
              <div className="h-14 border-b border-zinc-800/30 relative">
                {sortedClips.map((clip, index) => {
                  const left = getClipLeft(index);
                  const width = getClipWidth(clip);
                  const isActive = activeClipId === clip.id;
                  const isDragging = dragClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 rounded-lg overflow-hidden cursor-pointer transition-shadow group ${
                        isActive
                          ? 'ring-2 ring-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                          : 'hover:ring-1 hover:ring-white/20'
                      } ${isDragging ? 'opacity-60' : ''}`}
                      style={{ left, width: Math.max(width, 8) }}
                      onClick={(e) => { e.stopPropagation(); setActiveClipId(clip.id); }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        const rect = trackRef.current!.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clipLeft = getClipLeft(index);
                        const timeFromStart = (clickX - clipLeft) / pps;
                        if (timeFromStart > 0.05) splitClip(clip.id, timeFromStart);
                      }}
                      onMouseDown={(e) => {
                        if ((e.target as HTMLElement).closest('[data-trim]')) return;
                        e.stopPropagation();
                        setDragClipId(clip.id);
                      }}
                    >
                      {/* Thumbnail bg */}
                      {clip.thumbnails[0] && (
                        <div className="absolute inset-0">
                          <img src={clip.thumbnails[0]} alt="" className="w-full h-full object-cover opacity-40" draggable={false} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-900/50 via-sky-800/30 to-sky-900/50" />

                      {/* Effect badge */}
                      {clip.effect !== 'none' && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-violet-500/20 text-[8px] text-violet-300 font-bold uppercase">
                          {clip.effect}
                        </div>
                      )}

                      {/* Clip name */}
                      <div className="absolute inset-0 flex items-center justify-center px-2">
                        <span className="text-[10px] font-medium text-white truncate drop-shadow-md">{clip.name}</span>
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-0.5 right-1">
                        <span className="text-[8px] text-sky-200/50 font-mono">{((clip.duration - clip.trimStart - clip.trimEnd) / clip.speed).toFixed(1)}s</span>
                      </div>

                      {/* Trim handles */}
                      <div data-trim="left"
                        className="absolute top-0 bottom-0 left-0 w-2.5 cursor-col-resize hover:bg-sky-400/30 z-10 transition-colors"
                        onMouseDown={(e) => { e.stopPropagation(); setTrimClipId({ id: clip.id, side: 'left' }); }}
                      >
                        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded-full" />
                      </div>
                      <div data-trim="right"
                        className="absolute top-0 bottom-0 right-0 w-2.5 cursor-col-resize hover:bg-sky-400/30 z-10 transition-colors"
                        onMouseDown={(e) => { e.stopPropagation(); setTrimClipId({ id: clip.id, side: 'right' }); }}
                      >
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded-full" />
                      </div>

                      {/* Hover delete */}
                      <button
                        data-trim="del"
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-zinc-800 hover:bg-red-600 transition-all z-10"
                        onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                        title="Delete clip"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* TEXT TRACK */}
              <div className="h-10 border-b border-zinc-800/30 relative">
                {project.textOverlays.map(overlay => {
                  const left = overlay.startTime * pps;
                  const width = Math.max(8, (overlay.endTime - overlay.startTime) * pps);
                  const isActive = activeTextId === overlay.id;
                  return (
                    <div
                      key={overlay.id}
                      className={`absolute top-0.5 bottom-0.5 rounded cursor-pointer transition-shadow ${
                        isActive ? 'ring-2 ring-amber-400/60 bg-amber-500/20' : 'bg-amber-500/15 hover:bg-amber-500/25'
                      } border border-amber-500/30`}
                      style={{ left, width }}
                      onClick={(e) => { e.stopPropagation(); setActiveTextId(overlay.id); }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDragTextId(overlay.id);
                        setDragTextStartX(e.clientX);
                      }}
                    >
                      <div className="flex items-center h-full px-1.5">
                        <Type className="w-2.5 h-2.5 text-amber-400 shrink-0 mr-1" />
                        <span className="text-[9px] text-amber-200 truncate">{overlay.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AUDIO TRACK */}
              <div className="h-10 border-b border-zinc-800/30 relative">
                {project.audioTracks.map(track => {
                  const left = track.startTime * pps;
                  const width = 40;
                  return (
                    <div
                      key={track.id}
                      className="absolute top-0.5 bottom-0.5 rounded bg-violet-500/15 border border-violet-500/30 px-1.5 flex items-center"
                      style={{ left, width }}
                    >
                      <Music className="w-2.5 h-2.5 text-violet-400 shrink-0 mr-1" />
                      <span className="text-[9px] text-violet-200 truncate">{track.name}</span>
                    </div>
                  );
                })}
                {project.backgroundMusic && (
                  <div className="absolute top-0.5 bottom-0.5 left-0 right-0 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 flex items-center">
                    <Volume2 className="w-2.5 h-2.5 text-emerald-400 shrink-0 mr-1" />
                    <span className="text-[9px] text-emerald-200 truncate">{project.backgroundMusic.name}</span>
                  </div>
                )}
              </div>

              {/* SUBTITLES TRACK */}
              <div className="h-10 relative">
                {project.subtitles.map(sub => {
                  const left = sub.startTime * pps;
                  const width = Math.max(8, (sub.endTime - sub.startTime) * pps);
                  return (
                    <div
                      key={sub.id}
                      className="absolute top-0.5 bottom-0.5 rounded bg-rose-500/15 border border-rose-500/30 px-1.5 flex items-center"
                      style={{ left, width }}
                    >
                      <span className="text-[9px] text-rose-200 truncate">{sub.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* PLAYHEAD */}
              <div
                className="absolute top-0 bottom-0 w-px bg-sky-400 pointer-events-none z-20"
                style={{ left: playheadX, transition: draggingPlayhead ? 'none' : 'left 0.05s linear' }}
              >
                <div className="absolute -top-0.5 -left-1 w-2.5 h-2 bg-sky-400 rounded-sm shadow-md" />
              </div>
            </div>
          </div>

          {/* Empty state */}
          {sortedClips.length === 0 && project.textOverlays.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-zinc-600">Drop video clips here or use the sidebar to start editing</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="flex items-center gap-3 px-3 py-1 border-t border-zinc-800/40 shrink-0">
        <span className="text-[9px] text-zinc-600"><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px]">Space</kbd> Play</span>
        <span className="text-[9px] text-zinc-600"><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px]">S</kbd> Split</span>
        <span className="text-[9px] text-zinc-600"><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px]">Del</kbd> Remove</span>
        <span className="text-[9px] text-zinc-600"><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px]">Ctrl+Z</kbd> Undo</span>
      </div>
    </div>
  );
}
