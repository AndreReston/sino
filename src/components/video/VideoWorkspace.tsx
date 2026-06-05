import { useState } from 'react';
import {
  Film, Layers, Undo2, Redo2, Download, Save, ArrowLeft,
  Sparkles, MessageSquare, FileText, Palette, Music,
  Captions, Monitor, BarChart3, LayoutGrid,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';
import SceneBoard from './SceneBoard';
import AIChat from './AIChat';
import ScriptPanel from './ScriptPanel';
import VibeControls from './VibeControls';
import AudioPanel from './AudioPanel';
import CaptionPanel from './CaptionPanel';
import ExportPanel from './ExportPanel';
import VideoTemplates from './VideoTemplates';
import EngagementScore from './EngagementScore';

type Props = {
  onSave?: () => void;
  onBack?: () => void;
};

const RIGHT_TABS = [
  { id: 'ai-chat' as const, icon: <MessageSquare className="w-4 h-4" />, label: 'AI Chat' },
  { id: 'script' as const, icon: <FileText className="w-4 h-4" />, label: 'Script' },
  { id: 'vibes' as const, icon: <Palette className="w-4 h-4" />, label: 'Vibes' },
  { id: 'audio' as const, icon: <Music className="w-4 h-4" />, label: 'Audio' },
  { id: 'captions' as const, icon: <Captions className="w-4 h-4" />, label: 'Captions' },
  { id: 'export' as const, icon: <Download className="w-4 h-4" />, label: 'Export' },
  { id: 'templates' as const, icon: <LayoutGrid className="w-4 h-4" />, label: 'Templates' },
  { id: 'engagement' as const, icon: <BarChart3 className="w-4 h-4" />, label: 'Score' },
];

export default function VideoWorkspace({ onSave, onBack }: Props) {
  const { project, rightPanelTab, setRightPanelTab, isGenerating, generationProgress, undoVersion, redoVersion, versionIndex, versionStack } = useVideoStore();

  if (!project) return null;

  return (
    <div className="flex h-screen bg-[#07070a] text-white overflow-hidden select-none">
      {/* ── Left icon rail ── */}
      <div className="flex flex-col items-center w-14 border-r border-white/[0.06] bg-[#0c0c10] py-3 gap-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center mb-3">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {RIGHT_TABS.map((tab) => (
          <button
            key={tab.id}
            title={tab.label}
            onClick={() => setRightPanelTab(tab.id)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              rightPanelTab === tab.id
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {tab.icon}
          </button>
        ))}

        <div className="flex-1" />

        <div className="w-8 h-px bg-white/[0.06] my-1" />
        <button
          onClick={undoVersion}
          disabled={versionIndex <= 0}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redoVersion}
          disabled={versionIndex >= versionStack.length - 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Scene Board (main content) ── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Top bar */}
        <div className="flex items-center h-12 bg-[#0c0c10] border-b border-white/[0.06] px-4 gap-3 shrink-0 z-50">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          <div className="w-px h-6 bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">{project.title}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">
            Video
          </span>

          <div className="flex-1" />

          {/* Platform badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
            <Monitor className="w-3.5 h-3.5" />
            <span className="capitalize">{project.platform.replace('-', ' ')}</span>
          </div>

          {/* Scene count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
            <Layers className="w-3.5 h-3.5" />
            {project.scenes.length} scenes
          </div>

          {/* Generate */}
          <button
            onClick={() => useVideoStore.getState().generateFullVideo()}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? `Generating ${generationProgress}%` : 'Generate Video'}
          </button>

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          )}
        </div>

        {/* Progress bar */}
        {isGenerating && (
          <div className="h-1 bg-zinc-900 shrink-0">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        )}

        {/* Scene board */}
        <SceneBoard />
      </div>

      {/* ── Right panel ── */}
      <div className="w-80 border-l border-white/[0.06] bg-[#0c0c10] flex flex-col shrink-0 overflow-hidden">
        {/* Right panel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
          {RIGHT_TABS.find((t) => t.id === rightPanelTab)?.icon}
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {RIGHT_TABS.find((t) => t.id === rightPanelTab)?.label}
          </span>
        </div>

        {/* Right panel content */}
        <div className="flex-1 overflow-y-auto">
          {rightPanelTab === 'ai-chat' && <AIChat />}
          {rightPanelTab === 'script' && <ScriptPanel />}
          {rightPanelTab === 'vibes' && <VibeControls />}
          {rightPanelTab === 'audio' && <AudioPanel />}
          {rightPanelTab === 'captions' && <CaptionPanel />}
          {rightPanelTab === 'export' && <ExportPanel />}
          {rightPanelTab === 'templates' && <VideoTemplates />}
          {rightPanelTab === 'engagement' && <EngagementScore />}
        </div>
      </div>
    </div>
  );
}
