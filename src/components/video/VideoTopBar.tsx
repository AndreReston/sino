import { useState } from 'react';
import { ArrowLeft, Film, Undo2, Redo2, Download, Monitor, ChevronDown, Save } from 'lucide-react';
import { useVideoStore, AspectRatio } from '../../store/videoStore';

const RATIOS: { id: AspectRatio; label: string; dims: string }[] = [
  { id: '16:9', label: 'Landscape', dims: '1920×1080' },
  { id: '9:16', label: 'Portrait', dims: '1080×1920' },
  { id: '1:1', label: 'Square', dims: '1080×1080' },
];

interface Props {
  onSave?: () => void;
  onBack?: () => void;
}

export default function VideoTopBar({ onSave, onBack }: Props) {
  const { project, updateProject, undo, redo, historyIndex, history, startExport, isExporting, exportProgress } = useVideoStore();
  const [editingName, setEditingName] = useState(false);
  const [showRatio, setShowRatio] = useState(false);

  if (!project) return null;

  return (
    <div className="flex items-center h-12 bg-[#111115] border-b border-white/[0.06] px-3 gap-2 z-50 shrink-0">
      <div className="flex items-center gap-2 pr-3 border-r border-white/[0.06] mr-1">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="w-7 h-7 rounded-md bg-sky-500 flex items-center justify-center">
          <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">Video</span>

      {editingName ? (
        <input autoFocus className="bg-[#1a1a1f] border border-zinc-600 rounded-md px-2 py-0.5 text-sm text-white focus:outline-none focus:border-sky-500/50 w-40"
          value={project.title} onChange={(e) => updateProject({ title: e.target.value })} onBlur={() => setEditingName(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} />
      ) : (
        <button onClick={() => setEditingName(true)} className="text-sm text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors truncate max-w-[200px]">
          {project.title}
        </button>
      )}

      {/* Aspect ratio */}
      <div className="relative">
        <button onClick={() => setShowRatio(!showRatio)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <Monitor className="w-3.5 h-3.5" />
          <span>{project.aspectRatio}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showRatio && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRatio(false)} />
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#111115] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1">
              {RATIOS.map(r => (
                <button key={r.id} onClick={() => { updateProject({ aspectRatio: r.id }); setShowRatio(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${project.aspectRatio === r.id ? 'text-sky-300 bg-sky-500/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}>
                  <span>{r.label}</span><span className="text-zinc-500">{r.dims}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-white/[0.06] mx-1" />

      {/* Undo/Redo */}
      <button onClick={undo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
        <Undo2 className="w-4 h-4" />
      </button>
      <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      {/* Save & Export */}
      {onSave && (
        <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors">
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      )}
      <button onClick={startExport} disabled={isExporting}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-all disabled:opacity-50">
        <Download className="w-3.5 h-3.5" />
        {isExporting ? `${exportProgress}%` : 'Export'}
      </button>
    </div>
  );
}
