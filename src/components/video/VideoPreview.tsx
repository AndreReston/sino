import React, { useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { Play } from 'lucide-react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoPreview({ videoRef }: Props) {
  const {
    project,
    activeClipId,
    currentTime,
    isPlaying,
    playbackSpeed,
    setCurrentTime,
    setActiveClipId,
    setActiveTextId,
  } = useVideoStore();

  // Get active clip
  const activeClip = project?.clips.find(c => c.id === activeClipId) ?? null;

  // ─── Sync video playback with store ────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sync play/pause
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy restrictions
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, activeClip?.id]);

  // Sync currentTime (seeking)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only sync if we're not currently playing to avoid conflicts
    if (!isPlaying) {
      const targetTime = activeClip
        ? currentTime
        : 0;
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
      }
    }
  }, [currentTime, isPlaying, activeClip]);

  // Sync playback speed and audio settings
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;
    video.playbackRate = activeClip.speed * playbackSpeed;
    video.muted = activeClip.muted;
    video.volume = activeClip.volume;
  }, [playbackSpeed, activeClip?.speed, activeClip?.volume, activeClip?.muted, activeClip?.id]);

  // Reset video element when clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;
    video.src = activeClip.url;
    video.load();
    if (currentTime > 0) {
      video.currentTime = currentTime;
    }
  }, [activeClip?.id, currentTime]);

  // Update store currentTime while playing
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (isPlaying) {
      setCurrentTime(video.currentTime);
    }
  };

  // Handle video click
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't set active clip if clicking on an overlay
    if (!target.classList.contains('text-overlay')) {
      if (activeClip) {
        setActiveClipId(activeClip.id);
      }
    }
  };

  // Get active text overlays and subtitles at current time
  const activeOverlays = project?.textOverlays.filter(
    o => currentTime >= o.startTime && currentTime <= o.endTime
  ) ?? [];

  const activeSubtitles = project?.subtitles.filter(
    s => currentTime >= s.startTime && currentTime <= s.endTime
  ) ?? [];

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (project?.aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return '';
      case '1:1':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  const getAspectRatioStyle = (): React.CSSProperties | undefined => {
    if (project?.aspectRatio === '9:16') {
      return { aspectRatio: '9 / 16' };
    }
    return undefined;
  };

  // Build CSS filter string
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

  // Get subtitle style classes based on caption style
  const getSubtitleStyleClasses = (style: string): string => {
    switch (style) {
      case 'karaoke':
        return 'font-bold text-lg bg-black bg-opacity-70 px-3 py-2 rounded';
      case 'pop-up':
        return 'text-xl font-bold bg-white text-black px-4 py-3 rounded-lg shadow-lg';
      case 'tiktok':
        return 'text-xl font-black drop-shadow-lg max-w-xs';
      case 'minimal':
        return 'text-sm font-medium opacity-90';
      case 'bold-highlight':
        return 'text-lg font-black bg-sky-400 text-black px-3 py-2';
      default:
        return 'text-lg font-semibold';
    }
  };

  // Render placeholder
  if (!activeClip || !project) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg border border-zinc-800 ${getAspectRatioClass()}`}
        style={getAspectRatioStyle()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-full bg-zinc-800">
            <Play className="w-8 h-8 text-sky-400" fill="currentColor" />
          </div>
          <div>
            <p className="text-zinc-300 font-medium">No video selected</p>
            <p className="text-zinc-500 text-sm">Add or select a clip to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full flex items-center justify-center bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 ${getAspectRatioClass()}`}
      style={getAspectRatioStyle()}
      onClick={handleVideoClick}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        preload="metadata"
        playsInline
        muted={activeClip?.muted ?? false}
        style={{
          filter: buildFilterString(),
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          // Optionally handle end of video
        }}
      />

      {/* Text overlays */}
      {activeOverlays.map(overlay => (
        <div
          key={overlay.id}
          className="text-overlay absolute pointer-events-auto cursor-pointer transition-opacity hover:opacity-80"
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: overlay.opacity,
          }}
          onClick={e => {
            e.stopPropagation();
            setActiveTextId(overlay.id);
          }}
        >
          <div
            style={{
              fontFamily: overlay.fontFamily,
              fontSize: `${overlay.fontSize}px`,
              fontWeight: overlay.fontWeight,
              color: overlay.color,
              backgroundColor: overlay.backgroundColor,
              backgroundOpacity: overlay.backgroundOpacity,
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
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-4 flex flex-col items-center gap-2">
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
    </div>
  );
};
