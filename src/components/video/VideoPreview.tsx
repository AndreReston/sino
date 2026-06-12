import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useVideoStore, DEFAULT_FILTERS } from '../../store/videoStore';
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
  // U4: Track video load errors
  const [videoError, setVideoError] = useState<string | null>(null);
  const project = useVideoStore(s => s.project);
  const activeClipId = useVideoStore(s => s.activeClipId);
  const currentTime = useVideoStore(s => s.currentTime);
  const isPlaying = useVideoStore(s => s.isPlaying);
  const playbackSpeed = useVideoStore(s => s.playbackSpeed);
  const setActiveClipId = useVideoStore(s => s.setActiveClipId);
  const setActiveTextId = useVideoStore(s => s.setActiveTextId);
  const updateTextOverlay = useVideoStore(s => s.updateTextOverlay);
  const updateClip = useVideoStore(s => s.updateClip);
  const showSafeZones = useVideoStore(s => s.showSafeZones);
  const updateStickerOverlay = useVideoStore(s => s.updateStickerOverlay);
  const setActiveStickerOverlayId = useVideoStore(s => s.setActiveStickerOverlayId);
  const activeStickerOverlayId = useVideoStore(s => s.activeStickerOverlayId);
  const getClipAtTime = useVideoStore(s => s.getClipAtTime);

  const activeClip = project?.clips.find(c => c.id === activeClipId) ?? null;

  // Always show the clip at the playhead; activeClipId only controls transform editing
  const clipInfoAtPlayhead = project ? getClipAtTime(currentTime) : null;
  const displayClip = clipInfoAtPlayhead?.clip ?? activeClip;
  const isClipSelected = !!(activeClipId && displayClip?.id === activeClipId);

  // Compute the clip-local time for the displayed clip
  const resolvedClipInfo = clipInfoAtPlayhead?.clip.id === displayClip?.id ? clipInfoAtPlayhead : null;
  const clipLocalTime = resolvedClipInfo ? resolvedClipInfo.clipLocalTime : 0;
  const videoSeekTime = displayClip ? displayClip.trimStart + clipLocalTime * displayClip.speed : 0;

  // Drag state for text overlays
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Drag state for sticker overlays
  const [draggingStickerData, setDraggingStickerData] = useState<{ id: string; ox: number; oy: number } | null>(null);
  // Resize state for stickers
  const [resizingStickerData, setResizingStickerData] = useState<{ id: string; startX: number; startY: number; startScale: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{ corner: string; startX: number; startY: number } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number } | null>(null);

  // Sync video src when displayed clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !displayClip) return;
    if (video.src !== displayClip.url) {
      setVideoError(null); // Clear previous errors
      video.src = displayClip.url;
      // U4: Add error handler for video load failures
      const handleError = () => {
        const error = video.error;
        if (error?.code === error?.MEDIA_ERR_ABORTED) {
          setVideoError('Video loading aborted');
        } else if (error?.code === error?.MEDIA_ERR_NETWORK) {
          setVideoError('Network error - check your connection');
        } else if (error?.code === error?.MEDIA_ERR_DECODE) {
          setVideoError('Video format not supported');
        } else if (error?.code === error?.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          setVideoError('Video source not accessible (CORS/404)');
        } else {
          setVideoError('Failed to load video');
        }
      };
      video.addEventListener('error', handleError, { once: true });
      video.load();
      const st = useVideoStore.getState();
      const info = st.getClipAtTime(st.currentTime);
      if (info?.clip.id === displayClip.id) {
        const seekTo = displayClip.trimStart + info.clipLocalTime * displayClip.speed;
        video.addEventListener('loadedmetadata', () => { video.currentTime = seekTo; }, { once: true });
      }
    }
  }, [displayClip?.id]);

  // Sync playback state — when clip switches during playback, start playing new clip immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !displayClip) return;
    if (isPlaying) {
      const st = useVideoStore.getState();
      const info = st.getClipAtTime(st.currentTime);
      if (info?.clip.id === displayClip.id) {
        const seekTo = displayClip.trimStart + info.clipLocalTime * displayClip.speed;
        if (Math.abs(video.currentTime - seekTo) > 0.15) {
          video.currentTime = seekTo;
        }
      }
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, displayClip?.id]);

  // Sync seek — both during playback (when user manually scrubs) and when paused
  const lastExpectedTimeRef = useRef(videoSeekTime);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !displayClip) return;

    const drift = Math.abs(videoSeekTime - lastExpectedTimeRef.current);
    const isManualSeek = drift > 0.3;

    if (isPlaying && !isManualSeek) {
      lastExpectedTimeRef.current = videoSeekTime;
      return;
    }

    if (Math.abs(video.currentTime - videoSeekTime) > 0.1) {
      video.currentTime = videoSeekTime;
    }
    lastExpectedTimeRef.current = videoSeekTime;
  }, [currentTime, isPlaying, displayClip?.id]);

  // Sync speed and volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !displayClip) return;
    video.playbackRate = displayClip.speed * playbackSpeed;
    video.muted = displayClip.muted;
    video.volume = displayClip.volume;
  }, [playbackSpeed, displayClip?.speed, displayClip?.volume, displayClip?.muted, displayClip?.id]);

  // Time update — video drives nothing during playback (RAF loop in VideoWorkspace drives currentTime)
  // But we still need to handle manual seeks on the video element itself
  const handleTimeUpdate = useCallback((_e: React.SyntheticEvent<HTMLVideoElement>) => {
    // RAF loop handles time — no-op here to avoid feedback loop
  }, []);

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

  // ── Sticker resize ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!resizingStickerData) return;
    const handleMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizingStickerData.startX) / 300;
      const deltaY = (e.clientY - resizingStickerData.startY) / 300;
      const delta = (deltaX + deltaY) / 2;
      const newScale = Math.max(0.1, Math.min(5, resizingStickerData.startScale + delta));
      updateStickerOverlay(resizingStickerData.id, { scale: newScale });
    };
    const handleUp = () => setResizingStickerData(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizingStickerData, updateStickerOverlay]);

  // ── Clip resize for both overlay and full-frame modes ──────────────────
  useEffect(() => {
    if (!resizing || !displayClip || !isClipSelected) return;
    const currentDisplayClip = displayClip;
    const handleMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizing.startX) / 300;
      const deltaY = (e.clientY - resizing.startY) / 300;
      const { corner } = resizing;

      // For full-frame mode, scale proportionally from corners
      if (currentDisplayClip.overlayMode === 'full') {
        const delta = (deltaX + deltaY) / 2;
        if (['se', 'e', 's'].includes(corner)) {
          const newScale = Math.max(0.2, Math.min(3, currentDisplayClip.scaleX + delta));
          updateClip(currentDisplayClip.id, { scaleX: newScale, scaleY: newScale });
        } else if (['nw', 'w', 'n'].includes(corner)) {
          const newScale = Math.max(0.2, Math.min(3, currentDisplayClip.scaleX - delta));
          updateClip(currentDisplayClip.id, { scaleX: newScale, scaleY: newScale });
        } else if (corner === 'ne') {
          const newScale = Math.max(0.2, Math.min(3, currentDisplayClip.scaleX - deltaY + deltaX));
          updateClip(currentDisplayClip.id, { scaleX: newScale, scaleY: newScale });
        } else if (corner === 'sw') {
          const newScale = Math.max(0.2, Math.min(3, currentDisplayClip.scaleX + deltaY - deltaX));
          updateClip(currentDisplayClip.id, { scaleX: newScale, scaleY: newScale });
        }
        return;
      }

      if (corner.includes('e')) {
        updateClip(currentDisplayClip.id, { scaleX: Math.max(0.1, Math.min(2, currentDisplayClip.scaleX + deltaX)) });
      } else if (corner.includes('w')) {
        updateClip(currentDisplayClip.id, { scaleX: Math.max(0.1, Math.min(2, currentDisplayClip.scaleX - deltaX)) });
      }
      if (corner.includes('s')) {
        updateClip(currentDisplayClip.id, { scaleY: Math.max(0.1, Math.min(2, currentDisplayClip.scaleY + deltaY)) });
      } else if (corner.includes('n')) {
        updateClip(currentDisplayClip.id, { scaleY: Math.max(0.1, Math.min(2, currentDisplayClip.scaleY - deltaY)) });
      }
    };
    const handleUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizing, displayClip, isClipSelected, updateClip]);

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
    if (!displayClip) return '';
    const f = displayClip.filters;
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
    if (!displayClip?.effect) return {};
    const clip = displayClip;
    const effect = clip.effect;
    const t = currentTime;

    const getAnimatedValue = (startVal: number, endVal: number, startTime: number, endTime: number) => {
      const progress = Math.max(0, Math.min(1, (clipLocalTime - startTime) / Math.max(0.001, endTime - startTime)));
      const ease = 1 - Math.pow(1 - progress, 2);
      return startVal + (endVal - startVal) * ease;
    };

    const effStart = 0;
    const clipEffectiveDur = (clip.duration - clip.trimStart - clip.trimEnd) / clip.speed;
    const effEnd = (clip.effectDuration && clip.effectDuration > 0)
      ? Math.min(clip.effectDuration, clipEffectiveDur)
      : clipEffectiveDur;

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

  const getTransitionOutStyle = (): React.CSSProperties => {
    if (!displayClip || !displayClip.transitionOut || displayClip.transitionOut === 'none') return {};
    const dur = displayClip.transitionDuration ?? 0.5;
    const clipEffectiveDur = (displayClip.duration - displayClip.trimStart - displayClip.trimEnd) / Math.max(0.25, displayClip.speed);
    if (clipLocalTime < clipEffectiveDur - dur) return {};
    const progress = Math.max(0, Math.min(1, (clipEffectiveDur - clipLocalTime) / dur));
    const ease = 1 - Math.pow(1 - progress, 2);
    const opacity = displayClip.opacity ?? 1;

    switch (displayClip.transitionOut) {
      case 'fade':
      case 'crossfade':
        return { opacity: opacity * ease };
      case 'slide-left':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      case 'slide-right':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
      case 'slide-up':
        return { clipPath: `inset(${Math.round((1 - ease) * 100)}% 0 0 0)` };
      case 'slide-down':
        return { clipPath: `inset(0 0 ${Math.round((1 - ease) * 100)}% 0)` };
      case 'wipe-left':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      case 'wipe-right':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
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

  // Compute transition overlay opacity/clipPath at clip start
  const buildTransitionStyle = (): React.CSSProperties => {
    if (!displayClip || displayClip.transitionIn === 'none') return {};
    const dur = displayClip.transitionDuration ?? 0.5;
    if (clipLocalTime >= dur) return {};
    const progress = clipLocalTime / dur;
    const ease = 1 - Math.pow(1 - progress, 2); // ease-out quadratic

    switch (displayClip.transitionIn) {
      case 'fade':
      case 'crossfade':
        return { opacity: (displayClip.opacity ?? 1) * ease };
      case 'slide-left':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      case 'slide-right':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
      case 'slide-up':
        return { clipPath: `inset(${Math.round((1 - ease) * 100)}% 0 0 0)` };
      case 'slide-down':
        return { clipPath: `inset(0 0 ${Math.round((1 - ease) * 100)}% 0)` };
      case 'wipe-left':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      case 'wipe-right':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
      default:
        return {};
    }
  };

  // Compute transition-out opacity/clipPath at clip end
  const buildTransitionOutStyle = (): React.CSSProperties => {
    if (!displayClip || displayClip.transitionOut === 'none') return {};
    const dur = displayClip.transitionDuration ?? 0.5;
    const visibleDuration = (displayClip.duration - displayClip.trimStart - displayClip.trimEnd) / displayClip.speed;
    const timeUntilEnd = visibleDuration - clipLocalTime;
    if (timeUntilEnd >= dur) return {};
    const progress = Math.max(0, timeUntilEnd / dur); // 1 → 0
    const ease = Math.pow(progress, 2); // ease-in quadratic

    switch (displayClip.transitionOut) {
      case 'fade':
      case 'crossfade':
        return { opacity: (displayClip.opacity ?? 1) * ease };
      case 'slide-left':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
      case 'slide-right':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      case 'slide-up':
        return { clipPath: `inset(0 0 ${Math.round((1 - ease) * 100)}% 0)` };
      case 'slide-down':
        return { clipPath: `inset(${Math.round((1 - ease) * 100)}% 0 0 0)` };
      case 'wipe-left':
        return { clipPath: `inset(0 0 0 ${Math.round((1 - ease) * 100)}%)` };
      case 'wipe-right':
        return { clipPath: `inset(0 ${Math.round((1 - ease) * 100)}% 0 0)` };
      default:
        return {};
    }
  };

  // Build photo overlay CSS filter string
  const buildPhotoFilterString = (sticker: { photoFilters?: typeof DEFAULT_FILTERS }): string => {
    const f = sticker.photoFilters;
    if (!f) return '';
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

  // No clip placeholder — only when there are no video clips at all
  if (!displayClip || !project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface min-h-0 p-6">
        <div
          className="flex items-center justify-center bg-gradient-to-br from-panel-light to-panel-dark rounded-lg border border-panel-border"
          style={{ ...getAspectRatioStyle(), maxWidth: '100%', maxHeight: '100%', width: 'auto', height: '100%' }}
        >
          <div className="flex flex-col items-center gap-3 text-center p-8">
            <div className="p-3 rounded-full bg-panel-light">
              <Play className="w-8 h-8 text-sky-400" fill="currentColor" />
            </div>
            <div>
              <p className="text-theme-primary font-medium">No video selected</p>
              <p className="text-theme-muted text-sm">Add or select a clip to begin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-surface min-h-0 p-4">
      <div
        ref={containerRef}
        className="relative bg-panel-dark rounded-lg overflow-hidden border border-panel-border"
        style={{ ...getAspectRatioStyle(), maxWidth: '100%', maxHeight: '100%', width: 'auto', height: '100%' }}
        onClick={() => { if (displayClip) setActiveClipId(displayClip.id); }}
      >
        {/* U4: Show error message if video fails to load */}
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-center p-4">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-sm text-red-300">
              <p className="font-semibold mb-1">Unable to load video</p>
              <p className="text-xs text-red-200">{videoError}</p>
            </div>
          </div>
        ) : null}
        
        {/* Video element */}
        {(() => {
          const transStyle = buildTransitionStyle();
          const transOutStyle = buildTransitionOutStyle();
          const baseOpacity = displayClip.opacity ?? 1;
          const effectAnim = buildEffectAnimation();

          // Combine effect scale/translate with positioning transform
          const effectTransform = effectAnim.transform as string | undefined;
          const posTransformFull = `translate(${displayClip.offsetX}%, ${displayClip.offsetY}%) scale(${displayClip.scaleX})`;
          const fullTransform = effectTransform ? `${effectTransform} ${posTransformFull}` : posTransformFull;

          // Combine filters: user filters + effect filters
          const userFilter = buildFilterString();
          const effectFilter = effectAnim.filter as string | undefined;
          const combinedFilter = [userFilter, effectFilter].filter(Boolean).join(' ') || undefined;

          // Opacity: base × effect × transition (transition wins on fade)
          const effectOpacity = effectAnim.opacity as number | undefined;
          let finalOpacity = effectOpacity !== undefined ? effectOpacity * baseOpacity : baseOpacity;
          if (transStyle.opacity !== undefined) finalOpacity = transStyle.opacity;

          return (
            <video
              ref={videoRef}
              className={displayClip.overlayMode === 'overlay' ? 'absolute object-cover' : 'absolute inset-0 w-full h-full object-cover'}
              src={displayClip.url}
              preload="metadata"
              playsInline
              muted={displayClip.muted}
              style={{
                ...(displayClip.overlayMode === 'overlay' ? {
                  left: `${displayClip.clipX}%`,
                  top: `${displayClip.clipY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${displayClip.scaleX * 50}%`,
                  height: `${displayClip.scaleY * 50}%`,
                } : {
                  transform: fullTransform,
                }),
                filter: combinedFilter,
                opacity: transOutStyle.opacity !== undefined ? transOutStyle.opacity : finalOpacity,
                clipPath: transStyle.clipPath || transOutStyle.clipPath,
                transition: transOutStyle.clipPath ? 'clip-path 0.05s linear' : undefined,
                ...(effectAnim.animation ? { animation: effectAnim.animation as string } : {}),
              }}
              onTimeUpdate={handleTimeUpdate}
            />
          );
        })()}

        {/* Pan/drag area for full frame mode — only when clip is selected for editing */}
        {isClipSelected && displayClip.overlayMode === 'full' && (
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              if (e.button !== 2 && !panning) {
                setPanning({ startX: e.clientX, startY: e.clientY });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              updateClip(displayClip.id, { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
            }}
            title="Drag to pan, right-click to reset"
          >
            {panning && (
              <div
                onMouseMove={(e) => {
                  const deltaX = (e.clientX - panning.startX) / 10;
                  const deltaY = (e.clientY - panning.startY) / 10;
                  updateClip(displayClip.id, {
                    offsetX: Math.max(-50, Math.min(50, displayClip.offsetX + deltaX)),
                    offsetY: Math.max(-50, Math.min(50, displayClip.offsetY + deltaY)),
                  });
                  setPanning({ startX: e.clientX, startY: e.clientY });
                }}
                onMouseUp={() => setPanning(null)}
                onMouseLeave={() => setPanning(null)}
                className="absolute inset-0"
              />
            )}
          </div>
        )}

        {/* Scale indicator for full frame mode */}
        {isClipSelected && displayClip.overlayMode === 'full' && displayClip.scaleX !== 1 && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-sky-300 px-2 py-1 rounded pointer-events-none z-20 font-mono">
              {Math.round(displayClip.scaleX * 100)}%
            </div>
        )}

        {/* Resize handles for overlay mode */}
        {isClipSelected && displayClip.overlayMode === 'overlay' && (
          <>
            <div
              className="absolute border-2 border-dashed border-sky-400/50 pointer-events-none"
              style={{
                left: `${displayClip.clipX - displayClip.scaleX * 25}%`,
                top: `${displayClip.clipY - displayClip.scaleY * 25}%`,
                width: `${displayClip.scaleX * 50}%`,
                height: `${displayClip.scaleY * 50}%`,
              }}
            />
            {['nw', 'ne', 'sw', 'se'].map(corner => (
              <div
                key={corner}
                className="absolute w-2 h-2 bg-sky-400 rounded-full cursor-nwse-resize z-20"
                style={{
                  left: corner.includes('e') ? `${displayClip.clipX + displayClip.scaleX * 25}%` : `${displayClip.clipX - displayClip.scaleX * 25}%`,
                  top: corner.includes('s') ? `${displayClip.clipY + displayClip.scaleY * 25}%` : `${displayClip.clipY - displayClip.scaleY * 25}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizing({ corner, startX: e.clientX, startY: e.clientY });
                }}
              />
            ))}
          </>
        )}

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

        {/* Sticker overlays — draggable and resizable */}
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
              lineHeight: 1,
              color: sticker.type !== 'emoji' && sticker.type !== 'photo' ? sticker.color : undefined,
            }}
            onMouseDown={e => handleStickerMouseDown(e, sticker.id)}
            onClick={e => { e.stopPropagation(); setActiveStickerOverlayId(sticker.id); }}
          >
            {sticker.type === 'photo' ? (
              <img
                src={sticker.content}
                alt="Photo overlay"
                className="w-32 h-auto rounded shadow-lg object-cover pointer-events-none"
                draggable={false}
                style={{ filter: buildPhotoFilterString(sticker) || undefined }}
              />
            ) : (
              <span style={{ fontSize: sticker.type === 'emoji' ? '2rem' : sticker.type === 'shape' || sticker.type === 'arrow' ? '1.75rem' : '2rem' }}>
                {sticker.content}
              </span>
            )}
            
            {/* Resize handle for sticker */}
            {activeStickerOverlayId === sticker.id && sticker.type === 'photo' && (
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-sky-400 rounded-full cursor-nwse-resize z-30"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizingStickerData({ id: sticker.id, startX: e.clientX, startY: e.clientY, startScale: sticker.scale });
                }}
              />
            )}
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

        {/* Subtitles — grouped by position */}
        {(['top', 'middle', 'bottom'] as const).map(pos => {
          const posSubtitles = activeSubtitles.filter(s => (s.position ?? 'bottom') === pos);
          if (posSubtitles.length === 0) return null;
          const posClass = pos === 'top'
            ? 'top-6'
            : pos === 'middle'
              ? 'top-1/2 -translate-y-1/2'
              : 'bottom-6';
          return (
            <div key={pos} className={`absolute ${posClass} left-1/2 -translate-x-1/2 w-full px-4 flex flex-col items-center gap-2 pointer-events-none z-10`}>
              {posSubtitles.map(subtitle => (
                <div
                  key={subtitle.id}
                  className={`text-white text-center ${getSubtitleStyleClasses(subtitle.style)}`}
                >
                  {subtitle.text}
                </div>
              ))}
            </div>
          );
        })}

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
