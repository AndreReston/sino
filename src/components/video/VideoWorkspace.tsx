import { useState } from 'react';
import { useStore } from '../../store/useStore';
import VideoTopBar from './VideoTopBar';
import VideoSidebar from './VideoSidebar';
import ScenePreview from './ScenePreview';
import SceneProperties from './SceneProperties';
import PlaybackBar from './PlaybackBar';
import AIPromptBar from './AIPromptBar';

export default function VideoWorkspace() {
  const { videoProject, createScript } = useStore();
  const isGenerating = videoProject.isGenerating;

  const handleBack = () => {
    useStore.getState().resetWorkspace();
  };

  const handleSave = () => {
    // Delegate to App-level save (user can click save in TopBar too)
    const saveBtn = document.querySelector('[data-save-video]') as HTMLButtonElement | null;
    saveBtn?.click();
  };
  const [prompt, setPrompt] = useState('');

  // No script yet — show the creation prompt
  if (!videoProject.script) {
    return (
      <div className="flex h-screen bg-[#07070a] text-white">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="fixed top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to dashboard
        </button>

        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-sky-500/[0.03] blur-[100px]" />
        </div>

        {/* Center prompt */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full px-6">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Create your video</h1>
              <p className="text-zinc-400 leading-relaxed">
                Describe your video idea and AI will generate a storyboard with scenes, script, and visuals.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Make a viral gym motivation reel with high energy, dramatic transitions, and an inspirational hook..."
                className="w-full h-32 bg-[#111115] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all resize-none"
              />
              <button
                onClick={() => {
                  if (prompt.trim()) {
                    createScript(prompt.trim());
                  }
                }}
                disabled={!prompt.trim() || isGenerating}
                className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-sky-400 hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isGenerating ? 'Generating storyboard...' : 'Generate Video'}
              </button>
            </div>

            <div className="mt-8">
              <p className="text-xs text-zinc-600 text-center mb-4">Quick starts</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Motivation Reel', prompt: 'Make a viral gym motivation reel with high energy beats and dramatic before/after transformation' },
                  { label: 'Product Ad', prompt: 'Create a 30-second product ad for a tech gadget with sleek cinematic shots and minimal aesthetic' },
                  { label: 'Story Documentary', prompt: 'Tell an emotional documentary story with narrative voiceover and cinematic b-roll' },
                  { label: 'Study Aesthetic', prompt: 'Make a cozy study aesthetic video with lofi vibes, warm lighting, and chill mood' },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setPrompt(t.prompt)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all text-left"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full workspace with script loaded
  return (
    <div className="flex h-screen bg-[#07070a] text-white overflow-hidden select-none">
      <VideoSidebar />
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        <VideoTopBar onSave={handleSave} onBack={handleBack} />
        <div className="flex flex-1 min-w-0 min-h-0">
          <ScenePreview />
          <SceneProperties />
        </div>
        <AIPromptBar />
        <PlaybackBar />
      </div>
    </div>
  );
}
