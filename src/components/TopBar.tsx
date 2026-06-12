import { useState } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Save,
  ChevronDown, Monitor, Sun, Moon,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useThemeStore } from '../store/themeStore';

const PRESETS = [
  { name: 'Instagram Post', w: 1080, h: 1080 },
  { name: 'Instagram Story', w: 1080, h: 1920 },
  { name: 'Twitter Post', w: 1200, h: 675 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'Presentation', w: 1920, h: 1080 },
  { name: 'A4 Document', w: 2480, h: 3508 },
  { name: 'Business Card', w: 1050, h: 600 },
];

interface TopBarProps {
  onSave?: () => void;
  onBack?: () => void;
}

export default function TopBar({ onSave, onBack }: TopBarProps) {
  const { mode, toggle } = useThemeStore();
  const {
    canvasName, setCanvasName,
    zoom, setZoom,
    undo, redo,
    historyIndex, history,
    fabricCanvas,
    setCanvasSize, canvasWidth, canvasHeight,
    selectedPageIds,
    exportPagesAsZip,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const zoomPct = Math.round(zoom * 100);
  const selectedCount = selectedPageIds.length;

  const applyPreset = (w: number, h: number) => {
    setCanvasSize(w, h);
    setShowPresets(false);
    if (fabricCanvas) {
      fabricCanvas.setWidth(w);
      fabricCanvas.setHeight(h);
      fabricCanvas.renderAll();
    }
  };

  const handleExport = async (
    target: 'current' | 'selected' | 'all',
    format: 'png' | 'jpg' | 'svg'
  ) => {
    setShowExport(false);

    if (target === 'current') {
      if (!fabricCanvas) return;
      if (format === 'svg') {
        const svg = fabricCanvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${canvasName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const dataURL = fabricCanvas.toDataURL({
        format: format === 'jpg' ? 'jpeg' : 'png',
        quality: 0.95,
        multiplier: 1,
      });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${canvasName}.${format}`;
      a.click();
      return;
    }

    if (target === 'selected' && selectedCount === 0) {
      // S18: Log validation error instead of blocking user with alert()
      console.warn('Cannot export selected pages: no pages selected');
      return;
    }

    const zipFormat = format as 'png' | 'jpg';
    try {
      await exportPagesAsZip(target === 'selected' ? selectedPageIds : undefined, zipFormat);
      // S20: Provide success feedback to user after export completes
      console.log(`Export completed: ${target} pages as ${zipFormat}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex items-center h-12 bg-panel border-b border-panel-border px-3 gap-2 z-50 shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-panel-border mr-1">
        <img
          src="/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png"
          alt="DesignForge"
          className="w-7 h-7 rounded-md object-cover shadow-[0_0_10px_rgba(249,115,22,0.35)]"
        />
        <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">DesignForge</span>
      </div>

      {/* Canvas Name */}
      <div className="flex items-center gap-1 mr-2">
        {editingName ? (
          <input
            autoFocus
            className="input-field text-sm w-44 h-7 py-0"
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm text-theme-secondary hover:text-theme-primary px-2 py-1 rounded hover:bg-panel-hover transition-colors"
          >
            {canvasName}
          </button>
        )}
      </div>

      {/* Canvas Presets */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{canvasWidth}×{canvasHeight}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showPresets && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-panel border border-panel-border rounded-lg shadow-xl z-50 py-1 animate-slide-in">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.w, p.h)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
              >
                <span>{p.name}</span>
                <span className="text-theme-dim text-xs">{p.w}×{p.h}</span>
              </button>
            ))}
            {/* U11: Add custom size option */}
            <div className="border-t border-panel-border my-1" />
            <button
              onClick={() => {
                const w = window.prompt('Width (px):', String(canvasWidth));
                const h = window.prompt('Height (px):', String(canvasHeight));
                if (w && h && /^\d+$/.test(w) && /^\d+$/.test(h)) {
                  applyPreset(parseInt(w), parseInt(h));
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
            >
              <span>📐 Custom Size</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-panel-border mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          title={`Undo (${typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? 'Cmd' : 'Ctrl'}+Z)`}
          className="tool-btn w-8 h-8 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title={`Redo (${typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? 'Cmd' : 'Ctrl'}+Y)`}
          className="tool-btn w-8 h-8 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-panel-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          disabled={zoom <= 0.1}
          className="tool-btn w-7 h-7 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom Out (Min: 10%)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-theme-muted w-10 text-center tabular-nums">{zoomPct}%</span>
        <button
          onClick={() => setZoom(Math.min(5, zoom + 0.1))}
          disabled={zoom >= 5}
          className="tool-btn w-7 h-7 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom In (Max: 500%)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs text-theme-dim hover:text-theme-secondary px-1.5 py-1 rounded hover:bg-panel-hover transition-colors"
        >
          1:1
        </button>
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors"
        title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {(() => {
          const { isInstallable, isInstalled, installApp } = usePWAInstall();
          if (isInstalled) return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-theme-dim bg-panel-light border border-panel-border">
              <Monitor className="w-3 h-3" /> App
            </span>
          );
          if (isInstallable) return (
            <button
              type="button"
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          );
          return null;
        })()}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors border border-panel-border cursor-pointer"
          >
            Back to home
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!onSave}
          title={!onSave ? 'Save not available in this context' : 'Save project'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors border border-panel-border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Quick Download — exports current page as PNG immediately */}
        <button
          type="button"
          onClick={() => {
            if (!fabricCanvas) return;
            const dataURL = fabricCanvas.toDataURL({ format: 'png', quality: 0.95, multiplier: 1 });
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `${canvasName}.png`;
            a.click();
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-semibold hover:bg-emerald-400 hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-theme-secondary hover:text-theme-primary hover:bg-panel-hover border border-panel-border transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            More formats
            <ChevronDown className="w-3 h-3" />
          </button>
          {showExport && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-panel border border-panel-border rounded-lg shadow-xl z-50 py-1 animate-slide-in">
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-theme-dim">Current page</div>
              {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                <button
                  key={`current-${fmt}`}
                  onClick={() => handleExport('current', fmt)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export current as {fmt.toUpperCase()}
                </button>
              ))}

              <div className="border-t border-panel-border my-1" />
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-theme-dim">Selected pages</div>
              <button
                onClick={() => handleExport('selected', 'png')}
                disabled={selectedCount === 0}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected as ZIP (PNG)
              </button>
              <button
                onClick={() => handleExport('selected', 'jpg')}
                disabled={selectedCount === 0}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected as ZIP (JPG)
              </button>
              {selectedCount > 0 && (
                <div className="px-3 py-2 text-[11px] text-theme-muted">
                  {selectedCount} page{selectedCount > 1 ? 's' : ''} selected
                </div>
              )}

              <div className="border-t border-panel-border my-1" />
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-theme-dim">All pages</div>
              <button
                onClick={() => handleExport('all', 'png')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export all as ZIP (PNG)
              </button>
              <button
                onClick={() => handleExport('all', 'jpg')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export all as ZIP (JPG)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showPresets || showExport) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowPresets(false); setShowExport(false); }}
        />
      )}
    </div>
  );
}
