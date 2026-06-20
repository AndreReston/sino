import React, { useState, useEffect } from 'react';
import {
  Shapes, Type, Upload, LayoutTemplate,
  Square, Circle, Triangle, Minus, Star,
  MousePointer2, PenLine, Layers, Sparkles, Sliders, Eraser,
  Undo2, Redo2,
  Download, Monitor, ChevronDown,
  Film,
} from 'lucide-react';
import { useStore, SidebarTab, ToolMode } from '../store/useStore';
import { fabric } from 'fabric';
import { supabase } from '../lib/supabase';
import { getUserMedia, saveUserMedia, UserMedia } from '../lib/userStorage';

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────

const SHAPE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#18181b', '#e4e4e7'];

const TEXT_PRESETS = [
  { label: 'Heading', size: 56, weight: '700', sample: 'Heading' },
  { label: 'Subheading', size: 36, weight: '600', sample: 'Subheading' },
  { label: 'Body', size: 18, weight: '400', sample: 'Body text' },
  { label: 'Caption', size: 13, weight: '400', sample: 'Caption' },
];

const FONT_FAMILIES = [
  'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica',
  'Courier New', 'Trebuchet MS', 'Verdana', 'Impact',
];

const STOCK_IMAGES = [
  { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300', label: 'Team' },
  { url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=300', label: 'Office' },
  { url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=300', label: 'Meeting' },
  { url: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=300', label: 'Nature' },
  { url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=300', label: 'Work' },
  { url: 'https://images.pexels.com/photos/7376/startup-photos.jpg?w=300', label: 'Startup' },
  { url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=300', label: 'People' },
  { url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=300', label: 'Tech' },
];

const PRESETS = [
  { name: 'Instagram Post', w: 1080, h: 1080 },
  { name: 'Instagram Story', w: 1080, h: 1920 },
  { name: 'Twitter Post', w: 1200, h: 675 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'Presentation', w: 1920, h: 1080 },
  { name: 'A4 Document', w: 2480, h: 3508 },
  { name: 'Business Card', w: 1050, h: 600 },
];

type TemplateItem = {
  id: string;
  title: string;
  canvas_data: any;
  created_at: string;
  updated_at: string;
};

// ─────────────────────────────────────────────
// Sidebar Tab definitions
// ─────────────────────────────────────────────

const TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { id: 'shapes', icon: <Shapes className="w-5 h-5" />, label: 'Shapes' },
  { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { id: 'uploads', icon: <Upload className="w-5 h-5" />, label: 'Uploads' },
  { id: 'templates', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Templates' },
  { id: 'layers', icon: <Layers className="w-5 h-5" />, label: 'Layers' },
  { id: 'magicTools', icon: <Sparkles className="w-5 h-5" />, label: 'Magic' },
  { id: 'adjustments', icon: <Sliders className="w-5 h-5" />, label: 'Adjust' },
];

// ─────────────────────────────────────────────
// Helper: star polygon points
// ─────────────────────────────────────────────

function starPoints(cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  const pts: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < 2 * spikes; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function LeftSidebar() {
  const {
    sidebarTab, setSidebarTab,
    fabricCanvas,
    toolMode, setToolMode,
    undo, redo, historyIndex, history,
    canvasName, setCanvasName,
    canvasWidth, canvasHeight,
    setCanvasSize,
    selectedPageIds,
    exportPagesAsZip,
    projectMode,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');

  // ── Canvas helpers ──────────────────────────

  const addShape = (type: string, color = '#3f3f46') => {
    if (!fabricCanvas) return;
    const cx = fabricCanvas.getWidth() / 2;
    const cy = fabricCanvas.getHeight() / 2;
    let obj: fabric.Object;

    if (type === 'rect') {
      obj = new fabric.Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill: color, rx: 6, ry: 6 });
    } else if (type === 'circle') {
      obj = new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: color });
    } else if (type === 'triangle') {
      obj = new fabric.Triangle({ left: cx - 50, top: cy - 50, width: 100, height: 100, fill: color });
    } else if (type === 'line') {
      obj = new fabric.Line([cx - 60, cy, cx + 60, cy], { stroke: color, strokeWidth: 3, strokeLineCap: 'round' });
    } else if (type === 'star') {
      const pts = starPoints(cx, cy, 5, 50, 22);
      obj = new fabric.Polygon(pts, { fill: color });
    } else {
      obj = new fabric.Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill: color });
    }

    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
    setToolMode('select');
  };

  const addText = (size: number, weight: string, text: string) => {
    if (!fabricCanvas) return;
    const tb = new fabric.Textbox(text, {
      left: fabricCanvas.getWidth() / 2 - 200,
      top: fabricCanvas.getHeight() / 2 - size / 2,
      width: 400,
      fontSize: size,
      fontWeight: weight,
      fontFamily: selectedFont + ', sans-serif',
      fill: '#18181b',
      editable: true,
    });
    fabricCanvas.add(tb);
    fabricCanvas.setActiveObject(tb);
    fabricCanvas.renderAll();
    setToolMode('select');
  };

  const addTextBox = () => {
    if (!fabricCanvas) return;
    const box = new fabric.IText('Edit text', {
      left: fabricCanvas.getWidth() / 2 - 160,
      top: fabricCanvas.getHeight() / 2 - 40,
      width: 320,
      fontSize: 32,
      fontFamily: selectedFont + ', sans-serif',
      fontWeight: '400',
      fontStyle: 'normal',
      fill: '#18181b',
      editable: true,
      cursorWidth: 2,
      cursorColor: '#22c55e',
    });
    fabricCanvas.add(box);
    fabricCanvas.setActiveObject(box);
    fabricCanvas.renderAll();
    setToolMode('select');
  };

  const addImage = (url: string) => {
    if (!fabricCanvas) return;
    // Basic URL validation to prevent XSS
    try {
      const parsed = new URL(url, window.location.origin);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      const isData = parsed.protocol === 'data:';
      const isBlob = parsed.protocol === 'blob:';
      if (!isHttp && !isData && !isBlob) {
        console.warn('Blocked non-HTTP URL in addImage:', parsed.protocol);
        return;
      }
    } catch {
      console.warn('Invalid URL passed to addImage:', url);
      return;
    }
    fabric.Image.fromURL(url, (img) => {
      const maxW = fabricCanvas.getWidth() * 0.5;
      img.scale(Math.min(maxW / (img.width || 1), 1));
      img.set({ left: 80, top: 80 });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
    setToolMode('select');
  };

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
        a.href = url; a.download = 'design.svg'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const dataURL = fabricCanvas.toDataURL({ format: format === 'jpg' ? 'jpeg' : 'png', quality: 0.95, multiplier: 1 });
        const a = document.createElement('a');
        a.href = dataURL; a.download = `design.${format}`; a.click();
      }
      return;
    }

    if (target === 'selected' && selectedPageIds.length === 0) {
      // S18: Log validation error instead of blocking user with alert()
      console.warn('Cannot export selected pages: no pages selected');
      return;
    }

    if (target === 'selected') {
      await exportPagesAsZip(selectedPageIds, (format === 'svg' ? 'png' : format) as 'png' | 'jpg');
    } else {
      await exportPagesAsZip(undefined, (format === 'svg' ? 'png' : format) as 'png' | 'jpg');
    }
  };

  // ── Render ──────────────────────────────────

  return (
    <aside className="flex h-full bg-panel border-r border-panel-border shrink-0" style={{ width: 280 }}>
      {/* Icon rail */}
      <div className="flex flex-col items-center w-14 border-r border-panel-border py-3 gap-1 shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mb-3">
          <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>

        {TABS.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setSidebarTab(t.id)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all text-xs gap-0.5
              ${sidebarTab === t.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-theme-dim hover:text-theme-secondary hover:bg-panel-hover'}`}
          >
            {t.icon}
          </button>
        ))}

        <div className="flex-1" />

        {/* Drawing tools */}
        <div className="w-8 h-px bg-panel-border my-1" />
        {([
          { id: 'select', icon: <MousePointer2 className="w-4 h-4" />, label: 'Select' },
          { id: 'pen', icon: <PenLine className="w-4 h-4" />, label: 'Freehand' },
        ] as { id: ToolMode; icon: React.ReactNode; label: string }[]).map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setToolMode(t.id)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all
              ${toolMode === t.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-theme-dim hover:text-theme-secondary hover:bg-panel-hover'}`}
          >
            {t.icon}
          </button>
        ))}

        {/* Undo/Redo */}
        <div className="w-8 h-px bg-panel-border my-1" />
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-theme-dim hover:text-theme-secondary hover:bg-panel-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-theme-dim hover:text-theme-secondary hover:bg-panel-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mode badge */}
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              projectMode === 'video'
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
            }`}>
              {projectMode === 'video' ? 'Video' : 'Photo'}
            </span>
            {editingName ? (
              <input
                autoFocus
                className="input-field text-sm w-36 h-7 py-0"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm font-semibold text-theme-secondary hover:text-theme-primary truncate transition-colors"
              >
                {canvasName}
              </button>
            )}
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
                <div className="absolute top-full left-0 mt-1 w-60 bg-panel border border-panel-border rounded-xl shadow-2xl z-50 py-2 animate-slide-in overflow-hidden">
                  <div className="px-3 pb-1 text-[10px] uppercase tracking-widest text-theme-dim">Current</div>
                  {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                    <button key={`current-${fmt}`} onClick={() => handleExport('current', fmt)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors">
                      <Download className="w-3 h-3 shrink-0" />
                      <span className="truncate">Export {fmt.toUpperCase()}</span>
                    </button>
                  ))}

                  <div className="border-t border-panel-border my-1 mx-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-theme-dim">Selected</div>
                  <button
                    onClick={() => handleExport('selected', 'png')}
                    disabled={selectedPageIds.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleExport('selected', 'jpg')}
                    disabled={selectedPageIds.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (JPG)</span>
                  </button>
                  {selectedPageIds.length > 0 && (
                    <div className="px-3 py-1 text-[10px] text-theme-muted">
                      {selectedPageIds.length} selected
                    </div>
                  )}

                  <div className="border-t border-panel-border my-1 mx-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-theme-dim">All pages</div>
                  <button
                    onClick={() => handleExport('all', 'png')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleExport('all', 'jpg')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (JPG)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas size selector */}
        <div className="px-4 py-2 border-b border-panel-border shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-panel-light border border-panel-border hover:border-panel-hover transition-colors text-xs text-theme-muted"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-theme-secondary">{canvasWidth} × {canvasHeight}px</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPresets && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-panel border border-panel-border rounded-xl shadow-2xl z-50 py-1 animate-slide-in">
                  {PRESETS.map((p) => (
                    <button key={p.name} onClick={() => applyPreset(p.w, p.h)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors">
                      <span>{p.name}</span>
                      <span className="text-theme-muted">{p.w}×{p.h}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab label */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-widest">
            {TABS.find((t) => t.id === sidebarTab)?.label}
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
          {sidebarTab === 'shapes' && <ShapesPanel addShape={addShape} />}
          {sidebarTab === 'text' && (
            <TextPanel
              addText={addText}
              addTextBox={addTextBox}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
            />
          )}
          {sidebarTab === 'uploads' && <UploadsPanel addImage={addImage} />}
          {sidebarTab === 'templates' && <TemplatesPanel />}
          {sidebarTab === 'layers' && <LayersPanel />}
          {sidebarTab === 'magicTools' && <MagicToolsPanel />}
          {sidebarTab === 'adjustments' && <AdjustmentsPanel />}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Sub-panels
// ─────────────────────────────────────────────

function ShapesPanel({ addShape }: { addShape: (type: string, color?: string) => void }) {
  const shapes = [
    { type: 'rect', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
    { type: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5" /> },
    { type: 'triangle', label: 'Triangle', icon: <Triangle className="w-5 h-5" /> },
    { type: 'line', label: 'Line', icon: <Minus className="w-5 h-5" /> },
    { type: 'star', label: 'Star', icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-theme-muted mb-2">Basic Shapes</p>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((s) => (
            <button
              key={s.type}
              onClick={() => addShape(s.type, '#e4e4e7')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-panel-light border border-panel-border hover:border-panel-hover hover:bg-panel-hover transition-all text-theme-muted hover:text-theme-primary group"
            >
              <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-theme-muted mb-2">Quick Colors</p>
        <div className="grid grid-cols-4 gap-2">
          {SHAPE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => addShape('rect', c)}
              className="aspect-square rounded-lg border-2 border-transparent hover:border-white/40 hover:scale-105 transition-all shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-theme-muted mb-2">Drawing Mode</p>
        <DrawingModeButton />
      </div>
    </div>
  );
}

const BRUSH_PALETTE = [
  '#18181b', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
];

const BRUSH_SIZE_PRESETS = [2, 5, 10, 20, 40];

function DrawingModeButton() {
  const { toolMode, setToolMode, fabricCanvas, brushColor, brushSize, setBrushColor, setBrushSize } = useStore();
  const isDrawing = toolMode === 'pen';

  const toggle = () => {
    if (isDrawing) {
      setToolMode('select');
    } else {
      setToolMode('pen');
      if (fabricCanvas) {
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush.width = brushSize;
        fabricCanvas.freeDrawingBrush.color = brushColor;
      }
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={toggle}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium
          ${isDrawing
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-panel-light border-panel-border text-theme-muted hover:text-theme-primary hover:border-zinc-500'}`}
      >
        <PenLine className="w-4 h-4" />
        {isDrawing ? 'Drawing Mode Active — Click to Exit' : 'Enable Freehand Drawing'}
        {isDrawing && (
          <div
            className="ml-auto w-4 h-4 rounded-full border-2 border-white/20 shrink-0"
            style={{ backgroundColor: brushColor }}
          />
        )}
      </button>

      {isDrawing && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-3">
          {/* Color picker */}
          <div>
            <p className="text-[10px] text-theme-muted uppercase tracking-wider mb-2">Brush Color</p>
            <div className="flex flex-wrap gap-1.5">
              {BRUSH_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setBrushColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${brushColor === c ? 'border-emerald-400 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #52525b' : undefined }}
                  title={c}
                />
              ))}
              <label className="w-6 h-6 rounded-full border-2 border-dashed border-panel-border hover:border-emerald-400/50 flex items-center justify-center cursor-pointer transition-colors" title="Custom color">
                <span className="text-[9px] text-theme-dim">+</span>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </div>

          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-theme-muted uppercase tracking-wider">Brush Size</p>
              <span className="text-[10px] text-emerald-400 font-mono">{brushSize}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={80}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="flex items-center justify-between mt-2">
              {BRUSH_SIZE_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-medium transition-all ${brushSize === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-panel-hover text-theme-dim hover:text-theme-secondary'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 pt-1">
            <div
              className="rounded-full"
              style={{ width: Math.min(brushSize, 40), height: Math.min(brushSize, 40), backgroundColor: brushColor, boxShadow: brushColor === '#ffffff' ? 'inset 0 0 0 1px #52525b' : undefined }}
            />
            <span className="text-[10px] text-theme-dim">Brush preview</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TextPanel({
  addText,
  addTextBox,
  selectedFont,
  setSelectedFont,
}: {
  addText: (size: number, weight: string, text: string) => void;
  addTextBox: () => void;
  selectedFont: string;
  setSelectedFont: (f: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-theme-muted mb-2">Rich Text</p>
          <p className="text-[11px] text-theme-muted">Create an editable text box on canvas.</p>
        </div>
        <button
          onClick={addTextBox}
          className="rounded-xl border border-panel-border bg-panel-light px-3 py-2 text-xs font-semibold text-theme-secondary hover:border-zinc-500 hover:text-theme-primary transition-colors"
        >
          + Add Text Box
        </button>
      </div>

      <div>
        <p className="text-xs text-theme-muted mb-2">Font Family</p>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="input-field w-full text-sm"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs text-theme-muted mb-2">Text Styles</p>
        <div className="space-y-2">
          {TEXT_PRESETS.map((tp) => (
            <button
              key={tp.label}
              onClick={() => addText(tp.size, tp.weight, tp.sample)}
              className="w-full text-left px-4 py-3 rounded-xl bg-panel-light border border-panel-border hover:border-panel-hover hover:bg-panel-hover transition-all group"
            >
              <div
                className="text-theme-primary group-hover:text-theme-primary transition-colors truncate leading-tight"
                style={{
                  fontSize: `${Math.min(tp.size * 0.38, 26)}px`,
                  fontWeight: tp.weight,
                  fontFamily: selectedFont,
                }}
              >
                {tp.sample}
              </div>
              <div className="text-xs text-theme-muted mt-1">{tp.label} · {tp.size}px · {tp.weight}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function UploadsPanel({
  addImage,
}: {
  addImage: (url: string) => void;
}) {
  const [uploads, setUploads] = useState<UserMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addVideoClip, videoTrack, projectMode } = useStore();
  const isVideoMode = projectMode === 'video';

  const fetchUploads = async () => {
    try {
      const media = await getUserMedia();
      setUploads(media);
    } catch (err) {
      setError('Unable to load uploads');
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  /** Extract a thumbnail from a video file */
  const extractVideoThumbnail = (file: File): Promise<{ thumbnailUrl: string; duration: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.src = url;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 4);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = Math.round(240 * (video.videoHeight / Math.max(1, video.videoWidth)));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve({ thumbnailUrl, duration: video.duration });
        URL.revokeObjectURL(url);
      };

      video.onerror = () => {
        resolve({ thumbnailUrl: '', duration: 5 });
        URL.revokeObjectURL(url);
      };
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const isVideo = file.type.startsWith('video/');

    // Only allow videos in video mode
    if (isVideo && !isVideoMode) {
      setError('Video files require a Video Project. Create one from your dashboard.');
      setUploading(false);
      return;
    }

    try {
      // Upload file to local server (stored in public/uploads)
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
      const payload = await res.json();
      if (!payload.url) {
        throw new Error('No upload URL returned');
      }

      // For videos, extract thumbnail and duration
      let thumbnailUrl: string | undefined;
      let duration: number | undefined;
      if (isVideo) {
        const extracted = await extractVideoThumbnail(file);
        thumbnailUrl = extracted.thumbnailUrl;
        duration = extracted.duration;
      }

      // Save metadata to Supabase database (not the file itself)
      const savedMedia = await saveUserMedia({
        name: payload.name,
        url: payload.url,
        type: isVideo ? 'video' : 'image',
        thumbnailUrl,
        duration,
      });

      if (savedMedia) {
        setUploads((prev) => [savedMedia, ...prev]);
      }

      // Add to canvas or timeline
      if (isVideo) {
        addVideoClip({
          name: payload.name,
          url: payload.url,
          thumbnailUrl: thumbnailUrl || '',
          duration: duration || 5,
          startTime: videoTrack.currentTime,
          trimStart: 0,
          trimEnd: 0,
          volume: 1,
        });
      } else {
        addImage(payload.url);
      }
    } catch (err) {
      setError((err as Error).message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /** Drag a video clip to timeline */
  const handleVideoDragStart = (e: React.DragEvent, item: { url: string; name: string; thumbnailUrl?: string; duration?: number }) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      url: item.url,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl || '',
      duration: item.duration || 5,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-3">
          <div>
            <p className="text-xs text-theme-muted">Upload Media</p>
            <p className="text-[11px] text-theme-muted">
              {isVideoMode ? 'Images and video files are accepted.' : 'PNG, JPG, SVG, WEBP files.'}
            </p>
          </div>
          <span className="text-xs text-theme-muted">{uploading ? 'Uploading...' : 'Ready'}</span>
        </div>
        {/* S17: Disable upload area during upload to prevent concurrent uploads */}
        <label className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-panel-border hover:border-panel-hover bg-panel-light cursor-pointer transition-all group ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <Upload className="w-6 h-6 text-theme-muted group-hover:text-theme-secondary transition-colors" />
          <span className="text-sm text-theme-muted group-hover:text-theme-secondary transition-colors">Click to upload</span>
          <span className="text-xs text-theme-dim">
            {isVideoMode ? 'PNG, JPG, SVG, WEBP, MP4, MOV, WEBM' : 'PNG, JPG, SVG, WEBP'}
          </span>
          <input
            type="file"
            accept={isVideoMode ? 'image/png,image/jpeg,image/svg+xml,image/webp,video/mp4,video/quicktime,video/webm,video/x-msvideo' : 'image/png,image/jpeg,image/svg+xml,image/webp'}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleUpload(file);
            }}
          />
        </label>
        {error && (
          <div className="mt-2 flex items-start gap-1.5 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
            <p className="text-xs text-red-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 shrink-0 mt-px" aria-label="Dismiss">✕</button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-theme-muted">My Uploads</p>
          <button
            onClick={fetchUploads}
            className="text-xs text-theme-muted hover:text-theme-secondary"
          >Refresh</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {uploads.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-panel-border bg-panel-light p-4 text-center text-xs text-zinc-500">
              No uploaded assets yet.
            </div>
          ) : (
            uploads
              .filter((asset) => isVideoMode || asset.type !== 'video')
              .map((asset) => {
              const isVideoAsset = asset.type === 'video';
              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    if (isVideoAsset) {
                      addVideoClip({
                        name: asset.name,
                        url: asset.url,
                        thumbnailUrl: asset.thumbnailUrl || '',
                        duration: asset.duration || 5,
                        startTime: videoTrack.currentTime,
                        trimStart: 0,
                        trimEnd: 0,
                        volume: 1,
                      });
                    } else {
                      addImage(asset.url);
                    }
                  }}
                  draggable={isVideoAsset}
                  onDragStart={(e) => isVideoAsset && handleVideoDragStart(e, {
                    url: asset.url,
                    name: asset.name,
                    thumbnailUrl: asset.thumbnailUrl,
                    duration: asset.duration,
                  })}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-panel-border hover:border-panel-hover transition-all"
                >
                  {isVideoAsset ? (
                    <div className="w-full h-full bg-panel-hover flex items-center justify-center">
                      {asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <Film className="w-6 h-6 text-theme-dim" />
                      )}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-sky-500/80 text-[9px] text-white font-semibold">
                        MP4
                      </div>
                      {asset.duration != null && (
                        <div className="absolute bottom-1 right-1.5 px-1 py-0.5 rounded bg-black/60 text-[9px] text-theme-secondary font-mono">
                          {asset.duration.toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {isVideoAsset && (
                    <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-sky-300 font-medium">+ Timeline</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Stock images */}
      <div>
        <p className="text-xs text-theme-muted mb-2">Stock Photos</p>
        <div className="grid grid-cols-2 gap-2">
          {STOCK_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => addImage(img.url)}
              className="group relative aspect-video rounded-xl overflow-hidden border border-panel-border hover:border-panel-hover transition-all"
            >
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-start p-1.5 opacity-0 group-hover:opacity-100">
                <span className="text-xs text-theme-primary font-medium">{img.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  clarity: 0,
  highlights: 0,
  shadows: 0,
};

function LayersPanel() {
  const { fabricCanvas, activeObject, setActiveObject } = useStore();
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  useEffect(() => {
    if (!fabricCanvas) return;
    const refresh = () => setLayers([...fabricCanvas.getObjects()].reverse());
    refresh();
    fabricCanvas.on('object:added', refresh);
    fabricCanvas.on('object:removed', refresh);
    fabricCanvas.on('object:modified', refresh);
    return () => {
      fabricCanvas.off('object:added', refresh);
      fabricCanvas.off('object:removed', refresh);
      fabricCanvas.off('object:modified', refresh);
    };
  }, [fabricCanvas]);

  const toggleLayerVisibility = (obj: fabric.Object) => {
    obj.set({ visible: !obj.visible });
    fabricCanvas?.renderAll();
    setLayers([...(fabricCanvas?.getObjects().reverse() ?? [])]);
  };

  const toggleLayerLock = (obj: fabric.Object) => {
    const locked = (obj as any).lockMovementX;
    obj.set({
      lockMovementX: !locked,
      lockMovementY: !locked,
      lockRotation: !locked,
      lockScalingX: !locked,
      lockScalingY: !locked,
      selectable: locked,
    });
    fabricCanvas?.renderAll();
    setLayers([...(fabricCanvas?.getObjects().reverse() ?? [])]);
  };

  const deleteLayer = (obj: fabric.Object) => {
    fabricCanvas?.remove(obj);
    fabricCanvas?.renderAll();
    setLayers([...(fabricCanvas?.getObjects().reverse() ?? [])]);
  };

  const moveLayer = (obj: fabric.Object, direction: 'up' | 'down') => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    const targetIndex = direction === 'up'
      ? Math.min(objects.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    if (targetIndex === currentIndex) return;
    fabricCanvas.moveTo(obj, targetIndex);
    fabricCanvas.renderAll();
    setLayers([...fabricCanvas.getObjects()].reverse());
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-theme-muted mb-2">Layers</p>
        <p className="text-[11px] text-theme-muted">Reorder, hide, lock, and manage every object in your design.</p>
      </div>
      <div className="space-y-2">
        {layers.length === 0 ? (
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-theme-muted text-center">
            Add objects to the canvas to build your layer stack.
          </div>
        ) : layers.map((obj, index) => {
          const isSelected = activeObject === obj;
          const label = (obj as any).name || (obj.type === 'textbox' ? 'Text' : obj.type || 'Object');
          const visible = obj.visible !== false;
          const locked = !!(obj as any).lockMovementX;
          return (
            <div
              key={(obj as any).id || index}
              className={`rounded-2xl border px-3 py-2 transition-colors ${isSelected ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-panel-border bg-panel-light hover:border-panel-hover hover:bg-panel-hover'}`}
            >
              <button
                onClick={() => {
                  setActiveObject(obj);
                  fabricCanvas?.setActiveObject(obj);
                  fabricCanvas?.renderAll();
                }}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="text-xs text-theme-muted w-5 text-right">{layers.length - index}</div>
                <div className="flex-1 text-sm text-theme-secondary truncate">{label}</div>
              </button>
              <div className="mt-3 flex items-center justify-between gap-2 text-theme-secondary">
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleLayerVisibility(obj)} className="tool-btn w-8 h-8" title={visible ? 'Hide layer' : 'Show layer'}>
                    {visible ? '👁' : '🚫'}
                  </button>
                  <button onClick={() => toggleLayerLock(obj)} className="tool-btn w-8 h-8" title={locked ? 'Unlock layer' : 'Lock layer'}>
                    {locked ? '🔒' : '🔓'}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveLayer(obj, 'up')} className="tool-btn w-8 h-8" title="Bring forward">▲</button>
                  <button onClick={() => moveLayer(obj, 'down')} className="tool-btn w-8 h-8" title="Send backward">▼</button>
                  <button onClick={() => deleteLayer(obj)} className="tool-btn w-8 h-8 text-red-400" title="Delete layer">🗑</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MagicToolsPanel() {
  const { toolMode, setToolMode, activeObject, removeBackground } = useStore();
  const isImage = activeObject?.type === 'image';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-theme-muted mb-2">Magic Studio</p>
        <p className="text-[11px] text-theme-muted">Select an image and apply intelligent edits with one click.</p>
      </div>
      <div className="grid gap-3">
        <button
          onClick={() => setToolMode('magicGrab')}
          className={`w-full rounded-2xl px-4 py-3 text-left transition ${toolMode === 'magicGrab' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200' : 'bg-panel-light border border-panel-border text-theme-secondary hover:border-zinc-500 hover:text-theme-primary'}`}
        >
          <div className="flex items-center justify-between">
            <span>Magic Grab</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-theme-muted mt-1">Click an image to isolate it from the background.</p>
        </button>
        <button
          onClick={() => setToolMode('magicErase')}
          className={`w-full rounded-2xl px-4 py-3 text-left transition ${toolMode === 'magicErase' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200' : 'bg-panel-light border border-panel-border text-theme-secondary hover:border-zinc-500 hover:text-theme-primary'}`}
        >
          <div className="flex items-center justify-between">
            <span>Magic Erase</span>
            <Eraser className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-theme-muted mt-1">Brush over unwanted objects and blend the texture automatically.</p>
        </button>
        <button
          onClick={() => removeBackground()}
          disabled={!isImage}
          className="w-full rounded-2xl px-4 py-3 bg-panel-light border border-panel-border text-theme-secondary hover:border-zinc-500 hover:text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <span>Background Remover</span>
            <Eraser className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-theme-muted mt-1">Remove the background from the selected image instantly.</p>
        </button>
      </div>
    </div>
  );
}

function AdjustmentsPanel() {
  const { activeObject, selectedObjectAdjustments, setObjectAdjustments, applyAdjustmentsToObject } = useStore();
  const isImage = activeObject?.type === 'image';

  const updateAdjustment = (field: keyof typeof DEFAULT_ADJUSTMENTS, value: number) => {
    const next = { ...selectedObjectAdjustments, [field]: value };
    setObjectAdjustments(next);
    if (isImage && activeObject) {
      applyAdjustmentsToObject(activeObject, next);
    }
  };

  const resetAdjustments = () => {
    setObjectAdjustments(DEFAULT_ADJUSTMENTS);
    if (isImage && activeObject) {
      applyAdjustmentsToObject(activeObject, DEFAULT_ADJUSTMENTS);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-theme-muted mb-2">Photo Adjustments</p>
        <p className="text-[11px] text-theme-muted">Tune brightness, contrast, saturation and hue for the selected image.</p>
      </div>
      {!isImage ? (
        <div className="rounded-2xl border border-panel-border bg-panel-light p-4 text-xs text-theme-muted">
          Select an image to apply photo adjustments.
        </div>
      ) : (
        <div className="space-y-4">
          {(['brightness', 'contrast', 'saturation', 'hue'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-theme-muted">
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                <span>{selectedObjectAdjustments[field]}</span>
              </div>
              <input
                type="range"
                min={field === 'hue' ? -180 : -100}
                max={field === 'hue' ? 180 : 100}
                value={selectedObjectAdjustments[field]}
                onChange={(e) => updateAdjustment(field, Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          ))}
          <button
            onClick={resetAdjustments}
            className="w-full rounded-2xl border border-panel-border px-4 py-3 text-xs text-theme-secondary hover:text-theme-primary hover:border-zinc-500 transition-colors"
          >
            Reset Adjustments
          </button>
        </div>
      )}
      {/* Filter presets */}
      <div className="mt-4">
        <p className="text-xs text-theme-muted mb-2">Filter Presets</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'vintage', label: 'Vintage', adj: { brightness: -10, contrast: 5, saturation: -20, hue: -10 } },
            { id: 'cinematic', label: 'Cinematic', adj: { brightness: -5, contrast: 15, saturation: -10, hue: 5 } },
            { id: 'bw', label: 'B & W', adj: { brightness: 0, contrast: 10, saturation: -100, hue: 0 } },
            { id: 'bright', label: 'Bright', adj: { brightness: 20, contrast: 5, saturation: 10, hue: 0 } },
            { id: 'cool', label: 'Cool', adj: { brightness: 0, contrast: 0, saturation: -5, hue: -10 } },
          ] as const).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                const next = { ...selectedObjectAdjustments, ...p.adj } as any;
                setObjectAdjustments(next);
                if (isImage && activeObject) applyAdjustmentsToObject(activeObject, next);
              }}
              className="px-3 py-2 rounded-xl bg-panel-light border border-panel-border text-xs text-theme-secondary hover:text-theme-primary hover:bg-panel-hover transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page transition control */}
      <div className="mt-4">
        <p className="text-xs text-theme-muted mb-2">Page Transition</p>
        <PageTransitionSelector />
      </div>
    </div>
  );
}

function PageTransitionSelector() {
  const { pageTransitionType, setPageTransitionType } = useStore();
  const TRANS: PageTransition[] = ['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom-in', 'zoom-out', 'rotate', 'wipe-left', 'wipe-right'];
  return (
    <div className="space-y-2">
      <select
        value={pageTransitionType}
        onChange={(e) => setPageTransitionType(e.target.value as any)}
        className="w-full input-field text-sm"
      >
        {TRANS.map((t) => (
          <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
        ))}
      </select>
      <p className="text-[11px] text-theme-muted">Sets the default page transition between pages when navigating or exporting.</p>
    </div>
  );
}

function TemplatesPanel() {
  const { fabricCanvas, setToolMode } = useStore();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('templates')
        .select('id, title, canvas_data, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setTemplates((data || []) as TemplateItem[]);
    } catch (err) {
      setError('Unable to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const saveTemplate = async () => {
    if (!fabricCanvas) return;
    const title = window.prompt('Template title', 'Untitled Template');
    if (!title) return;

    setSaving(true);
    setError(null);

    try {
      const canvasData = fabricCanvas.toJSON();
      const { error: insertError } = await supabase
        .from('templates')
        .insert({ title, canvas_data: canvasData, is_public: false });
      if (insertError) throw insertError;
      await fetchTemplates();
    } catch (err) {
      setError((err as Error).message || 'Unable to save template');
    } finally {
      setSaving(false);
    }
  };

  const loadTemplate = async (id: string) => {
    if (!fabricCanvas) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('templates')
        .select('canvas_data')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data?.canvas_data) throw new Error('Template data is missing');

      fabricCanvas.discardActiveObject();
      fabricCanvas.clear();
      fabricCanvas.loadFromJSON(data.canvas_data, () => {
        fabricCanvas.renderAll();
        setToolMode('select');
      });
    } catch (err) {
      setError((err as Error).message || 'Unable to load template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-theme-muted mb-2">Saved Templates</p>
          <p className="text-[11px] text-theme-muted">Save and restore entire canvas states.</p>
        </div>
        <button
          onClick={saveTemplate}
          disabled={saving || !fabricCanvas}
          className="rounded-xl px-3 py-2 bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-3">
        {loading && templates.length === 0 ? (
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-theme-muted">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-theme-muted">No templates saved yet.</div>
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template.id)}
              className="group rounded-2xl border border-panel-border bg-panel-light p-4 text-left hover:border-panel-hover hover:bg-panel-hover transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-theme-primary truncate">{template.title}</div>
                  <div className="text-[11px] text-theme-muted mt-1">{new Date(template.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs text-emerald-400">Load</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

