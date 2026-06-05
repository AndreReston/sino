import { useState } from 'react';
import {
  Wand2, ChevronUp,
  Sparkles, Minus, Plus,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

const SCRIPT_TEMPLATES = [
  { label: 'Hook + Buildup + Payoff', structure: ['hook', 'buildup', 'payoff'] },
  { label: 'Problem + Solution + CTA', structure: ['problem', 'solution', 'cta'] },
  { label: 'Story Arc', structure: ['setup', 'conflict', 'resolution', 'ending'] },
  { label: 'Before + After', structure: ['before', 'transformation', 'after'] },
  { label: 'List / Countdown', structure: ['intro', 'item1', 'item2', 'item3', 'outro'] },
];

const TONE_OPTIONS = ['funny', 'serious', 'hype', 'emotional', 'casual', 'professional', 'dramatic'];

export default function ScriptPanel() {
  const { project, activeSceneId, updateScene, processAICommand } = useVideoStore();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [tone, setTone] = useState('hype');

  if (!project) return null;

  const scenes = project.scenes;

  const applyTemplate = () => {
    const template = SCRIPT_TEMPLATES[selectedTemplate];
    const structure = template.structure;

    // Adjust scene count to match template
    const newCount = structure.length;
    const diff = newCount - scenes.length;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        useVideoStore.getState().addScene(scenes[scenes.length - 1]?.id);
      }
    }

    // Apply script structure labels to scenes
    structure.forEach((label, i) => {
      const scene = useVideoStore.getState().project?.scenes[i];
      if (scene) {
        updateScene(scene.id, {
          scriptLine: scene.scriptLine || `[${label.toUpperCase()}] - Write your ${label} here`,
          visualDescription: scene.visualDescription || `${label.charAt(0).toUpperCase() + label.slice(1)} scene`,
        });
      }
    });
  };

  const rewriteScript = (command: string) => {
    processAICommand(command);
  };

  const totalWordCount = scenes.reduce((acc, s) => acc + (s.scriptLine?.split(/\s+/).length || 0), 0);
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="p-4 space-y-5">
      {/* Overview */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Script Overview</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{scenes.length}</div>
            <div className="text-[10px] text-zinc-500">Scenes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{totalWordCount}</div>
            <div className="text-[10px] text-zinc-500">Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{totalDuration}s</div>
            <div className="text-[10px] text-zinc-500">Duration</div>
          </div>
        </div>
      </div>

      {/* Script templates */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Structure Templates</h4>
        <div className="space-y-2">
          {SCRIPT_TEMPLATES.map((tmpl, i) => (
            <button
              key={tmpl.label}
              onClick={() => { setSelectedTemplate(i); }}
              className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                selectedTemplate === i
                  ? 'bg-sky-500/10 border border-sky-500/30 text-sky-200'
                  : 'bg-white/[0.02] border border-white/[0.06] text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <div className="text-sm font-medium">{tmpl.label}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{tmpl.structure.join(' → ')}</div>
            </button>
          ))}
        </div>
        <button
          onClick={applyTemplate}
          className="w-full mt-3 rounded-xl bg-sky-500/10 border border-sky-500/20 px-4 py-2.5 text-sm font-medium text-sky-300 hover:bg-sky-500/15 transition-colors"
        >
          Apply Template
        </button>
      </div>

      {/* Tone */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tone</h4>
        <div className="flex flex-wrap gap-1.5">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => { setTone(t); rewriteScript(`Make it ${t}`); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                tone === t
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-zinc-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI rewrite commands */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">AI Rewrite</h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { cmd: 'Make it shorter', icon: <Minus className="w-3 h-3" /> },
            { cmd: 'Make it more emotional', icon: <Sparkles className="w-3 h-3" /> },
            { cmd: 'Make it Gen Z style', icon: <Wand2 className="w-3 h-3" /> },
            { cmd: 'Add suspense', icon: <ChevronUp className="w-3 h-3" /> },
            { cmd: 'Stronger hook', icon: <ChevronUp className="w-3 h-3" /> },
          ].map(({ cmd, icon }) => (
            <button
              key={cmd}
              onClick={() => rewriteScript(cmd)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 hover:border-sky-500/30 hover:bg-sky-500/[0.04] transition-all"
            >
              {icon}
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Per-scene script editing */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scene Scripts</h4>
        <div className="space-y-2">
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              className={`rounded-xl border p-3 transition-colors ${
                scene.id === activeSceneId ? 'border-sky-500/30 bg-sky-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Scene {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateScene(scene.id, { durationSeconds: Math.max(1, scene.durationSeconds - 1) })}
                    className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-zinc-400 tabular-nums w-8 text-center">{scene.durationSeconds}s</span>
                  <button
                    onClick={() => updateScene(scene.id, { durationSeconds: Math.min(30, scene.durationSeconds + 1) })}
                    className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <textarea
                value={scene.scriptLine}
                onChange={(e) => updateScene(scene.id, { scriptLine: e.target.value })}
                rows={2}
                className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 transition-all resize-none"
                placeholder="Write script for this scene..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
