import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Undo2, Redo2, Download, Monitor, ChevronDown, Smartphone, Square, MonitorPlay, Check, Menu, SlidersHorizontal } from 'lucide-react';
import { useVideoStore, AspectRatio } from '../../store/videoStore';

const RATIOS: { id: AspectRatio; label: string; dims: string; icon: React.ReactNode }[] = [
  { id: '16:9', label: 'Landscape', dims: '1920×1080', icon: <MonitorPlay className="w-4 h-4" /> },
  { id: '9:16', label: 'Portrait', dims: '1080×1920', icon: <Smartphone className="w-4 h-4" /> },
  { id: '1:1', label: 'Square', dims: '1080×1080', icon: <Square className="w-4 h-4" /> },
];

interface Props {
  onBack?: () => void;
  onToggleSidebar?: () => void;
  onToggleProperties?: () => void;
}

export default function VideoTopBar({ onBack, onToggleSidebar, onToggleProperties }: Props) {
  const { project, updateProject, undo, redo, historyIndex, history, startExport, isExporting, exportProgress } = useVideoStore();
  const [editingName, setEditingName] = useState(false);
  const [showRatio, setShowRatio] = useState(false);
  const [autoSaveLabel, setAutoSaveLabel] = useState<string>('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show "Saved" indicator briefly when project data changes (auto-save fires)
  useEffect(() => {
    if (!project) return;
    setAutoSaveLabel('Saved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setAutoSaveLabel(''), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [project?.clips, project?.textOverlays, project?.stickerOverlays, project?.subtitles, project?.audioTracks, project?.backgroundMusic, project?.title, project?.aspectRatio]);

  if (!project) return null;

  return (
    <div className="flex items-center h-12 bg-[#111115] border-b border-white/[0.06] px-3 gap-2 z-50 shrink-0">
      {/* Mobile sidebar toggle */}
      {onToggleSidebar && (
        <button onClick={onToggleSidebar} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <Menu className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-2 pr-3 border-r border-white/[0.06] mr-1">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <img
          src="/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png"
          alt="DesignForge"
          className="w-7 h-7 rounded-md object-cover shadow-[0_0_10px_rgba(56,189,248,0.35)]"
        />
      </div>

      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">Video</span>

      <div className="hidden sm:flex items-center">
        {editingName ? (
          <input autoFocus className="bg-[#1a1a1f] border border-zinc-600 rounded-md px-2 py-0.5 text-sm text-white focus:outline-none focus:border-sky-500/50 w-40"
            value={project.title} onChange={(e) => updateProject({ title: e.target.value })} onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} />
        ) : (
          <button onClick={() => setEditingName(true)} className="text-sm text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors truncate max-w-[200px]">
            {project.title}
          </button>
        )}
      </div>

      {/* Aspect ratio */}
      <div className="hidden sm:block relative">
        <button onClick={() => setShowRatio(!showRatio)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors">
          {RATIOS.find(r => r.id === project.aspectRatio)?.icon ?? <Monitor className="w-3.5 h-3.5" />}
          <span className="font-medium">{project.aspectRatio}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        {showRatio && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRatio(false)} />
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#131318] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              {RATIOS.map(r => (
                <button key={r.id} onClick={() => { updateProject({ aspectRatio: r.id }); setShowRatio(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${project.aspectRatio === r.id ? 'bg-sky-500/10 text-sky-300' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${project.aspectRatio === r.id ? 'bg-sky-500/20 text-sky-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{r.label}</div>
                    <div className="text-[10px] text-zinc-500">{r.id} · {r.dims}</div>
                  </div>
                  {project.aspectRatio === r.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hidden sm:block w-px h-6 bg-white/[0.06] mx-1" />

      {/* Undo/Redo */}
      <div className="hidden sm:flex items-center gap-0.5">
        <button onClick={undo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Mobile: project title compact */}
      <span className="sm:hidden text-xs text-zinc-400 truncate max-w-[100px]">{project.title}</span>

      {/* Auto-save indicator */}
      {autoSaveLabel && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-emerald-400/80 transition-opacity">
          <Check className="w-3 h-3" /> {autoSaveLabel}
        </div>
      )}

      {/* Mobile: properties toggle */}
      {onToggleProperties && (
        <button onClick={onToggleProperties} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}

      <button onClick={startExport} disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 hover:shadow-[0_4px_20px_rgba(56,189,248,0.3)] transition-all disabled:opacity-50">
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isExporting ? `${exportProgress}%` : 'Export'}</span>
      </button>
    </div>
  );
}
