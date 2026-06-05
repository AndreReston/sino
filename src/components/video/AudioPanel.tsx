import React from 'react';
import {
  Mic, Volume2, Music, Play,
  Waves, Headphones, Globe,
} from 'lucide-react';
import { useVideoStore, VoiceGender, VoiceAge, VoiceTone, MusicMood } from '../../store/videoStore';

const MUSIC_MOODS: { id: MusicMood; label: string; icon: React.ReactNode }[] = [
  { id: 'hype', label: 'Hype', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'sad', label: 'Sad', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'cinematic', label: 'Cinematic', icon: <Headphones className="w-3.5 h-3.5" /> },
  { id: 'chill', label: 'Chill', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'upbeat', label: 'Upbeat', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'mysterious', label: 'Mysterious', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'epic', label: 'Epic', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'lofi', label: 'Lo-fi', icon: <Headphones className="w-3.5 h-3.5" /> },
];

export default function AudioPanel() {
  const { project, updateVoice, setMusicMood } = useVideoStore();

  if (!project) return null;

  const voice = project.voice;

  return (
    <div className="p-4 space-y-5">
      {/* Voiceover section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Voiceover</h4>
        </div>

        {/* Gender */}
        <div className="mb-3">
          <label className="block text-[11px] text-zinc-500 mb-1.5">Voice Gender</label>
          <div className="flex gap-1.5">
            {(['male', 'female', 'neutral'] as VoiceGender[]).map((g) => (
              <button
                key={g}
                onClick={() => updateVoice({ gender: g })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  voice.gender === g
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="mb-3">
          <label className="block text-[11px] text-zinc-500 mb-1.5">Voice Age</label>
          <div className="flex gap-1.5">
            {(['young', 'middle', 'senior'] as VoiceAge[]).map((a) => (
              <button
                key={a}
                onClick={() => updateVoice({ age: a })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  voice.age === a
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-3">
          <label className="block text-[11px] text-zinc-500 mb-1.5">Voice Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {(['professional', 'casual', 'energetic', 'calm', 'dramatic'] as VoiceTone[]).map((t) => (
              <button
                key={t}
                onClick={() => updateVoice({ tone: t })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  voice.tone === t
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="mb-3">
          <label className="block text-[11px] text-zinc-500 mb-1.5">Speed</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={voice.speed}
              onChange={(e) => updateVoice({ speed: Number(e.target.value) })}
              className="flex-1 accent-sky-500"
            />
            <span className="text-xs text-zinc-400 tabular-nums w-8 text-right">{voice.speed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1.5">Language</label>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={voice.language}
              onChange={(e) => updateVoice({ language: e.target.value })}
              className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500/40 transition-all"
            >
              {['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'it', 'ar'].map((l) => (
                <option key={l} value={l}>{new Intl.DisplayNames(['en'], { type: 'language' }).of(l)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview voice button */}
        <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm font-medium text-sky-300 hover:bg-sky-500/15 transition-colors">
          <Play className="w-4 h-4" />
          Preview Voice
        </button>
      </div>

      {/* Music section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Background Music</h4>
        </div>

        <p className="text-[11px] text-zinc-500 mb-3">Auto-selected based on mood. Beat-matched to scene cuts.</p>

        <div className="grid grid-cols-2 gap-2">
          {MUSIC_MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setMusicMood(mood.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                project.musicMood === mood.id
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
              }`}
            >
              {mood.icon}
              {mood.label}
            </button>
          ))}
        </div>

        {/* Music preview */}
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/15 transition-colors">
                <Play className="w-3.5 h-3.5" />
              </button>
              <div>
                <p className="text-xs text-zinc-200 font-medium capitalize">{project.musicMood} beat</p>
                <p className="text-[10px] text-zinc-500">Auto-selected</p>
              </div>
            </div>
            <Volume2 className="w-4 h-4 text-zinc-500" />
          </div>
          {/* Waveform visualization */}
          <div className="flex items-end gap-px h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/30 rounded-sm"
                style={{ height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Audio sync info */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Audio Sync</h4>
        <div className="space-y-1.5 text-xs text-zinc-500">
          <p>Auto-aligns voice with visuals</p>
          <p>Beat-based scene transitions</p>
          <p>Music fades match scene cuts</p>
        </div>
      </div>
    </div>
  );
}
