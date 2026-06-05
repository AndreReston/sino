import React, { useState, useEffect } from 'react';
import {
  Shapes, Type, Upload, LayoutTemplate,
  Square, Circle, Triangle, Minus, Star,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Folder, ChevronRight,
  MousePointer2, PenLine, Layers, Sparkles, Sliders, Eraser,
  Undo2, Redo2,
  Download, Monitor, ChevronDown,
  Film,
} from 'lucide-react';
import { useStore, SidebarTab, ToolMode } from '../store/useStore';
import { fabric } from 'fabric';
import { supabase } from '../lib/supabase';

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

const TEMPLATE_PRESETS = [
  { name: 'Minimal Dark', bg: '#18181b', accent: '#22c55e', desc: '1080×1080' },
  { name: 'Ocean', bg: '#0c4a6e', accent: '#38bdf8', desc: '1080×1080' },
  { name: 'Sunset', bg: '#7c2d12', accent: '#f59e0b', desc: '1080×1080' },
  { name: 'Pure White', bg: '#ffffff', accent: '#18181b', desc: '1920×1080' },
  { name: 'Forest', bg: '#14532d', accent: '#86efac', desc: '1080×1920' },
  { name: 'Rose', bg: '#881337', accent: '#fda4af', desc: '1200×675' },
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
    fabricCanvas, setCanvasBackground,
    toolMode, setToolMode,
    undo, redo, historyIndex, history,
    canvasName, setCanvasName,
    zoom, setZoom, canvasWidth, canvasHeight,
    setCanvasSize,
    selectedPageIds,
    exportPagesAsZip,
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

  const applyTemplate = (bg: string, w?: number, h?: number) => {
    setCanvasBackground(bg);
    if (w && h) {
      setCanvasSize(w, h);
      if (fabricCanvas) {
        fabricCanvas.setWidth(w);
        fabricCanvas.setHeight(h);
        fabricCanvas.renderAll();
      }
    }
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
      alert('Select one or more pages before exporting selected pages.');
      return;
    }

    if (target === 'selected') {
      await exportPagesAsZip(selectedPageIds, format);
    } else {
      await exportPagesAsZip(undefined, format);
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
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-panel-hover'}`}
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
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-panel-hover'}`}
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
          className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-panel-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-panel-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
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
                className="text-sm font-semibold text-zinc-200 hover:text-white truncate transition-colors"
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
                  <div className="px-3 pb-1 text-[10px] uppercase tracking-widest text-zinc-600">Current</div>
                  {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                    <button key={`current-${fmt}`} onClick={() => handleExport('current', fmt)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-panel-hover transition-colors">
                      <Download className="w-3 h-3 shrink-0" />
                      <span className="truncate">Export {fmt.toUpperCase()}</span>
                    </button>
                  ))}

                  <div className="border-t border-panel-border my-1 mx-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-600">Selected</div>
                  <button
                    onClick={() => handleExport('selected', 'png')}
                    disabled={selectedPageIds.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleExport('selected', 'jpg')}
                    disabled={selectedPageIds.length === 0}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-panel-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (JPG)</span>
                  </button>
                  {selectedPageIds.length > 0 && (
                    <div className="px-3 py-1 text-[10px] text-zinc-500">
                      {selectedPageIds.length} selected
                    </div>
                  )}

                  <div className="border-t border-panel-border my-1 mx-2" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-600">All pages</div>
                  <button
                    onClick={() => handleExport('all', 'png')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-panel-hover transition-colors"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">ZIP (PNG)</span>
                  </button>
                  <button
                    onClick={() => handleExport('all', 'jpg')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:text-white hover:bg-panel-hover transition-colors"
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-panel-light border border-panel-border hover:border-zinc-500 transition-colors text-xs text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-zinc-300">{canvasWidth} × {canvasHeight}px</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPresets && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-panel border border-panel-border rounded-xl shadow-2xl z-50 py-1 animate-slide-in">
                  {PRESETS.map((p) => (
                    <button key={p.name} onClick={() => applyPreset(p.w, p.h)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-panel-hover transition-colors">
                      <span>{p.name}</span>
                      <span className="text-zinc-500">{p.w}×{p.h}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab label */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
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
          {sidebarTab === 'uploads' && <UploadsPanel addImage={addImage} fabricCanvas={fabricCanvas} />}
          {sidebarTab === 'templates' && <TemplatesPanel applyTemplate={applyTemplate} />}
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
        <p className="text-xs text-zinc-500 mb-2">Basic Shapes</p>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((s) => (
            <button
              key={s.type}
              onClick={() => addShape(s.type, '#e4e4e7')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-panel-light border border-panel-border hover:border-zinc-500 hover:bg-panel-hover transition-all text-zinc-400 hover:text-zinc-100 group"
            >
              <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Quick Colors</p>
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
        <p className="text-xs text-zinc-500 mb-2">Drawing Mode</p>
        <DrawingModeButton />
      </div>
    </div>
  );
}

function DrawingModeButton() {
  const { toolMode, setToolMode, fabricCanvas } = useStore();
  const isDrawing = toolMode === 'pen';
  return (
    <button
      onClick={() => {
        if (isDrawing) {
          setToolMode('select');
        } else {
          setToolMode('pen');
          if (fabricCanvas) {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.width = 3;
            fabricCanvas.freeDrawingBrush.color = '#18181b';
          }
        }
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium
        ${isDrawing
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          : 'bg-panel-light border-panel-border text-zinc-400 hover:text-zinc-100 hover:border-zinc-500'}`}
    >
      <PenLine className="w-4 h-4" />
      {isDrawing ? 'Drawing Mode Active — Click to Exit' : 'Enable Freehand Drawing'}
    </button>
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
          <p className="text-xs text-zinc-500 mb-2">Rich Text</p>
          <p className="text-[11px] text-zinc-500">Create an editable text box on canvas.</p>
        </div>
        <button
          onClick={addTextBox}
          className="rounded-xl border border-panel-border bg-panel-light px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
        >
          + Add Text Box
        </button>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Font Family</p>
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
        <p className="text-xs text-zinc-500 mb-2">Text Styles</p>
        <div className="space-y-2">
          {TEXT_PRESETS.map((tp) => (
            <button
              key={tp.label}
              onClick={() => addText(tp.size, tp.weight, tp.sample)}
              className="w-full text-left px-4 py-3 rounded-xl bg-panel-light border border-panel-border hover:border-zinc-500 hover:bg-panel-hover transition-all group"
            >
              <div
                className="text-zinc-100 group-hover:text-white transition-colors truncate leading-tight"
                style={{
                  fontSize: `${Math.min(tp.size * 0.38, 26)}px`,
                  fontWeight: tp.weight,
                  fontFamily: selectedFont,
                }}
              >
                {tp.sample}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{tp.label} · {tp.size}px · {tp.weight}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function UploadsPanel({
  addImage,
  fabricCanvas,
}: {
  addImage: (url: string) => void;
  fabricCanvas: fabric.Canvas | null;
}) {
  const [uploads, setUploads] = useState<{ url: string; name: string; type?: string }[]>([]);
  const [sessionUploads, setSessionUploads] = useState<{ url: string; name: string; type?: string; thumbnailUrl?: string; duration?: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addVideoClip, videoTrack } = useStore();

  const fetchUploads = async () => {
    try {
      const res = await fetch('/api/media/list');
      if (!res.ok) {
        throw new Error('Uploads endpoint missing');
      }
      const payload = await res.json();
      setUploads(payload.items || []);
    } catch (err) {
      setError('Unable to load uploads');
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

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

    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      const payload = await res.json();
      if (payload.url) {
        setUploads((prev) => [{ url: payload.url, name: payload.name, type: isVideo ? 'video' : 'image' }, ...prev]);
        if (isVideo) {
          const { thumbnailUrl, duration } = await extractVideoThumbnail(file);
          addVideoClip({
            name: payload.name,
            url: payload.url,
            thumbnailUrl,
            duration,
            startTime: videoTrack.currentTime,
            trimStart: 0,
            trimEnd: 0,
            volume: 1,
          });
        } else {
          addImage(payload.url);
        }
        return;
      }
      throw new Error('No upload URL returned');
    } catch (_err) {
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('File read failed'));
          reader.readAsDataURL(file);
        });
        if (isVideo) {
          const { thumbnailUrl, duration } = await extractVideoThumbnail(file);
          const sessionItem = { url: dataUrl, name: file.name, type: 'video' as const, thumbnailUrl, duration };
          setSessionUploads((prev) => [sessionItem, ...prev]);
          addVideoClip({
            name: file.name,
            url: dataUrl,
            thumbnailUrl,
            duration,
            startTime: videoTrack.currentTime,
            trimStart: 0,
            trimEnd: 0,
            volume: 1,
          });
        } else {
          const sessionItem = { url: dataUrl, name: file.name, type: 'image' as const };
          setSessionUploads((prev) => [sessionItem, ...prev]);
          addImage(dataUrl);
        }
      } catch (readError) {
        setError('Upload failed.');
      }
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
            <p className="text-xs text-zinc-500">Upload Media</p>
            <p className="text-[11px] text-zinc-500">Images and videos are accepted.</p>
          </div>
          <span className="text-xs text-zinc-400">{uploading ? 'Uploading...' : 'Ready'}</span>
        </div>
        <label className="relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-panel-border hover:border-zinc-500 bg-panel-light cursor-pointer transition-all group">
          <Upload className="w-6 h-6 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Click to upload</span>
          <span className="text-xs text-zinc-600">PNG, JPG, SVG, WEBP, MP4, MOV, WEBM</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,video/mp4,video/quicktime,video/webm,video/x-msvideo"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleUpload(file);
            }}
          />
        </label>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">My Uploads</p>
          <button
            onClick={fetchUploads}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >Refresh</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {uploads.length + sessionUploads.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-panel-border bg-panel-light p-4 text-center text-xs text-zinc-500">
              No uploaded assets yet.
            </div>
          ) : (
            [...sessionUploads, ...uploads].map((asset) => {
              const isVideoAsset = asset.type === 'video';
              return (
                <button
                  key={asset.url}
                  onClick={() => {
                    if (isVideoAsset) {
                      addVideoClip({
                        name: asset.name,
                        url: asset.url,
                        thumbnailUrl: (asset as any).thumbnailUrl || '',
                        duration: (asset as any).duration || 5,
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
                  onDragStart={(e) => isVideoAsset && handleVideoDragStart(e, asset as any)}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-panel-border hover:border-zinc-500 transition-all"
                >
                  {isVideoAsset ? (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      {(asset as any).thumbnailUrl ? (
                        <img
                          src={(asset as any).thumbnailUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <Film className="w-6 h-6 text-zinc-600" />
                      )}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-sky-500/80 text-[9px] text-white font-semibold">
                        MP4
                      </div>
                      {(asset as any).duration != null && (
                        <div className="absolute bottom-1 right-1.5 px-1 py-0.5 rounded bg-black/60 text-[9px] text-zinc-300 font-mono">
                          {(asset as any).duration.toFixed(1)}s
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
        <p className="text-xs text-zinc-500 mb-2">Stock Photos</p>
        <div className="grid grid-cols-2 gap-2">
          {STOCK_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => addImage(img.url)}
              className="group relative aspect-video rounded-xl overflow-hidden border border-panel-border hover:border-zinc-500 transition-all"
            >
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-start p-1.5 opacity-0 group-hover:opacity-100">
                <span className="text-xs text-white font-medium">{img.label}</span>
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
    setLayers((prev) => [...(fabricCanvas?.getObjects().reverse() ?? [])]);
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
    setLayers((prev) => [...(fabricCanvas?.getObjects().reverse() ?? [])]);
  };

  const deleteLayer = (obj: fabric.Object) => {
    fabricCanvas?.remove(obj);
    fabricCanvas?.renderAll();
    setLayers((prev) => [...(fabricCanvas?.getObjects().reverse() ?? [])]);
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
        <p className="text-xs text-zinc-500 mb-2">Layers</p>
        <p className="text-[11px] text-zinc-500">Reorder, hide, lock, and manage every object in your design.</p>
      </div>
      <div className="space-y-2">
        {layers.length === 0 ? (
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-zinc-500 text-center">
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
              className={`rounded-2xl border px-3 py-2 transition-colors ${isSelected ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-panel-border bg-panel-light hover:border-zinc-500 hover:bg-panel-hover'}`}
            >
              <button
                onClick={() => {
                  setActiveObject(obj);
                  fabricCanvas?.setActiveObject(obj);
                  fabricCanvas?.renderAll();
                }}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="text-xs text-zinc-400 w-5 text-right">{layers.length - index}</div>
                <div className="flex-1 text-sm text-zinc-200 truncate">{label}</div>
              </button>
              <div className="mt-3 flex items-center justify-between gap-2 text-zinc-300">
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
        <p className="text-xs text-zinc-500 mb-2">Magic Studio</p>
        <p className="text-[11px] text-zinc-500">Select an image and apply intelligent edits with one click.</p>
      </div>
      <div className="grid gap-3">
        <button
          onClick={() => setToolMode('magicGrab')}
          className={`w-full rounded-2xl px-4 py-3 text-left transition ${toolMode === 'magicGrab' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200' : 'bg-panel-light border border-panel-border text-zinc-300 hover:border-zinc-500 hover:text-white'}`}
        >
          <div className="flex items-center justify-between">
            <span>Magic Grab</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Click an image to isolate it from the background.</p>
        </button>
        <button
          onClick={() => setToolMode('magicErase')}
          className={`w-full rounded-2xl px-4 py-3 text-left transition ${toolMode === 'magicErase' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200' : 'bg-panel-light border border-panel-border text-zinc-300 hover:border-zinc-500 hover:text-white'}`}
        >
          <div className="flex items-center justify-between">
            <span>Magic Erase</span>
            <Eraser className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Brush over unwanted objects and blend the texture automatically.</p>
        </button>
        <button
          onClick={() => removeBackground()}
          disabled={!isImage}
          className="w-full rounded-2xl px-4 py-3 bg-panel-light border border-panel-border text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <span>Background Remover</span>
            <Eraser className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Remove the background from the selected image instantly.</p>
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
        <p className="text-xs text-zinc-500 mb-2">Photo Adjustments</p>
        <p className="text-[11px] text-zinc-500">Tune brightness, contrast, saturation and hue for the selected image.</p>
      </div>
      {!isImage ? (
        <div className="rounded-2xl border border-panel-border bg-panel-light p-4 text-xs text-zinc-500">
          Select an image to apply photo adjustments.
        </div>
      ) : (
        <div className="space-y-4">
          {(['brightness', 'contrast', 'saturation', 'hue'] as const).map((field) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
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
            className="w-full rounded-2xl border border-panel-border px-4 py-3 text-xs text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            Reset Adjustments
          </button>
        </div>
      )}
    </div>
  );
}

function TemplatesPanel({
  applyTemplate,
}: {
  applyTemplate: (bg: string, w?: number, h?: number) => void;
}) {
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
          <p className="text-xs text-zinc-500 mb-2">Saved Templates</p>
          <p className="text-[11px] text-zinc-500">Save and restore entire canvas states.</p>
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
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-zinc-500">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-panel-border bg-panel-light p-4 text-xs text-zinc-500">No templates saved yet.</div>
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template.id)}
              className="group rounded-2xl border border-panel-border bg-panel-light p-4 text-left hover:border-zinc-500 hover:bg-panel-hover transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100 truncate">{template.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{new Date(template.created_at).toLocaleString()}</div>
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

function CanvasBgPicker() {
  const { canvasBackground, setCanvasBackground } = useStore();
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-panel-light border border-panel-border">
      <input
        type="color"
        value={canvasBackground}
        onChange={(e) => setCanvasBackground(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border border-panel-border bg-transparent"
      />
      <input
        type="text"
        value={canvasBackground}
        onChange={(e) => setCanvasBackground(e.target.value)}
        className="input-field flex-1 font-mono text-sm"
      />
    </div>
  );
}
