import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function PlaybackBar() {
  const { videoProject, setActiveScene } = useStore();
  const script = videoProject.script;
  const scenes = script?.scenes ?? [];
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || totalDuration === 0) return;
    lastTimeRef.current = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, totalDuration]);

  // Find active scene based on current time
  useEffect(() => {
    if (!script || scenes.length === 0) return;
    let elapsed = 0;
    for (const scene of scenes) {
      if (currentTime >= elapsed && currentTime < elapsed + scene.duration) {
        if (videoProject.activeSceneId !== scene.id) {
          setActiveScene(scene.id);
        }
        break;
      }
      elapsed += scene.duration;
    }
  }, [currentTime, scenes, script, videoProject.activeSceneId, setActiveScene]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    setCurrentTime(ratio * totalDuration);
  };

  // Scene markers on progress bar
  let sceneOffset = 0;
  const markers = scenes.map((s, i) => {
    const left = (sceneOffset / totalDuration) * 100;
    sceneOffset += s.duration;
    return { left, label: `Scene ${i + 1}`, id: s.id };
  });

  return (
    <div className="bg-[#0c0c10] border-t border-white/[0.06] px-4 py-2">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-zinc-800 rounded-full cursor-pointer mb-2 group" onClick={handleProgressClick}>
        <div
          className="absolute left-0 top-0 h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
        />
        {/* Scene markers */}
        {markers.map((m) => (
          <div
            key={m.id}
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-zinc-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${m.left}%` }}
            title={m.label}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Transport */}
        <button
          onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20 text-sky-400 hover:bg-sky-500/25 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={() => { setCurrentTime(totalDuration); setIsPlaying(false); }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Time display */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-xs font-mono tabular-nums text-sky-300">{formatTime(currentTime)}</span>
          <span className="text-xs text-zinc-600">/</span>
          <span className="text-xs font-mono tabular-nums text-zinc-500">{formatTime(totalDuration)}</span>
        </div>

        <div className="flex-1" />

        {/* Volume */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        {!isMuted && (
          <input
            type="range" min={0} max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-sky-500"
          />
        )}

        {/* Scene count */}
        <div className="px-2 py-1 rounded-lg bg-zinc-900/60 border border-white/[0.04] text-xs text-zinc-500">
          {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
