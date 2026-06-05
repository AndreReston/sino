import { useState } from 'react';
import {
  LayoutGrid, FileText, Volume2, Type as Subtitles, Palette,
  MessageCircle, Plus, Trash2, RefreshCw, GripVertical,
  ChevronDown,
  Film, Sparkles, Zap,
  Heart, Flame, CloudRain, Sun,
} from 'lucide-react';
import { useStore, VideoStyle, CaptionStyle, MusicMood, VoiceGender, VoiceTone } from '../../store/useStore';

type VideoTab = 'storyboard' | 'script' | 'audio' | 'captions' | 'style' | 'chat';

const TABS: { id: VideoTab; icon: React.ReactNode; label: string }[] = [
  { id: 'storyboard', icon: <LayoutGrid className="w-4 h-4" />, label: 'Storyboard' },
  { id: 'script', icon: <FileText className="w-4 h-4" />, label: 'Script' },
  { id: 'audio', icon: <Volume2 className="w-4 h-4" />, label: 'Audio' },
  { id: 'captions', icon: <Subtitles className="w-4 h-4" />, label: 'Captions' },
  { id: 'style', icon: <Palette className="w-4 h-4" />, label: 'Style' },
  { id: 'chat', icon: <MessageCircle className="w-4 h-4" />, label: 'Chat' },
];

const VIDEO_STYLES: { id: VideoStyle; label: string; desc: string }[] = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Film-like quality' },
  { id: 'anime', label: 'Anime', desc: 'Japanese animation' },
  { id: 'documentary', label: 'Documentary', desc: 'Real-world footage' },
  { id: 'tiktok', label: 'TikTok', desc: 'Trendy aesthetic' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon futuristic' },
  { id: 'corporate', label: 'Corporate', desc: 'Professional clean' },
  { id: 'retro-vhs', label: 'Retro VHS', desc: 'Vintage tape look' },
  { id: 'minimal-clean', label: 'Minimal', desc: 'Clean and simple' },
];

const CAPTION_STYLES: { id: CaptionStyle; label: string }[] = [
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'popup', label: 'Pop-up' },
  { id: 'viral-tiktok', label: 'Viral TikTok' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold-highlight', label: 'Bold Highlight' },
];

