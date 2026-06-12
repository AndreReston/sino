import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Undo2, Redo2, Download, Monitor, ChevronDown, Smartphone, Square, MonitorPlay, Check, Sun, Moon } from 'lucide-react';
import { useVideoStore, AspectRatio } from '../../store/videoStore';
import { useThemeStore } from '../../store/themeStore';

const RATIOS: { id: AspectRatio; label: string; dims: string; icon: React.ReactNode }[] = [
  { id: '16:9', label: 'Landscape', dims: '1920×1080', icon: <MonitorPlay className="w-4 h-4" /> },
  { id: '9:16', label: 'Portrait', dims: '1080×1920', icon: <Smartphone className="w-4 h-4" /> },
  { id: '1:1', label: 'Square', dims: '1080×1080', icon: <Square className="w-4 h-4" /> },
];

interface Props {
  onBack?: () => void;
}

export default function VideoTopBar({ onBack }: Props) {
  const { project, updateProject, undo, redo, historyIndex, history, startExport, isExporting, exportProgress } = useVideoStore();
  const { mode, toggle } = useThemeStore();
  const [editingName, setEditingName] = useState(false);
  const [showRatio, setShowRatio] = useState(false);
  const [autoSaveLabel, setAutoSaveLabel] = useState<string>('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!project) return;
    setAutoSaveLabel('Saved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setAutoSaveLabel(''), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [project?.clips, project?.textOverlays, project?.stickerOverlays, project?.subtitles, project?.audioTracks, project?.backgroundMusic, project?.title, project?.aspectRatio]);

  if (!project) return null;

  return (
    <div className="flex items-center h-12 bg-canvas-surface border-b border-panel-border px-3 gap-2 z-50 shrink-0">
      <div className="flex items-center gap-2 pr-3 border-r border-panel-border mr-1">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <img
          src="/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png"
          alt="DesignForge"
          className="w-7 h-7 rounded-md object-cover shadow-[0_0_10px_rgba(56,189,248,0.35)]"
        />
      </div>

      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">Video</span>

      {editingName ? (
        <input autoFocus className="bg-panel-light border border-panel-border rounded-md px-2 py-0.5 text-sm text-theme-primary focus:outline-none focus:border-sky-500/50 w-40"
          value={project.title} onChange={(e) => updateProject({ title: e.target.value })} onBlur={() => setEditingName(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} />
      ) : (
        <button onClick={() => setEditingName(true)} className="text-sm text-theme-secondary hover:text-theme-primary px-2 py-1 rounded hover:bg-panel-hover transition-colors truncate max-w-[200px]">
          {project.title}
        </button>
      )}

      {/* Aspect ratio */}
      <div className="relative">
        <button onClick={() => setShowRatio(!showRatio)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-theme-muted hover:text-theme-primary hover:bg-panel-hover border border-panel-border transition-colors">
          {RATIOS.find(r => r.id === project.aspectRatio)?.icon ?? <Monitor className="w-3.5 h-3.5" />}
          <span className="font-medium">{project.aspectRatio}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        {showRatio && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRatio(false)} />
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-canvas-surface border border-panel-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              {RATIOS.map(r => (
                <button key={r.id} onClick={() => { updateProject({ aspectRatio: r.id }); setShowRatio(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${project.aspectRatio === r.id ? 'bg-sky-500/10 text-sky-300' : 'text-theme-secondary hover:text-theme-primary hover:bg-panel-hover'}`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${project.aspectRatio === r.id ? 'bg-sky-500/20 text-sky-400' : 'bg-panel-hover text-theme-dim'}`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{r.label}</div>
                    <div className="text-[10px] text-theme-dim">{r.id} · {r.dims}</div>
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

      <div className="w-px h-6 bg-panel-border mx-1" />

      {/* Undo/Redo */}
      <button onClick={undo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-30">
        <Undo2 className="w-4 h-4" />
      </button>
      <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-30">
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors"
        title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Auto-save indicator */}
      {autoSaveLabel && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-emerald-400/80 transition-opacity">
          <Check className="w-3 h-3" /> {autoSaveLabel}
        </div>
      )}
      <button onClick={startExport} disabled={isExporting}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 hover:shadow-[0_4px_20px_rgba(56,189,248,0.3)] transition-all disabled:opacity-50">
        <Download className="w-3.5 h-3.5" />
        {isExporting ? `${exportProgress}%` : 'Download'}
      </button>
    </div>
  );
}
