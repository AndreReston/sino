import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, Undo2, Redo2, Download, Monitor, ChevronDown, Smartphone, Square, MonitorPlay, Check, Sun, Moon, HelpCircle, Save, FileJson, AlertTriangle } from 'lucide-react';
import { useVideoStore, AspectRatio } from '../../store/videoStore';
import { useThemeStore } from '../../store/themeStore';
import { useToastStore } from '../../store/toastStore';

const RATIOS: { id: AspectRatio; label: string; dims: string; icon: ReactNode }[] = [
  { id: '16:9', label: 'Landscape', dims: '1920×1080', icon: <MonitorPlay className="w-4 h-4" /> },
  { id: '9:16', label: 'Portrait', dims: '1080×1920', icon: <Smartphone className="w-4 h-4" /> },
  { id: '1:1', label: 'Square', dims: '1080×1080', icon: <Square className="w-3.5 h-3.5" /> },
];

const EXPORT_PRESETS: Array<{ id: string; label: string; fps: number; width: number; height: number; quality: number; description: string }> = [
  { id: 'draft', label: 'Draft 720p', fps: 24, width: 1280, height: 720, quality: 0.72, description: 'Fast preview export' },
  { id: 'hd', label: 'HD 1080p', fps: 30, width: 1920, height: 1080, quality: 0.86, description: 'Balanced quality' },
  { id: 'source', label: 'Source aspect', fps: 30, width: 1920, height: 1080, quality: 0.92, description: 'High quality source-sized export' },
];

interface Props {
  onBack?: () => void;
  onSave: () => void | Promise<void>;
  onOpenShortcuts: () => void;
  hasUnsavedChanges: boolean;
}

