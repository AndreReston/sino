import React, { useRef, useState, useEffect } from 'react';
import { Scissors, Trash2, GripVertical } from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

export default function VideoTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const {
    project,
    currentTime,
    isPlaying,
    activeClipId,
    setCurrentTime,
    setActiveClipId,
    reorderClip,
    splitClip,
    removeClip,
  } = useVideoStore();

  const [containerWidth, setContainerWidth] = useState(0);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState<{
    clipId: string;
    x: number;
    y: number;
  } | null>(null);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate total duration
  const getTotalDuration = (): number => {
    if (!project.clips || project.clips.length === 0) return 1;
    let total = 0;
    const sortedClips = [...project.clips].sort((a, b) => a.order - b.order);
    for (const clip of sortedClips) {
      const effectiveDuration =
        (clip.duration - (clip.trimStart || 0) - (clip.trimEnd || 0)) /
        (clip.speed || 1);
      total += effectiveDuration;
    }
    return Math.max(total, 1);
  };

  const totalDuration = getTotalDuration();
  const pixelsPerSecond =
    containerWidth > 0 ? containerWidth / totalDuration : 0;

  // Generate ruler marks
  const getRulerMarks = (): { time: number; label: string }[] => {
    const marks: { time: number; label: string }[] = [];
    const interval = Math.ceil(5 / (pixelsPerSecond > 0 ? pixelsPerSecond : 1));
    const roundedInterval = Math.max(1, Math.ceil(interval / 5) * 5);

    for (let time = 0; time <= totalDuration; time += roundedInterval) {
      marks.push({
        time,
        label: `${Math.floor(time)}s`,
      });
    }
    return marks;
  };

  const rulerMarks = getRulerMarks();

  // Calculate clip position and width
  const getClipMetrics = (clipIndex: number) => {
    const sortedClips = [...(project.clips || [])].sort((a, b) => a.order - b.order);
    let positionSeconds = 0;

    for (let i = 0; i < clipIndex; i++) {
      const clip = sortedClips[i];
      const effectiveDuration =
        (clip.duration - (clip.trimStart || 0) - (clip.trimEnd || 0)) /
        (clip.speed || 1);
      positionSeconds += effectiveDuration;
    }

    const clip = sortedClips[clipIndex];
    const effectiveDuration =
      (clip.duration - (clip.trimStart || 0) - (clip.trimEnd || 0)) /
      (clip.speed || 1);

    return {
      left: positionSeconds * pixelsPerSecond,
      width: effectiveDuration * pixelsPerSecond,
      clip,
    };
  };

  // Handle ruler click to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / pixelsPerSecond) * (totalDuration / containerWidth);
    setCurrentTime(Math.max(0, Math.min(seekTime, totalDuration)));
  };

  // Handle clip selection
  const handleClipClick = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveClipId(clipId);
  };

  // Handle clip double-click to split
  const handleClipDoubleClick = (
    clipId: string,
    trackRect: DOMRect,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const clickX = e.clientX - trackRect.left;
    const timeFromStart = (clickX / pixelsPerSecond) * (totalDuration / containerWidth);
    splitClip(clipId, timeFromStart);
  };

  // Handle clip right-click context menu
  const handleClipContextMenu = (
    clipId: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu({
      clipId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle clip drag start
  const handleClipMouseDown = (clipId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) {
      return;
    }
    e.stopPropagation();
    setDraggingClipId(clipId);
    setDragStartX(e.clientX);
  };

  // Handle drag movement and drop
  useEffect(() => {
    if (!draggingClipId) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Drag visual feedback is implicit via activeClipId highlighting
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!trackRef.current) {
        setDraggingClipId(null);
        return;
      }

      const sortedClips = [...(project.clips || [])].sort((a, b) => a.order - b.order);
      const currentIndex = sortedClips.findIndex((c) => c.id === draggingClipId);

      if (currentIndex === -1) {
        setDraggingClipId(null);
        return;
      }

      const rect = trackRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;

      // Calculate which clip the drop happened over
      let newIndex = currentIndex;
      let positionSeconds = 0;

      for (let i = 0; i < sortedClips.length; i++) {
        const clip = sortedClips[i];
        const effectiveDuration =
          (clip.duration - (clip.trimStart || 0) - (clip.trimEnd || 0)) /
          (clip.speed || 1);
        const clipWidth = effectiveDuration * pixelsPerSecond;

        if (dropX < positionSeconds + clipWidth / 2) {
          newIndex = i;
          break;
        }
        positionSeconds += clipWidth;
        if (i === sortedClips.length - 1) {
          newIndex = sortedClips.length - 1;
        }
      }

      if (newIndex !== currentIndex) {
        reorderClip(draggingClipId, newIndex);
      }

      setDraggingClipId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingClipId, project.clips, pixelsPerSecond, reorderClip]);

  // Close context menu on click outside
  useEffect(() => {
    if (!showContextMenu) return;

    const handleClick = () => {
      setShowContextMenu(null);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showContextMenu]);

  const sortedClips = [...(project.clips || [])].sort((a, b) => a.order - b.order);
  const playheadX = (currentTime / totalDuration) * containerWidth;

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0c0c10] border-t border-zinc-800 flex flex-col"
    >
      {/* Ruler */}
      <div
        ref={rulerRef}
        onClick={handleRulerClick}
        className="h-8 bg-[#111115] border-b border-zinc-800 relative cursor-pointer flex items-center"
      >
        {rulerMarks.map((mark) => {
          const markX = (mark.time / totalDuration) * containerWidth;
          return (
            <div
              key={`mark-${mark.time}`}
              className="absolute flex flex-col items-center"
              style={{ left: `${markX}px` }}
            >
              <div className="w-0.5 h-2 bg-zinc-500" />
              <span className="text-xs text-zinc-400 mt-0.5 ml-2">
                {mark.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Text Overlay Indicators Track */}
      {(project.textOverlays || []).length > 0 && (
        <div className="h-6 bg-[#0c0c10] relative border-b border-zinc-800/50">
          {project.textOverlays.map((overlay) => {
            const startX = (overlay.startTime / totalDuration) * containerWidth;
            const duration = (overlay.endTime - overlay.startTime) / totalDuration;
            const width = Math.max(duration * containerWidth, 2);

            return (
              <div
                key={overlay.id}
                className="absolute h-4 bg-amber-500/30 border border-amber-500/50 rounded"
                style={{
                  left: `${startX}px`,
                  width: `${width}px`,
                  top: '1px',
                }}
                title={overlay.text}
              />
            );
          })}
        </div>
      )}

      {/* Clips Track */}
      <div
        ref={trackRef}
        className="flex-1 relative bg-[#0c0c10] overflow-hidden"
      >
        {sortedClips.map((clip, index) => {
          const { left, width } = getClipMetrics(index);
          const isSelected = activeClipId === clip.id;
          const isDragging = draggingClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`absolute h-16 rounded border-2 transition-colors ${
                isSelected
                  ? 'border-sky-500/40 bg-sky-500/5'
                  : 'border-zinc-700 bg-zinc-800'
              } ${isDragging ? 'opacity-75' : 'opacity-100'} group`}
              style={{
                left: `${left}px`,
                width: `${Math.max(width, 4)}px`,
                top: '8px',
              }}
              onClick={(e) => handleClipClick(clip.id, e)}
              onDoubleClick={(e) =>
                handleClipDoubleClick(clip.id, trackRef.current!.getBoundingClientRect(), e)
              }
              onContextMenu={(e) => handleClipContextMenu(clip.id, e)}
              onMouseDown={(e) => handleClipMouseDown(clip.id, e)}
            >
              {/* Thumbnail background */}
              {(clip.thumbnails || []).length > 0 && (
                <div
                  className="absolute inset-0 rounded bg-cover bg-left opacity-60"
                  style={{
                    backgroundImage: `url('${clip.thumbnails[0]}')`,
                    backgroundSize: 'cover',
                  }}
                />
              )}

              {/* Clip name */}
              <div className="absolute inset-0 flex items-center justify-center px-2 py-1 rounded">
                <span className="text-xs font-medium text-white truncate drop-shadow-lg">
                  {clip.name}
                </span>
              </div>

              {/* Hover actions */}
              <div
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
                data-no-drag="true"
              >
                <button
                  className="p-1 bg-zinc-700 hover:bg-red-600 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClip(clip.id);
                  }}
                  title="Delete clip"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>

              {/* Drag handle */}
              <div
                className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                data-no-drag="true"
              >
                <GripVertical size={12} className="text-zinc-400" />
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-sky-400 pointer-events-none z-20"
          style={{
            left: `${playheadX}px`,
            boxShadow: '0 0 2px rgba(56, 189, 248, 0.5)',
          }}
        >
          {/* Playhead triangle */}
          <div
            className="absolute -left-1.5 -top-1 w-4 h-2 bg-sky-400"
            style={{
              clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
            }}
          />
        </div>
      </div>

      {/* Subtitle Indicators Track */}
      {(project.subtitles || []).length > 0 && (
        <div className="h-6 bg-[#0c0c10] relative border-t border-zinc-800/50">
          {project.subtitles.map((subtitle) => {
            const startX = (subtitle.startTime / totalDuration) * containerWidth;
            const duration = (subtitle.endTime - subtitle.startTime) / totalDuration;
            const width = Math.max(duration * containerWidth, 2);

            return (
              <div
                key={subtitle.id}
                className="absolute h-4 bg-violet-500/30 border border-violet-500/50 rounded"
                style={{
                  left: `${startX}px`,
                  width: `${width}px`,
                  top: '1px',
                }}
                title={subtitle.text}
              />
            );
          })}
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-30"
          style={{
            left: `${showContextMenu.x}px`,
            top: `${showContextMenu.y}px`,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-white hover:bg-zinc-700 flex items-center gap-2 whitespace-nowrap"
            onClick={() => {
              splitClip(showContextMenu.clipId, currentTime);
              setShowContextMenu(null);
            }}
          >
            <Scissors size={14} />
            Split at playhead
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2 whitespace-nowrap border-t border-zinc-700"
            onClick={() => {
              removeClip(showContextMenu.clipId);
              setShowContextMenu(null);
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
