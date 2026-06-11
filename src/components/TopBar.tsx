import { useState } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Save,
  ChevronDown, Monitor, Menu, SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePWAInstall } from '../hooks/usePWAInstall';

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
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

export default function TopBar({ onSave, onBack, onToggleLeft, onToggleRight }: TopBarProps) {
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
      alert('Select one or more pages before exporting selected pages.');
      return;
    }

    const zipFormat = format as 'png' | 'jpg';
    await exportPagesAsZip(target === 'selected' ? selectedPageIds : undefined, zipFormat);
  };

  return (
    <div className="flex items-center h-12 bg-panel border-b border-panel-border px-3 gap-2 z-50 shrink-0 select-none">
      {/* Mobile: left panel toggle */}
      {onToggleLeft && (
        <button onClick={onToggleLeft} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors">
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-panel-border mr-1">
        <img
          src="/Gemini_Generated_Image_9jhwhi9jhwhi9jhw_(1).png"
          alt="DesignForge"
          className="w-7 h-7 rounded-md object-cover shadow-[0_0_10px_rgba(249,115,22,0.35)]"
        />
        <span className="hidden sm:block text-sm font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">DesignForge</span>
      </div>

      {/* Canvas Name */}
      <div className="flex items-center gap-1 mr-2">
        {editingName ? (
          <input
            autoFocus
            className="input-field text-sm w-32 sm:w-44 h-7 py-0"
            value={canvasName}
            onChange={(e) => setCanvasName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm text-zinc-300 hover:text-zinc-100 px-2 py-1 rounded hover:bg-panel-hover transition-colors max-w-[120px] sm:max-w-none truncate"
          >
            {canvasName}
          </button>
        )}
      </div>

      {/* Canvas Presets */}
      <div className="hidden sm:block relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
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
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
              >
                <span>{p.name}</span>
                <span className="text-zinc-500 text-xs">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-panel-border mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
          className="tool-btn w-8 h-8 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
          className="tool-btn w-8 h-8 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-panel-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="tool-btn w-7 h-7"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-zinc-400 w-10 text-center tabular-nums">{zoomPct}%</span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="tool-btn w-7 h-7"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded hover:bg-panel-hover transition-colors"
        >
          1:1
        </button>
      </div>

      <div className="flex-1" />

      {/* Mobile: Right panel toggle */}
      {onToggleRight && (
        <button onClick={onToggleRight} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {(() => {
          const { isInstallable, isInstalled, installApp } = usePWAInstall();
          if (isInstalled) return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-zinc-500 bg-panel-light border border-panel-border">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors border border-panel-border cursor-pointer"
          >
            Back to home
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors border border-panel-border cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover border border-panel-border transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            More formats
            <ChevronDown className="w-3 h-3" />
          </button>
          {showExport && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-panel border border-panel-border rounded-lg shadow-xl z-50 py-1 animate-slide-in">
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Current page</div>
              {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                <button
                  key={`current-${fmt}`}
                  onClick={() => handleExport('current', fmt)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export current as {fmt.toUpperCase()}
                </button>
              ))}

              <div className="border-t border-panel-border my-1" />
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Selected pages</div>
              <button
                onClick={() => handleExport('selected', 'png')}
                disabled={selectedCount === 0}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected as ZIP (PNG)
              </button>
              <button
                onClick={() => handleExport('selected', 'jpg')}
                disabled={selectedCount === 0}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected as ZIP (JPG)
              </button>
              {selectedCount > 0 && (
                <div className="px-3 py-2 text-[11px] text-zinc-400">
                  {selectedCount} page{selectedCount > 1 ? 's' : ''} selected
                </div>
              )}

              <div className="border-t border-panel-border my-1" />
              <div className="px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">All pages</div>
              <button
                onClick={() => handleExport('all', 'png')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export all as ZIP (PNG)
              </button>
              <button
                onClick={() => handleExport('all', 'jpg')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
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