const MUSIC_MOODS: { id: MusicMood; label: string; icon: React.ReactNode }[] = [
  { id: 'hype', label: 'Hype', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'sad', label: 'Sad', icon: <CloudRain className="w-3.5 h-3.5" /> },
  { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-3.5 h-3.5" /> },
  { id: 'chill', label: 'Chill', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'energetic', label: 'Energetic', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'romantic', label: 'Romantic', icon: <Heart className="w-3.5 h-3.5" /> },
];

export default function VideoSidebar() {
  const [activeTab, setActiveTab] = useState<VideoTab>('storyboard');
  const {
    videoProject, updateScene, addScene, removeScene,
    setActiveScene, regenerateScene,
    setVoiceoverConfig, setMusicConfig, setCaptionConfig,
    addChatMessage,
  } = useStore();

  const script = videoProject.script;

  return (
    <aside className="flex h-full bg-[#0f0f12] border-r border-white/[0.06] shrink-0" style={{ width: 300 }}>
      {/* Icon rail */}
      <div className="flex flex-col items-center w-14 border-r border-white/[0.06] py-3 gap-1 shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mb-3">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>

        {TABS.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all text-xs gap-0.5
              ${activeTab === t.id
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Tab header */}
        <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {TABS.find((t) => t.id === activeTab)?.label}
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {activeTab === 'storyboard' && <StoryboardTab />}
          {activeTab === 'script' && <ScriptTab />}
          {activeTab === 'audio' && <AudioTab />}
          {activeTab === 'captions' && <CaptionsTab />}
          {activeTab === 'style' && <StyleTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>
      </div>
    </aside>
  );

  // ── Storyboard Tab ─────────────────────────────────────────────
  function StoryboardTab() {
    if (!script) return <p className="text-xs text-zinc-600 text-center py-8">No scenes yet</p>;

    return (
      <div className="space-y-2">
        {script.scenes.map((scene, idx) => {
          const isActive = videoProject.activeSceneId === scene.id;
          return (
            <div
              key={scene.id}
              onClick={() => setActiveScene(scene.id)}
              className={`group rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? 'border-sky-500/40 bg-sky-500/[0.08]'
                  : 'border-white/[0.06] bg-[#151519] hover:border-white/[0.12] hover:bg-[#1a1a1f]'
              }`}
            >
              <div className="flex items-start gap-2">
                <GripVertical className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Scene {idx + 1}</span>
                    <span className="text-[11px] text-zinc-600 tabular-nums">{scene.duration}s</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 mb-1.5">
                    {scene.visualDescription}
                  </p>
                  <p className="text-[11px] text-zinc-500 italic line-clamp-1">
                    "{scene.scriptLine}"
                  </p>
                </div>
              </div>

              {/* Scene actions */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={(e) => { e.stopPropagation(); regenerateScene(scene.id); }}
                  disabled={scene.isGenerating}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${scene.isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); addScene(scene.id); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add after
                </button>
                {script.scenes.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => addScene()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/[0.08] text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
      </div>
    );
  }

  // ── Script Tab ─────────────────────────────────────────────────
  function ScriptTab() {
    if (!script) return null;
    const activeScene = script.scenes.find(s => s.id === videoProject.activeSceneId);

    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs text-zinc-500 mb-2">Script Rewriter</p>
          <p className="text-[11px] text-zinc-600">Apply AI transformations to your script.</p>
        </div>

        {/* Quick rewrite commands */}
        <div className="space-y-1.5">
          {[
            { label: 'Make it shorter', icon: <ChevronDown className="w-3 h-3" /> },
            { label: 'Make it emotional', icon: <Heart className="w-3 h-3" /> },
            { label: 'Add suspense', icon: <Zap className="w-3 h-3" /> },
            { label: 'Make it Gen Z style', icon: <Sparkles className="w-3 h-3" /> },
            { label: 'Stronger hook', icon: <Flame className="w-3 h-3" /> },
            { label: 'More energetic', icon: <Zap className="w-3 h-3" /> },
          ].map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => addChatMessage('user', cmd.label)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#151519] border border-white/[0.06] text-xs text-zinc-300 hover:text-white hover:border-white/[0.12] hover:bg-[#1a1a1f] transition-all"
            >
              {cmd.icon}
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Active scene script */}
        {activeScene && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">Active Scene Script</p>
            <textarea
              value={activeScene.scriptLine}
              onChange={(e) => updateScene(activeScene.id, { scriptLine: e.target.value })}
              className="w-full h-20 bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 resize-none"
              placeholder="Enter script line..."
            />
          </div>
        )}

        {/* Hook text */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Hook Text</p>
          <textarea
            value={script.hookText}
            onChange={(e) => {
              useStore.getState().setVideoProject({
                script: { ...script, hookText: e.target.value }
              });
            }}
            className="w-full h-16 bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 resize-none"
          />
        </div>
      </div>
    );
  }

  // ── Audio Tab ──────────────────────────────────────────────────
  function AudioTab() {
    const { voiceover, music } = videoProject;

    return (
      <div className="space-y-5">
        {/* Voiceover */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">AI Voiceover</p>
            <button
              onClick={() => setVoiceoverConfig({ enabled: !voiceover.enabled })}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                voiceover.enabled ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
              }`}
            >
              {voiceover.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {voiceover.enabled && (
            <div className="space-y-3 p-3 rounded-xl bg-[#151519] border border-white/[0.06]">
              {/* Gender */}
              <div>
                <label className="text-[11px] text-zinc-500 mb-1 block">Voice</label>
                <div className="flex gap-1">
                  {(['male', 'female', 'neutral'] as VoiceGender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setVoiceoverConfig({ gender: g })}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        voiceover.gender === g
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-white/5 text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
                      }`}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="text-[11px] text-zinc-500 mb-1 block">Tone</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['professional', 'casual', 'energetic', 'emotional', 'narrative'] as VoiceTone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setVoiceoverConfig({ tone: t })}
                      className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        voiceover.tone === t
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-white/5 text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-zinc-500">Speed</label>
                  <span className="text-[11px] text-zinc-400 tabular-nums">{voiceover.speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min={0.5} max={2} step={0.1}
                  value={voiceover.speed}
                  onChange={(e) => setVoiceoverConfig({ speed: Number(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Music */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Background Music</p>
            <button
              onClick={() => setMusicConfig({ enabled: !music.enabled })}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                music.enabled ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
              }`}
            >
              {music.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {music.enabled && (
            <div className="space-y-3 p-3 rounded-xl bg-[#151519] border border-white/[0.06]">
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Mood</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {MUSIC_MOODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMusicConfig({ mood: m.id })}
                      className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                        music.mood === m.id
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-white/5 text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
                      }`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-zinc-500">Volume</label>
                  <span className="text-[11px] text-zinc-400 tabular-nums">{Math.round(music.volume * 100)}%</span>
                </div>
                <input
                  type="range" min={0} max={100}
                  value={Math.round(music.volume * 100)}
                  onChange={(e) => setMusicConfig({ volume: Number(e.target.value) / 100 })}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-500">Beat match to cuts</label>
                <button
                  onClick={() => setMusicConfig({ beatMatch: !music.beatMatch })}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    music.beatMatch ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
                  }`}
                >
                  {music.beatMatch ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Captions Tab ───────────────────────────────────────────────
  function CaptionsTab() {
    const { captions } = videoProject;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Auto Captions</p>
          <button
            onClick={() => setCaptionConfig({ enabled: !captions.enabled })}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              captions.enabled ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
            }`}
          >
            {captions.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {captions.enabled && (
          <div className="space-y-3">
            {/* Caption style */}
            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Style</label>
              <div className="space-y-1.5">
                {CAPTION_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCaptionConfig({ style: s.id })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      captions.style === s.id
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : 'bg-[#151519] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 p-3 rounded-xl bg-[#151519] border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Highlight keywords</span>
                <button
                  onClick={() => setCaptionConfig({ highlightKeywords: !captions.highlightKeywords })}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    captions.highlightKeywords ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
                  }`}
                >
                  {captions.highlightKeywords ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Sync with beat</span>
                <button
                  onClick={() => setCaptionConfig({ syncWithBeat: !captions.syncWithBeat })}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    captions.syncWithBeat ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
                  }`}
                >
                  {captions.syncWithBeat ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Auto-generate</span>
                <button
                  onClick={() => setCaptionConfig({ autoGenerate: !captions.autoGenerate })}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    captions.autoGenerate ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-zinc-500 border border-white/[0.06]'
                  }`}
                >
                  {captions.autoGenerate ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Style Tab ──────────────────────────────────────────────────
  function StyleTab() {
    const activeScene = script?.scenes.find(s => s.id === videoProject.activeSceneId);

    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs text-zinc-500 mb-2">Visual Style</p>
          <p className="text-[11px] text-zinc-600">Apply a style preset to the active scene or all scenes.</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {VIDEO_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                if (activeScene) {
                  updateScene(activeScene.id, { stylePreset: s.id });
                }
              }}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all ${
                activeScene?.stylePreset === s.id
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'bg-[#151519] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
              }`}
            >
              {s.label}
              <span className="text-[9px] text-zinc-600">{s.desc}</span>
            </button>
          ))}
        </div>

        {/* Vibe Controls */}
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Vibe Controls</p>
          <p className="text-[11px] text-zinc-600">Describe how you want the visuals to feel.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'More cinematic',
              'Make it warmer',
              'Add dream effect',
              'Make it gritty',
              'Add glitch',
              'Add film grain',
              'Cinematic zoom',
              'Slow-motion impact',
            ].map((vibe) => (
              <button
                key={vibe}
                onClick={() => {
                  useStore.getState().applyVibeControl(vibe);
                  addChatMessage('user', vibe);
                }}
                className="px-2 py-2 rounded-lg bg-[#151519] border border-white/[0.06] text-[11px] text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-[#1a1a1f] transition-all text-left"
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Chat Tab ───────────────────────────────────────────────────
  function ChatTab() {
    const [input, setInput] = useState('');
    const { chatHistory } = videoProject;

    const sendMessage = () => {
      if (!input.trim()) return;
      addChatMessage('user', input.trim());
      // Simulate AI response
      setTimeout(() => {
        const responses = [
          'I\'ve adjusted the pacing to be more dynamic. The hook now hits harder in the first 2 seconds.',
          'Great idea! I\'ve made the transitions more cinematic and added subtle zoom effects.',
          'The script has been refined for better engagement. Key phrases are now emphasized.',
          'I\'ve applied a warmer color grade and slowed down the reveal moment for more impact.',
          'Added beat-synced transitions between scenes. The energy builds naturally now.',
        ];
        addChatMessage('assistant', responses[Math.floor(Math.random() * responses.length)]);
      }, 800);
      setInput('');
    };

    return (
      <div className="flex flex-col h-full -m-3">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {chatHistory.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs text-zinc-600">Ask the AI to improve your video</p>
              <p className="text-[11px] text-zinc-700 mt-1">e.g. "Make it more viral"</p>
            </div>
          )}
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-500/15 text-sky-200 border border-sky-500/20'
                  : 'bg-[#151519] text-zinc-300 border border-white/[0.06]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts */}
        <div className="px-3 py-2 border-t border-white/[0.04]">
          <div className="flex gap-1 flex-wrap">
            {['Make it more viral', 'Fix pacing', 'Stronger hook', 'Feel like Apple ad'].map((q) => (
              <button
                key={q}
                onClick={() => { addChatMessage('user', q); }}
                className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask AI to improve your video..."
              className="flex-1 bg-[#151519] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }
}