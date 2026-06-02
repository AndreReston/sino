import React, { useState } from 'react';
import {
  Shapes, Type, Upload, LayoutTemplate,
  Square, Circle, Triangle, Minus, Star,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Folder, ChevronRight,
  MousePointer2, PenLine, Layers,
  Undo2, Redo2,
  Download, Monitor, ChevronDown,
} from 'lucide-react';
import { useStore, SidebarTab, ToolMode } from '../store/useStore';
import { fabric } from 'fabric';

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

// ─────────────────────────────────────────────
// Sidebar Tab definitions
// ─────────────────────────────────────────────

const TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { id: 'shapes', icon: <Shapes className="w-5 h-5" />, label: 'Shapes' },
  { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { id: 'uploads', icon: <Upload className="w-5 h-5" />, label: 'Uploads' },
  { id: 'templates', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Templates' },
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

  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    if (!fabricCanvas) return;
    setShowExport(false);
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
                <div className="absolute top-full right-0 mt-1 w-36 bg-panel border border-panel-border rounded-xl shadow-2xl z-50 py-1 animate-slide-in">
                  {(['png', 'jpg', 'svg'] as const).map((fmt) => (
                    <button key={fmt} onClick={() => handleExport(fmt)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-panel-hover transition-colors uppercase tracking-wide">
                      <Download className="w-3.5 h-3.5" />{fmt}
                    </button>
                  ))}
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
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
            />
          )}
          {sidebarTab === 'uploads' && <UploadsPanel addImage={addImage} fabricCanvas={fabricCanvas} />}
          {sidebarTab === 'templates' && <TemplatesPanel applyTemplate={applyTemplate} />}
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
  selectedFont,
  setSelectedFont,
}: {
  addText: (size: number, weight: string, text: string) => void;
  selectedFont: string;
  setSelectedFont: (f: string) => void;
}) {
  return (
    <div className="space-y-4">
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
  return (
    <div className="space-y-4">
      {/* Upload */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Upload Image</p>
        <label className="relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-panel-border hover:border-zinc-500 bg-panel-light cursor-pointer transition-all group">
          <Upload className="w-6 h-6 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Click to upload</span>
          <span className="text-xs text-zinc-600">PNG, JPG, SVG, WEBP</span>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !fabricCanvas) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                fabric.Image.fromURL(ev.target?.result as string, (img) => {
                  const maxW = fabricCanvas.getWidth() * 0.5;
                  img.scale(Math.min(maxW / (img.width || 1), 1));
                  img.set({ left: 80, top: 80 });
                  fabricCanvas.add(img);
                  fabricCanvas.setActiveObject(img);
                  fabricCanvas.renderAll();
                });
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
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

function TemplatesPanel({
  applyTemplate,
}: {
  applyTemplate: (bg: string, w?: number, h?: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-zinc-500 mb-2">Canvas Themes</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_PRESETS.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t.bg)}
              className="group relative rounded-xl overflow-hidden border border-panel-border hover:border-zinc-500 transition-all aspect-video"
              style={{ backgroundColor: t.bg }}
            >
              {/* Decorative content preview */}
              <div className="absolute inset-0 p-2 flex flex-col gap-1 justify-center">
                <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: t.accent, opacity: 0.9 }} />
                <div className="h-1 rounded-full w-1/2" style={{ backgroundColor: t.accent, opacity: 0.5 }} />
                <div className="h-1 rounded-full w-2/3" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-xs text-white font-semibold px-2 py-1 rounded-md bg-black/50">Apply</span>
              </div>
              <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between">
                <span className="text-white/60 font-medium" style={{ fontSize: '8px' }}>{t.name}</span>
                <span className="text-white/40" style={{ fontSize: '7px' }}>{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Canvas Background Color</p>
        <CanvasBgPicker />
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
