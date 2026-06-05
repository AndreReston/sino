import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Play } from 'lucide-react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const SAFE_ZONE_GUIDES = [
  { label: 'TikTok Safe', top: '15%', bottom: '15%', left: '5%', right: '5%', color: 'rgba(56,189,248,0.5)' },
  { label: 'YouTube Safe', top: '5%', bottom: '5%', left: '5%', right: '5%', color: 'rgba(250,204,21,0.5)' },
  { label: 'IG Safe', top: '10%', bottom: '10%', left: '10%', right: '10%', color: 'rgba(167,139,250,0.5)' },
];

export default function VideoPreview({ videoRef }: Props) {
  const project = useVideoStore(s => s.project);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const currentTime = useVideoStore(s => s.currentTime);
  const isPlaying = useVideoStore(s => s.isPlaying);
  const playbackSpeed = useVideoStore(s => s.playbackSpeed);
  const setCurrentTime = useVideoStore(s => s.setCurrentTime);
  const setActiveClipId = useVideoStore(s => s.setActiveClipId);
  const setActiveTextId = useVideoStore(s => s.setActiveTextId);
  const updateTextOverlay = useVideoStore(s => s.updateTextOverlay);
  const showSafeZones = useVideoStore(s => s.showSafeZones);
  const updateStickerOverlay = useVideoStore(s => s.updateStickerOverlay);
  const setActiveStickerOverlayId = useVideoStore(s => s.setActiveStickerOverlayId);
  const activeStickerOverlayId = useVideoStore(s => s.activeStickerOverlayId);

  const activeClip = project?.clips.find(c => c.id === activeClipId) ?? null;

  // Drag state for text overlays
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Drag state for sticker overlays
  const [draggingStickerData, setDraggingStickerData] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync video src when active clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (activeClip) {
      if (video.src !== activeClip.url) {
        video.src = activeClip.url;
        video.load();
      }
    }
  }, [activeClip?.id]);

  // Sync playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeClip?.id]);

  // Sync seek when not playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip || isPlaying) return;
    const clipTime = currentTime;
    if (Math.abs(video.currentTime - clipTime) > 0.1) {
      video.currentTime = clipTime;
    }
  }, [currentTime, isPlaying, activeClip?.id]);

  // Sync speed and volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;
    video.playbackRate = activeClip.speed * playbackSpeed;
    video.muted = activeClip.muted;
    video.volume = activeClip.volume;
  }, [playbackSpeed, activeClip?.speed, activeClip?.volume, activeClip?.muted, activeClip?.id]);

  // Time update → store
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isPlaying) {
      setCurrentTime(e.currentTarget.currentTime);
    }
  }, [isPlaying, setCurrentTime]);

  // ── Drag text overlay positioning ──────────────────────────────────────
  const handleTextMouseDown = useCallback((e: React.MouseEvent, overlayId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveTextId(overlayId);
    setDraggingTextId(overlayId);
    const overlay = project?.textOverlays.find(t => t.id === overlayId);
    if (!overlay || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pxX = (overlay.x / 100) * rect.width;
    const pxY = (overlay.y / 100) * rect.height;
    setDragOffset({ x: e.clientX - rect.left - pxX, y: e.clientY - rect.top - pxY });
  }, [project?.textOverlays, setActiveTextId]);

  useEffect(() => {
    if (!draggingTextId) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100));
      updateTextOverlay(draggingTextId, { x, y });
    };
    const handleUp = () => setDraggingTextId(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingTextId, dragOffset, updateTextOverlay]);

  // ── Drag sticker overlay positioning ──────────────────────────────────
  const handleStickerMouseDown = useCallback((e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveStickerOverlayId(stickerId);
    if (!containerRef.current) return;
    const sticker = project?.stickerOverlays?.find(s => s.id === stickerId);
    if (!sticker) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ox = e.clientX - rect.left - (sticker.x / 100) * rect.width;
    const oy = e.clientY - rect.top - (sticker.y / 100) * rect.height;
    setDraggingStickerData({ id: stickerId, ox, oy });
  }, [project?.stickerOverlays, setActiveStickerOverlayId]);

  useEffect(() => {
    if (!draggingStickerData) return;
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - draggingStickerData.ox) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - draggingStickerData.oy) / rect.height) * 100));
      updateStickerOverlay(draggingStickerData.id, { x, y });
    };
    const handleUp = () => setDraggingStickerData(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingStickerData, updateStickerOverlay]);

  // Active overlays and subtitles at current time
  const activeOverlays = project?.textOverlays.filter(
    o => currentTime >= o.startTime && currentTime <= o.endTime
  ) ?? [];

  const activeStickers = (project?.stickerOverlays ?? []).filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime
  );

  const activeSubtitles = project?.subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime
  ) ?? [];

  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (project?.aspectRatio) {
      case '9:16': return { aspectRatio: '9 / 16' };
      case '1:1': return { aspectRatio: '1 / 1' };
      default: return { aspectRatio: '16 / 9' };
    }
  };

  // Build CSS filter string from clip filters
  const buildFilterString = (): string => {
    if (!activeClip) return '';
    const f = activeClip.filters;
    const parts: string[] = [];
    if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
    if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
    if (f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
    if (f.blur !== 0) parts.push(`blur(${f.blur}px)`);
    if (f.grayscale !== 0) parts.push(`grayscale(${f.grayscale}%)`);
    if (f.sepia !== 0) parts.push(`sepia(${f.sepia}%)`);
    if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
    return parts.join(' ');
  };

  // Build effects CSS from the clip's effect field
  const buildEffectAnimation = (): React.CSSProperties => {
    if (!activeClip?.effect) return {};
    const clip = activeClip;
    const effect = clip.effect;
    const t = currentTime;

    const getAnimatedValue = (startVal: number, endVal: number, startTime: number, endTime: number) => {
      const progress = Math.max(0, Math.min(1, (t - startTime) / (endTime - startTime)));
      return startVal + (endVal - startVal) * progress;
    };

    const effStart = 0;
    const effEnd = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;

    switch (effect) {
      case 'shake':
        return { animation: 'shake 0.15s infinite' };
      case 'zoom-in':
        return { transform: `scale(${getAnimatedValue(0.5, 1, effStart, effEnd * 0.3)})` };
      case 'zoom-out':
        return { transform: `scale(${getAnimatedValue(1.3, 1, effStart, effEnd * 0.3)})` };
      case 'fade-in':
        return { opacity: getAnimatedValue(0, 1, effStart, effEnd * 0.15) };
      case 'fade-out':
        return { opacity: getAnimatedValue(1, 0, effEnd * 0.7, effEnd) };
      case 'blur-in':
        return { filter: `blur(${getAnimatedValue(10, 0, effStart, effEnd * 0.3)}px)` };
      case 'blur-out':
        return { filter: `blur(${getAnimatedValue(0, 10, effEnd * 0.7, effEnd)}px)` };
      case 'vhs':
        return { filter: 'sepia(30%) contrast(120%) brightness(90%) saturate(130%)' };
      case 'glitch':
        return { animation: 'glitch 0.3s infinite' };
      default:
        return {};
    }
  };

  const getSubtitleStyleClasses = (style: string): string => {
    switch (style) {
      case 'karaoke': return 'font-bold text-lg bg-black/70 px-3 py-2 rounded';
      case 'pop-up': return 'text-xl font-bold bg-white text-black px-4 py-3 rounded-lg shadow-lg';
      case 'tiktok': return 'text-xl font-black drop-shadow-lg max-w-xs';
      case 'minimal': return 'text-sm font-medium opacity-90';
      case 'bold-highlight': return 'text-lg font-black bg-sky-400 text-black px-3 py-2';
      default: return 'text-lg font-semibold';
    }
  };

  // No clip placeholder
  if (!activeClip || !project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0e] min-h-0 p-6">
        <div
          className="flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg border border-zinc-800"
          style={{ ...getAspectRatioStyle(), maxWidth: '100%', maxHeight: '100%', width: 'auto', height: '100%' }}
        >
          <div className="flex flex-col items-center gap-3 text-center p-8">
            <div className="p-3 rounded-full bg-zinc-800">
              <Play className="w-8 h-8 text-sky-400" fill="currentColor" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium">No video selected</p>
              <p className="text-zinc-500 text-sm">Add or select a clip to begin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0e] min-h-0 p-4">
      <div
        ref={containerRef}
        className="relative bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800"
        style={{ ...getAspectRatioStyle(), maxWidth: '100%', maxHeight: '100%', width: 'auto', height: '100%' }}
        onClick={() => setActiveClipId(activeClip.id)}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          key={activeClip.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={activeClip.url}
          preload="metadata"
          playsInline
          muted={activeClip.muted}
          style={{
            filter: buildFilterString(),
            ...buildEffectAnimation(),
          }}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Safe zones overlay */}
        {showSafeZones && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {SAFE_ZONE_GUIDES.map(guide => (
              <div key={guide.label} className="absolute" style={{
                top: guide.top, bottom: guide.bottom, left: guide.left, right: guide.right,
                border: `1px dashed ${guide.color}`,
              }}>
                <span className="absolute -top-4 left-0 text-[8px] font-bold px-1 py-0.5 rounded"
                  style={{ color: guide.color, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                  {guide.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sticker overlays — draggable */}
        {activeStickers.map(sticker => (
          <div
            key={sticker.id}
            className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none z-20 ${
              activeStickerOverlayId === sticker.id ? 'ring-2 ring-sky-400/60 rounded' : ''
            }`}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              fontSize: sticker.type === 'emoji' ? '2rem' : sticker.type === 'shape' || sticker.type === 'arrow' ? '1.75rem' : '2rem',
              lineHeight: 1,
              color: sticker.type !== 'emoji' ? sticker.color : undefined,
            }}
            onMouseDown={e => handleStickerMouseDown(e, sticker.id)}
            onClick={e => { e.stopPropagation(); setActiveStickerOverlayId(sticker.id); }}
          >
            {sticker.content}
          </div>
        ))}

        {/* Text overlays — draggable */}
        {activeOverlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing z-10"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: overlay.opacity,
            }}
            onMouseDown={(e) => handleTextMouseDown(e, overlay.id)}
            onClick={(e) => { e.stopPropagation(); setActiveTextId(overlay.id); }}
          >
            <div
              className="text-overlay"
              style={{
                fontFamily: overlay.fontFamily,
                fontSize: `${overlay.fontSize}px`,
                fontWeight: overlay.fontWeight,
                color: overlay.color,
                backgroundColor: overlay.backgroundColor !== 'transparent' ? overlay.backgroundColor : undefined,
                padding: overlay.backgroundColor !== 'transparent' ? '8px 12px' : '0px',
                borderRadius: overlay.backgroundColor !== 'transparent' ? '4px' : '0px',
                backdropFilter: overlay.backgroundOpacity > 0 ? 'blur(2px)' : undefined,
                whiteSpace: 'nowrap',
              }}
            >
              {overlay.text}
            </div>
          </div>
        ))}

        {/* Subtitles */}
        {activeSubtitles.length > 0 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-4 flex flex-col items-center gap-2 pointer-events-none z-10">
            {activeSubtitles.map(subtitle => (
              <div
                key={subtitle.id}
                className={`text-white text-center ${getSubtitleStyleClasses(subtitle.style)}`}
              >
                {subtitle.text}
              </div>
            ))}
          </div>
        )}

        {/* Keyframe animation styles */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-3px, 2px); }
            50% { transform: translate(3px, -2px); }
            75% { transform: translate(-2px, -1px); }
          }
          @keyframes glitch {
            0%, 100% { transform: translate(0); filter: none; }
            20% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
            40% { transform: translate(2px, -1px); filter: saturate(2); }
            60% { transform: translate(-1px, -2px); filter: hue-rotate(180deg); }
            80% { transform: translate(1px, 2px); filter: saturate(0.5); }
          }
        `}</style>
      </div>
    </div>
  );
}
