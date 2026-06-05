import React from 'react';
import {
  Sun, Moon, CloudRain, Zap, Flame, Eye, Camera,
  Sparkles, Film, Waves, X,
} from 'lucide-react';
import { useVideoStore, VibePreset, EffectPreset } from '../../store/videoStore';

const VIBE_PRESETS: { id: VibePreset; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-4 h-4" />, description: 'Rich, dramatic, movie-quality' },
  { id: 'warmer', label: 'Warmer', icon: <Sun className="w-4 h-4" />, description: 'Golden tones, cozy feel' },
  { id: 'dreamy', label: 'Dreamy', icon: <CloudRain className="w-4 h-4" />, description: 'Soft, ethereal, hazy' },
  { id: 'gritty', label: 'Gritty', icon: <Flame className="w-4 h-4" />, description: 'Raw, textured, intense' },
  { id: 'neon', label: 'Neon', icon: <Zap className="w-4 h-4" />, description: 'Vibrant, electric, bold' },
  { id: 'vintage', label: 'Vintage', icon: <Camera className="w-4 h-4" />, description: 'Retro, faded, nostalgic' },
  { id: 'moody', label: 'Moody', icon: <Moon className="w-4 h-4" />, description: 'Dark, atmospheric, shadowy' },
  { id: 'bright', label: 'Bright', icon: <Sun className="w-4 h-4" />, description: 'Light, clean, vibrant' },
  { id: 'clean', label: 'Clean', icon: <Eye className="w-4 h-4" />, description: 'Minimal, pure, Apple-like' },
  { id: 'dramatic', label: 'Dramatic', icon: <Sparkles className="w-4 h-4" />, description: 'Bold contrasts, powerful' },
  { id: 'faded', label: 'Faded', icon: <Waves className="w-4 h-4" />, description: 'Desaturated, washed out' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: <Zap className="w-4 h-4" />, description: 'Neon-drenched, futuristic' },
];

const EFFECT_PRESETS: { id: EffectPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'glitch', label: 'Glitch', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'motion-blur', label: 'Motion Blur', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'film-grain', label: 'Film Grain', icon: <Film className="w-3.5 h-3.5" /> },
  { id: 'cinematic-zoom', label: 'Cinematic Zoom', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'slow-motion-impact', label: 'Slow-Mo Impact', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'zoom-punch', label: 'Zoom Punch', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'vhs-distortion', label: 'VHS Distortion', icon: <Film className="w-3.5 h-3.5" /> },
  { id: 'bokeh', label: 'Bokeh', icon: <Camera className="w-3.5 h-3.5" /> },
];

export default function VibeControls() {
  const { project, activeSceneId, applyVibePreset, addEffect, removeEffect, processAICommand } = useVideoStore();

  if (!project) return null;

  const activeScene = project.scenes.find((s) => s.id === activeSceneId);
  const currentVibe = activeScene?.vibePreset || project.scenes[0]?.vibePreset || 'cinematic';
  const currentEffects = activeScene?.effects || [];

  return (
    <div className="p-4 space-y-5">
      {/* Scope indicator */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="text-xs text-zinc-400">
          {activeScene
            ? `Applying to: Scene ${project.scenes.indexOf(activeScene) + 1}`
            : 'Applying to: All scenes'}
        </p>
      </div>

      {/* Vibe presets */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Vibe Presets</h4>
        <p className="text-[11px] text-zinc-500 mb-3">No sliders. Just describe the mood you want.</p>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_PRESETS.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => applyVibePreset(vibe.id, activeSceneId ?? undefined)}
              className={`rounded-xl px-3 py-3 text-left transition-all ${
                currentVibe === vibe.id
                  ? 'bg-sky-500/10 border border-sky-500/30 text-sky-200'
                  : 'bg-white/[0.02] border border-white/[0.06] text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {vibe.icon}
                <span className="text-xs font-medium">{vibe.label}</span>
              </div>
              <p className="text-[10px] text-zinc-500">{vibe.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Effects</h4>
        <p className="text-[11px] text-zinc-500 mb-3">Add visual effects via prompt or toggle.</p>
        <div className="flex flex-wrap gap-2">
          {EFFECT_PRESETS.map((fx) => {
            const isActive = currentEffects.includes(fx.id);
            return (
              <button
                key={fx.id}
                onClick={() => isActive ? removeEffect(fx.id, activeSceneId ?? undefined) : addEffect(fx.id, activeSceneId ?? undefined)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
                }`}
              >
                {fx.icon}
                {fx.label}
                {isActive && <X className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt-based effects */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Effects via Prompt</h4>
        <p className="text-[11px] text-zinc-500 mb-3">Just say what you want in natural language.</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            'Add glitch',
            'Add motion blur',
            'Add film grain',
            'Add cinematic zoom',
            'Add slow-motion impact',
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => processAICommand(cmd)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 hover:border-sky-500/30 hover:bg-sky-500/[0.04] transition-all"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Focus system */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Focus</h4>
        <div className="space-y-2">
          <button
            onClick={() => processAICommand('Highlight the subject with background blur')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 hover:border-sky-500/30 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Auto highlight subject
          </button>
          <button
            onClick={() => processAICommand('Add dreamy background blur')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 hover:border-sky-500/30 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            AI background blur
          </button>
        </div>
      </div>
    </div>
  );
}
