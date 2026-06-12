import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

const SKIP_DURATION = 5;
const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function PlaybackControls({ videoRef }: Props) {
  const store = useVideoStore();
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    setIsPlaying,
    setCurrentTime,
    setPlaybackSpeed,
    getTotalDuration,
    updateClip,
    project,
    activeClipId,
  } = store;

  const activeClip = project?.clips.find(c => c.id === activeClipId) ?? null;
  const [isSeeking, setIsSeeking] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const totalDuration = getTotalDuration();

  const handlePlayPause = () => {
    if (!isPlaying) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Ignore playback policy issues; state will remain synced.
        });
      }
      setIsPlaying(true);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - SKIP_DURATION));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(totalDuration, currentTime + SKIP_DURATION));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return;

    const rect = seekBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * totalDuration;

    setCurrentTime(newTime);
  };

  const handleSeekMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    handleSeek(e);
  };

  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsSeeking(false);
    };

    if (isSeeking) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isSeeking]);

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-panel-light border-t border-panel-divider h-10 px-3 flex items-center gap-2 select-none">
      {/* Skip Back Button */}
      <button
        onClick={handleSkipBack}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        title="Skip back 5 seconds"
      >
        <SkipBack size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className="rounded-full bg-sky-500 text-white w-8 h-8 flex items-center justify-center hover:bg-sky-400 transition-colors flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>

      {/* Skip Forward Button */}
      <button
        onClick={handleSkipForward}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        title="Skip forward 5 seconds"
      >
        <SkipForward size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      {/* Stop Button */}
      <button
        onClick={handleStop}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        title="Stop and reset"
      >
        <Square size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-panel-divider" />

      {/* Seek Bar */}
      <div
        ref={seekBarRef}
        className="flex-1 group relative h-1 bg-panel-divider rounded-full cursor-pointer"
        onMouseDown={handleSeekStart}
        onMouseMove={handleSeekMove}
        onMouseUp={handleSeekEnd}
        onMouseLeave={handleSeekEnd}
        onClick={handleSeek}
        title={`Current: ${formatTime(currentTime)} / Total: ${formatTime(totalDuration)}`}
      >
        {/* Played portion */}
        <div
          className="absolute h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Seek handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-panel-divider" />

      {/* Speed Control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className="text-xs px-1.5 py-0.5 rounded border border-transparent hover:bg-panel-hover transition-colors"
          onClick={() => {
            const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
            const newIndex = Math.max(0, currentIndex - 1);
            setPlaybackSpeed(SPEED_OPTIONS[newIndex]);
          }}
          title="Decrease speed"
        >
          -
        </button>

        <div className="flex items-center">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                playbackSpeed === speed
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'text-theme-dim hover:text-theme-muted'
              }`}
              title={`${speed}x speed`}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          className="text-xs px-1.5 py-0.5 rounded border border-transparent hover:bg-panel-hover transition-colors"
          onClick={() => {
            const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
            const newIndex = Math.min(SPEED_OPTIONS.length - 1, currentIndex + 1);
            setPlaybackSpeed(SPEED_OPTIONS[newIndex]);
          }}
          title="Increase speed"
        >
          +
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {(activeClip?.volume ?? 1) === 0 ? (
          <VolumeX size={14} className="text-theme-muted" />
        ) : (
          <Volume2 size={14} className="text-theme-muted" />
        )}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={activeClip?.volume ?? 1}
          onChange={(e) => {
            if (!activeClip) return;
            updateClip(activeClip.id, { volume: parseFloat(e.target.value) });
          }}
          className={`w-12 h-1 rounded-full appearance-none cursor-pointer accent-sky-500 transition-all ${
            !activeClip ? 'opacity-30 cursor-not-allowed bg-panel-divider' : 'bg-panel-divider'
          }`}
          title={`Volume: ${Math.round((activeClip?.volume ?? 1) * 100)}%${!activeClip ? ' (no clip selected)' : ''}`}
          disabled={!activeClip}
        />
      </div>

      {/* Time Display */}
      <div className="text-xs font-mono text-theme-muted flex-shrink-0 whitespace-nowrap tabular-nums ml-1">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>
    </div>
  );
};
