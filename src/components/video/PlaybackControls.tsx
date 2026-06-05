import React, { useRef, useState, useEffect } from 'react';
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

export default function PlaybackControls() {
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    setIsPlaying,
    setCurrentTime,
    setPlaybackSpeed,
    getTotalDuration,
  } = useVideoStore();

  const [volume, setVolume] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const totalDuration = getTotalDuration();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
    <div className="bg-[#111115] border-t border-white/[0.06] h-10 px-3 flex items-center gap-2 select-none">
      {/* Skip Back Button */}
      <button
        onClick={handleSkipBack}
        className="p-1 hover:bg-white/[0.1] rounded transition-colors flex-shrink-0"
        title="Skip back 5 seconds"
      >
        <SkipBack size={16} className="text-white/70 hover:text-white" />
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
        className="p-1 hover:bg-white/[0.1] rounded transition-colors flex-shrink-0"
        title="Skip forward 5 seconds"
      >
        <SkipForward size={16} className="text-white/70 hover:text-white" />
      </button>

      {/* Stop Button */}
      <button
        onClick={handleStop}
        className="p-1 hover:bg-white/[0.1] rounded transition-colors flex-shrink-0"
        title="Stop and reset"
      >
        <Square size={16} className="text-white/70 hover:text-white" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-white/[0.1]" />

      {/* Seek Bar */}
      <div
        ref={seekBarRef}
        className="flex-1 group relative h-1 bg-zinc-700 rounded-full cursor-pointer"
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
      <div className="w-px h-5 bg-white/[0.1]" />

      {/* Speed Control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className="text-xs px-1.5 py-0.5 rounded border border-transparent hover:bg-white/[0.1] transition-colors"
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
                  : 'text-white/50 hover:text-white/70'
              }`}
              title={`${speed}x speed`}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          className="text-xs px-1.5 py-0.5 rounded border border-transparent hover:bg-white/[0.1] transition-colors"
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
        {volume === 0 ? (
          <VolumeX size={14} className="text-white/50" />
        ) : (
          <Volume2 size={14} className="text-white/50" />
        )}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-12 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-sky-500"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>

      {/* Time Display */}
      <div className="text-xs font-mono text-white/70 flex-shrink-0 whitespace-nowrap tabular-nums ml-1">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>
    </div>
  );
};
