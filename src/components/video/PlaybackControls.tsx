import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  Repeat,
  ChevronDown,
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
const FRAME_STEP = 1 / 30;

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function PlaybackControls({ videoRef }: Props) {
  const store = useVideoStore();
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    loopPlayback,
    setIsPlaying,
    setCurrentTime,
    setPlaybackSpeed,
    setLoopPlayback,
    getTotalDuration,
    updateClip,
    project,
    activeClipId,
  } = store;

  const activeClip = project?.clips.find(c => c.id === activeClipId) ?? null;
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [speedOpen, setSpeedOpen] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lastClipVolumeRef = useRef(activeClip?.volume ?? 1);

  const totalDuration = getTotalDuration();
  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  useEffect(() => {
    if (activeClip?.volume && activeClip.volume > 0) lastClipVolumeRef.current = activeClip.volume;
  }, [activeClip?.volume]);

  useEffect(() => {
    const handlePointerUp = () => setIsSeeking(false);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

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

  const handleFrameStep = (direction: -1 | 1) => {
    setCurrentTime(Math.max(0, Math.min(totalDuration, currentTime + (FRAME_STEP * direction))));
  };

  const getSeekTime = (clientX: number) => {
    if (!seekBarRef.current) return currentTime;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (x / rect.width) * totalDuration;
  };

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsSeeking(true);
    setCurrentTime(getSeekTime(e.clientX));
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nextTime = getSeekTime(e.clientX);
    setHoverTime(nextTime);
    if (isSeeking) setCurrentTime(nextTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const handleVolumeToggle = () => {
    if (!activeClip) return;
    if (activeClip.volume > 0) {
      lastClipVolumeRef.current = Math.max(activeClip.volume, 0.05);
      updateClip(activeClip.id, { volume: 0 });
    } else {
      updateClip(activeClip.id, { volume: Math.min(1, lastClipVolumeRef.current || 0.8) });
    }
  };

  const handleVolumeChange = (value: number) => {
    if (!activeClip) return;
    if (value > 0) lastClipVolumeRef.current = value;
    updateClip(activeClip.id, { volume: value });
  };

  return (
    <div className="bg-panel-light border-t border-panel-divider h-10 px-3 flex items-center gap-2 select-none" role="toolbar" aria-label="Playback controls">
      <button
        onClick={handleSkipBack}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        aria-label="Skip back 5 seconds"
        title="Skip back 5 seconds"
      >
        <SkipBack size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      <button
        onClick={() => handleFrameStep(-1)}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        aria-label="Step back one frame"
        title="Step back one frame"
      >
        <span className="text-[10px] font-bold text-theme-muted">−1f</span>
      </button>

      <button
        onClick={handlePlayPause}
        className="rounded-full bg-sky-500 text-white w-8 h-8 flex items-center justify-center hover:bg-sky-400 transition-colors flex-shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>

      <button
        onClick={() => handleFrameStep(1)}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        aria-label="Step forward one frame"
        title="Step forward one frame"
      >
        <span className="text-[10px] font-bold text-theme-muted">+1f</span>
      </button>

      <button
        onClick={handleSkipForward}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        aria-label="Skip forward 5 seconds"
        title="Skip forward 5 seconds"
      >
        <SkipForward size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      <button
        onClick={handleStop}
        className="p-1 hover:bg-panel-hover rounded transition-colors flex-shrink-0"
        aria-label="Stop and reset"
        title="Stop and reset"
      >
        <Square size={16} className="text-theme-muted hover:text-theme-primary" />
      </button>

      <button
        onClick={() => setLoopPlayback(!loopPlayback)}
        className={`p-1 rounded transition-colors flex-shrink-0 ${loopPlayback ? 'bg-sky-500/15 text-sky-400' : 'hover:bg-panel-hover text-theme-muted'}`}
        aria-label={loopPlayback ? 'Disable loop playback' : 'Enable loop playback'}
        aria-pressed={loopPlayback}
        title="Loop/repeat preview"
      >
        <Repeat size={16} />
      </button>

      <div className="w-px h-5 bg-panel-divider" />

      <div
        ref={seekBarRef}
        className="flex-1 group relative h-1 bg-panel-divider rounded-full cursor-pointer"
        onPointerDown={handleSeekStart}
        onPointerMove={handleSeekMove}
        onPointerUp={handleSeekEnd}
        onPointerCancel={handleSeekEnd}
        onPointerLeave={() => setHoverTime(null)}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalDuration)}
        aria-valuenow={Math.round(currentTime)}
        aria-label="Seek timeline"
        title={`Current: ${formatTime(currentTime)} / Total: ${formatTime(totalDuration)}`}
      >
        <div
          className="absolute h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        {hoverTime !== null && (
          <div
            className="absolute -top-8 -translate-x-1/2 px-1.5 py-0.5 rounded bg-surface border border-panel-border text-[9px] text-theme-secondary whitespace-nowrap shadow-lg pointer-events-none z-10"
            style={{ left: `${(hoverTime / Math.max(totalDuration, 1)) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="w-px h-5 bg-panel-divider" />

      <div className="relative flex items-center flex-shrink-0">
        <button
          className="text-xs px-1.5 py-0.5 rounded border border-panel-border hover:bg-panel-hover transition-colors flex items-center gap-1"
          onClick={() => setSpeedOpen(v => !v)}
          aria-expanded={speedOpen}
          aria-haspopup="listbox"
          title="Playback speed"
        >
          {playbackSpeed}x <ChevronDown size={12} />
        </button>
        {speedOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setSpeedOpen(false)} />
            <div className="absolute bottom-full right-0 mb-2 w-28 bg-surface border border-panel-border rounded-xl shadow-2xl z-50 p-1">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  role="option"
                  aria-selected={playbackSpeed === speed}
                  onClick={() => { setPlaybackSpeed(speed); setSpeedOpen(false); }}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                    playbackSpeed === speed ? 'bg-sky-500/15 text-sky-300' : 'text-theme-secondary hover:text-theme-primary hover:bg-panel-hover'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleVolumeToggle}
          disabled={!activeClip}
          className={`p-1 rounded transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${activeClip ? 'hover:bg-panel-hover text-theme-muted' : 'text-theme-dim'}`}
          aria-label={!activeClip ? 'No clip selected' : activeClip.volume > 0 ? 'Mute clip' : 'Restore clip volume'}
          title={!activeClip ? 'Select a clip to adjust volume' : activeClip.volume > 0 ? 'Mute clip' : 'Restore last volume'}
        >
          {activeClip?.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={activeClip?.volume ?? 1}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={`w-12 h-1 rounded-full appearance-none cursor-pointer accent-sky-500 transition-all ${
            !activeClip ? 'opacity-30 cursor-not-allowed bg-panel-divider' : 'bg-panel-divider'
          }`}
          aria-label={!activeClip ? 'No clip selected' : `Volume ${Math.round((activeClip.volume ?? 1) * 100)}%`}
          title={!activeClip ? 'Select a clip to adjust volume' : `Volume: ${Math.round((activeClip.volume ?? 1) * 100)}%`}
          disabled={!activeClip}
        />
      </div>

      <div className="text-xs font-mono text-theme-muted flex-shrink-0 whitespace-nowrap tabular-nums ml-1">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>
    </div>
  );
};
