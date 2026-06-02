import React, { useState } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Save,
  ChevronDown, Layers, Eye, Monitor, Smartphone, Tablet,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const PRESETS = [
  { name: 'Instagram Post', w: 1080, h: 1080 },
  { name: 'Instagram Story', w: 1080, h: 1920 },
  { name: 'Twitter Post', w: 1200, h: 675 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'Presentation', w: 1920, h: 1080 },
  { name: 'A4 Document', w: 2480, h: 3508 },
  { name: 'Business Card', w: 1050, h: 600 },
];

export default function TopBar() {
  const {
    canvasName, setCanvasName,
    zoom, setZoom,
    undo, redo,
    historyIndex, history,
    fabricCanvas,
    setCanvasSize, canvasWidth, canvasHeight,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const zoomPct = Math.round(zoom * 100);

  const applyPreset = (w: number, h: number) => {
    setCanvasSize(w, h);
    setShowPresets(false);
    if (fabricCanvas) {
      fabricCanvas.setWidth(w);
      fabricCanvas.setHeight(h);
      fabricCanvas.renderAll();
    }
  };

  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    if (!fabricCanvas) return;
    setShowExport(false);
    if (format === 'svg') {
      const svg = fabricCanvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${canvasName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const dataURL = fabricCanvas.toDataURL({
        format: format === 'jpg' ? 'jpeg' : 'png',
        quality: 0.95,
        multiplier: 1,
      });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${canvasName}.${format}`;
      a.click();
    }
  };

  return (
    <div className="flex items-center h-12 bg-panel border-b border-panel-border px-3 gap-2 z-50 shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-panel-border mr-1">
        <div className="w-7 h-7 rounded-md bg-neon-green flex items-center justify-center">
          <Layers className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-zinc-100 tracking-tight">DesignForge</span>
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
            className="text-sm text-zinc-300 hover:text-zinc-100 px-2 py-1 rounded hover:bg-panel-hover transition-colors"
          >
            {canvasName}
          </button>
        )}
      </div>

      {/* Canvas Presets */}
      <div className="relative">
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

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-panel-hover transition-colors border border-panel-border"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 neon-btn text-sm px-3 py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className="w-3 h-3" />
          </button>
          {showExport && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-panel border border-panel-border rounded-lg shadow-xl z-50 py-1 animate-slide-in">
              {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-panel-hover transition-colors uppercase"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export as {fmt.toUpperCase()}
                </button>
              ))}
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