export default function VideoTopBar({ onBack, onSave, onOpenShortcuts, hasUnsavedChanges }: Props) {
  const { project, updateProject, undo, redo, historyIndex, history, startExport, isExporting, exportProgress, saveToLocalStorage, exportProject, loadProject } = useVideoStore();
  const { mode, toggle } = useThemeStore();
  const { addToast } = useToastStore();
  const [editingName, setEditingName] = useState(false);
  const [showRatio, setShowRatio] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saveState, setSaveState] = useState<'Saved' | 'Unsaved' | 'Saving' | 'Failed'>('Saved');
  const [selectedPreset, setSelectedPreset] = useState(EXPORT_PRESETS[1]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setSaveState(hasUnsavedChanges ? 'Unsaved' : 'Saved');
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!project) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => setSaveState(hasUnsavedChanges ? 'Unsaved' : 'Saved'), 1800);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [project?.clips, project?.textOverlays, project?.stickerOverlays, project?.subtitles, project?.audioTracks, project?.backgroundMusic, project?.title, project?.aspectRatio, hasUnsavedChanges]);

  if (!project) return null;

  const handleManualSave = async () => {
    setSaveState('Saving');
    try {
      await onSave();
      saveToLocalStorage();
      setSaveState('Saved');
      addToast('Project saved locally.', 'success');
    } catch {
      try {
        saveToLocalStorage();
        setSaveState('Saved');
        addToast('Cloud save unavailable; local fallback saved.', 'success');
      } catch {
        setSaveState('Failed');
        addToast('Save failed. Export a project file to keep a backup.', 'error');
      }
    }
  };

  const handleExportProjectFile = () => {
    const exported = exportProject();
    if (!exported) return;
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exported.title || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Project file exported.', 'success');
  };

  const handleDuplicateProject = () => {
    const exported = exportProject();
    if (!exported) return;
    const duplicate: typeof exported = {
      ...exported,
      id: `proj_${Date.now()}`,
      title: `${exported.title || 'Untitled Video'} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    loadProject(duplicate);
    addToast('Project duplicated.', 'success');
  };

  const handleExport = async () => {
    try {
      await startExport({
        fps: selectedPreset.fps,
        width: selectedPreset.width,
        height: selectedPreset.height,
        quality: selectedPreset.quality,
      });
      addToast('Video exported successfully!', 'success');
      setShowExportModal(false);
    } catch {
      addToast('Export failed. Please try again.', 'error');
    }
  };

  const saveColor = saveState === 'Unsaved'
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    : saveState === 'Failed'
      ? 'bg-red-500/15 text-red-400 border-red-500/25'
      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';

  return (
    <div className="flex items-center h-12 bg-canvas-surface border-b border-panel-border px-3 gap-2 z-50 shrink-0">
      <div className="flex items-center gap-2 pr-3 border-r border-panel-border mr-1">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors" aria-label="Back to dashboard">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <img
          src="/Untitled_design_(1).png"
          alt="DreFlow"
          className="w-7 h-7 rounded-md object-cover shadow-[0_0_10px_rgba(56,189,248,0.35)]"
        />
      </div>

      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">Video</span>

      {editingName ? (
        <input autoFocus className="bg-panel-light border border-panel-border rounded-md px-2 py-0.5 text-sm text-theme-primary focus:outline-none focus:border-sky-500/50 w-40"
          value={project.title} maxLength={80} onChange={(e) => updateProject({ title: e.target.value })} onBlur={() => setEditingName(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} aria-label="Project name" />
      ) : (
        <button onClick={() => setEditingName(true)} className="text-sm text-theme-secondary hover:text-theme-primary px-2 py-1 rounded hover:bg-panel-hover transition-colors truncate max-w-[200px]" title={project.title}>
          {project.title}
        </button>
      )}

      <div className="relative">
        <button onClick={() => setShowRatio(!showRatio)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-theme-muted hover:text-theme-primary hover:bg-panel-hover border border-panel-border transition-colors"
          aria-expanded={showRatio}
          aria-haspopup="menu"
        >
          {RATIOS.find(r => r.id === project.aspectRatio)?.icon ?? <Monitor className="w-3.5 h-3.5" />}
          <span className="font-medium">{project.aspectRatio}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        {showRatio && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRatio(false)} />
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-canvas-surface border border-panel-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
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
                  {project.aspectRatio === r.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              ))}
              <div className="mx-2 my-1 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[10px] text-amber-300">
                <div className="flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />Changing aspect ratio may move or crop overlays, text, stickers, and photos.</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-panel-border mx-1" />

      <button onClick={() => { undo(); addToast('Undone', 'info'); }} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-30" title="Undo (Ctrl+Z)" aria-label="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </button>
      <button onClick={() => { redo(); addToast('Redone', 'info'); }} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-30" title="Redo (Ctrl+Shift+Z)" aria-label="Redo (Ctrl+Shift+Z)">
        <Redo2 className="w-4 h-4" />
      </button>

      <button onClick={handleManualSave} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-panel-border text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors" title="Save project now">
        <Save className="w-3.5 h-3.5" /> Save
      </button>

      <div className="relative">
        <button onClick={() => setShowProjectMenu(v => !v)} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors" aria-label="Project menu" title="Project menu">
          <FileJson className="w-4 h-4" />
        </button>
        {showProjectMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-surface border border-panel-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              <button onClick={handleExportProjectFile} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover">
                <FileJson className="w-3.5 h-3.5" /> Export project file
              </button>
              <button onClick={handleDuplicateProject} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover">
                <Download className="w-3.5 h-3.5" /> Duplicate project
              </button>
              <button onClick={() => { setShowProjectMenu(false); setShowExportModal(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover">
                <Download className="w-3.5 h-3.5" /> Export settings
              </button>
              <button onClick={onOpenShortcuts} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover">
                <HelpCircle className="w-3.5 h-3.5" /> Keyboard shortcuts
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1" />

      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
        title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-opacity ${saveColor}`}>
        <Check className="w-3 h-3" /> {saveState}
      </div>

      {isExporting && (
        <div className="w-24 h-1.5 bg-panel-hover rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${exportProgress}%` }} />
        </div>
      )}
      <button
        onClick={() => setShowExportModal(true)}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 hover:shadow-[0_4px_20px_rgba(56,189,248,0.3)] transition-all disabled:opacity-50">
        <Download className="w-3.5 h-3.5" />
        {isExporting ? `Exporting ${exportProgress}%` : 'Download'}
      </button>

      {showExportModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-canvas-surface/40 p-4">
          <div role="dialog" aria-modal="true" aria-label="Export settings" className="w-full max-w-md rounded-2xl bg-surface border border-panel-border shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
              <h2 className="text-sm font-semibold text-theme-primary">Export settings</h2>
              <button onClick={() => setShowExportModal(false)} className="text-theme-muted hover:text-theme-primary text-xs">Close</button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs text-theme-muted">Preset</label>
              <div className="space-y-1.5">
                {EXPORT_PRESETS.map(preset => (
                  <button key={preset.id} onClick={() => setSelectedPreset(preset)} className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${selectedPreset.id === preset.id ? 'border-sky-500/50 bg-sky-500/10' : 'border-panel-border bg-panel-light hover:border-sky-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-theme-primary">{preset.label}</span>
                      <span className="text-[10px] text-theme-muted">{preset.width}×{preset.height}</span>
                    </div>
                    <div className="text-[10px] text-theme-muted mt-0.5">{preset.description} · WebM · {preset.fps} fps · quality {Math.round(preset.quality * 100)}%</div>
                  </button>
                ))}
              </div>
              {isExporting && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-theme-muted"><span>Exporting</span><span>{exportProgress}%</span></div>
                  <div className="h-2 bg-panel-hover rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${exportProgress}%` }} /></div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowExportModal(false)} className="px-3 py-1.5 rounded-lg bg-panel-hover text-theme-secondary text-xs hover:bg-panel-hover">Cancel</button>
                <button onClick={handleExport} disabled={isExporting} className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 disabled:opacity-50">Export</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
