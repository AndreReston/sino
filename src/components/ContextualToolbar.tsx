import React, { useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  ChevronUp, ChevronDown, Copy, Trash2,
  FlipHorizontal, FlipVertical, Plus, Minus,
  Image as ImageIcon, RotateCcw, RotateCw,
  Square, Circle, Triangle, Star,
  X,
  Film, Volume2, VolumeX,
} from 'lucide-react';
import { useStore, VideoClip } from '../store/useStore';
import { fabric } from 'fabric';

const IMAGE_FILL_STOCK = [
  { url: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=400', label: 'Nature' },
  { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400', label: 'Team' },
  { url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400', label: 'Office' },
  { url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=400', label: 'Meeting' },
  { url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=400', label: 'Work' },
  { url: 'https://images.pexels.com/photos/7376/startup-photos.jpg?w=400', label: 'Startup' },
  { url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=400', label: 'People' },
  { url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=400', label: 'Tech' },
  { url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?w=400', label: 'Sky' },
  { url: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=400', label: 'City' },
  { url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=400', label: 'Forest' },
  { url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400', label: 'Galaxy' },
];

const FONT_FAMILIES = [
  'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica',
  'Courier New', 'Trebuchet MS', 'Verdana', 'Impact',
];

// ─────────────────────────────────────────────
// Main toolbar
// ─────────────────────────────────────────────

export default function ContextualToolbar() {
  const { activeObject, fabricCanvas, zoom, setZoom } = useStore();
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.on('object:modified', refresh);
    fabricCanvas.on('selection:updated', refresh);
    fabricCanvas.on('selection:created', refresh);
    fabricCanvas.on('selection:cleared', refresh);
    return () => {
      fabricCanvas.off('object:modified', refresh);
      fabricCanvas.off('selection:updated', refresh);
      fabricCanvas.off('selection:created', refresh);
      fabricCanvas.off('selection:cleared', refresh);
    };
  }, [fabricCanvas, refresh]);

  const obj = activeObject;
  const isText = obj?.type === 'textbox' || obj?.type === 'text';
  const isShape = obj && !isText && obj.type !== 'image' && obj.type !== 'path';
  const isImage = obj?.type === 'image';
  const isPath = obj?.type === 'path';

  const setProp = (props: Partial<fabric.Object>) => {
    if (!obj || !fabricCanvas) return;
    obj.set(props as any);
    fabricCanvas.renderAll();
    refresh();
  };

  const setTextProp = (props: Record<string, unknown>) => {
    if (!obj || !fabricCanvas) return;
    (obj as fabric.Textbox).set(props as any);
    fabricCanvas.renderAll();
    refresh();
  };

  const deleteObj = () => {
    if (!obj || !fabricCanvas) return;
    fabricCanvas.remove(obj);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  const duplicateObj = () => {
    if (!obj || !fabricCanvas) return;
    obj.clone((cloned: fabric.Object) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const activeVideoClipId = useStore((s) => s.activeVideoClipId);
  const videoTrack = useStore((s) => s.videoTrack);
  const activeClip = activeVideoClipId
    ? videoTrack.clips.find((c) => c.id === activeVideoClipId)
    : null;

  return (
    <>
    <div className="flex items-center h-12 bg-panel border-b border-panel-border px-3 gap-1.5 z-50 shrink-0 overflow-x-auto">

      {/* No selection: canvas-level controls */}
      {!obj && !activeClip && <NoSelectionControls zoom={zoom} setZoom={setZoom} />}

      {/* Text selected */}
      {obj && isText && (
        <TextControls
          obj={obj as fabric.Textbox}
          setTextProp={setTextProp}
          setProp={setProp}
          deleteObj={deleteObj}
          duplicateObj={duplicateObj}
          fabricCanvas={fabricCanvas}
        />
      )}

      {/* Shape selected */}
      {obj && (isShape || isPath) && (
        <ShapeControls
          obj={obj}
          setProp={setProp}
          deleteObj={deleteObj}
          duplicateObj={duplicateObj}
          fabricCanvas={fabricCanvas}
        />
      )}

      {/* Image selected */}
      {obj && isImage && (
        <ImageControls
          obj={obj}
          setProp={setProp}
          deleteObj={deleteObj}
          duplicateObj={duplicateObj}
          fabricCanvas={fabricCanvas}
        />
      )}

      {/* Video clip selected on timeline */}
      {activeClip && !obj && (
        <VideoClipToolbar clip={activeClip} />
      )}
    </div>
    </>
  );
}

// ─────────────────────────────────────────────
// No-selection toolbar: zoom + canvas info
// ─────────────────────────────────────────────

function NoSelectionControls({
  zoom,
  setZoom,
}: {
  zoom: number;
  setZoom: (z: number) => void;
}) {
  const { canvasWidth, canvasHeight, canvasBackground, setCanvasBackground } = useStore();
  const { fabricCanvas, pushHistory, updateLayersFromCanvas, setActiveObject } = useStore();
  const [shapeColor, setShapeColor] = useState('#3f3f46');
  const [shapeSize, setShapeSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [snapToGrid, setSnapToGrid] = useState(true);

  const PRESET_COLORS = ['#3f3f46', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#000000'];
  const GRID_SIZE = 20;

  const getSizeOffset = () => {
    const sizes = { sm: 40, md: 80, lg: 120 };
    return sizes[shapeSize];
  };

  const snapCoord = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const createAtCenter = (createFn: (left: number, top: number, color: string, size: string) => fabric.Object | null) => {
    if (!fabricCanvas) return;
    let cx = fabricCanvas.getWidth() / 2;
    let cy = fabricCanvas.getHeight() / 2;
    cx = snapCoord(cx);
    cy = snapCoord(cy);
    const obj = createFn(cx, cy, shapeColor, shapeSize);
    if (!obj) return;
    // assign id
    (obj as any).id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
    updateLayersFromCanvas?.();
    pushHistory?.(JSON.stringify(fabricCanvas.toJSON(['id', 'name', 'imageFill', 'imageFillOpacity'])));
    setActiveObject?.(obj);
  };

  const addRect = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    return new fabric.Rect({ left: left - offset / 2, top: top - (offset * 0.67) / 2, width: offset, height: offset * 0.67, fill: color, rx: 6, ry: 6 });
  });
  const addCircle = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    const radius = offset / 2;
    return new fabric.Circle({ left: left - radius, top: top - radius, radius, fill: color });
  });
  const addTriangle = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    return new fabric.Triangle({ left: left - offset / 2, top: top - offset / 2, width: offset, height: offset, fill: color });
  });
  const addStar = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    const r = offset / 2;
    const points: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r / 2;
      points.push([left + radius * Math.cos(angle), top + radius * Math.sin(angle)]);
    }
    return new fabric.Polygon(points.map(p => ({ x: p[0], y: p[1] })), { fill: color });
  });
  const addLine = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    return new fabric.Line([left - offset / 2, top, left + offset / 2, top], { stroke: color, strokeWidth: Math.max(2, offset / 20) });
  });
  const addRoundedRect = () => createAtCenter((left, top, color) => {
    const offset = getSizeOffset();
    return new fabric.Rect({ left: left - offset / 2, top: top - (offset * 0.67) / 2, width: offset, height: offset * 0.67, fill: color, rx: offset / 8, ry: offset / 8 });
  });

  return (
    <>
      <span className="text-xs text-theme-muted pr-2 whitespace-nowrap">Canvas</span>
      <Divider />

      {/* Background color */}
      <div className="flex items-center gap-2 px-2">
        <label className="text-xs text-theme-muted whitespace-nowrap">Background</label>
        <input
          type="color"
          value={canvasBackground}
          onChange={(e) => setCanvasBackground(e.target.value)}
          className="w-7 h-7 rounded-md cursor-pointer border border-panel-border bg-transparent"
        />
        <input
          type="text"
          value={canvasBackground}
          onChange={(e) => setCanvasBackground(e.target.value)}
          className="input-field w-24 h-7 py-0 font-mono text-xs"
        />
      </div>

      <Divider />

      {/* Canvas size */}
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-xs text-theme-muted">Size</span>
        <span className="text-xs text-theme-secondary tabular-nums">{canvasWidth} × {canvasHeight}px</span>
      </div>

      <div className="flex-1" />

      {/* Shape creation controls */}
      <div className="flex items-center gap-1.5 px-2 shrink-0 border-l border-panel-border">
        {/* Color picker */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-theme-muted">Color</label>
          <input
            type="color"
            value={shapeColor}
            onChange={(e) => setShapeColor(e.target.value)}
            className="w-6 h-6 rounded-md cursor-pointer border border-panel-border bg-transparent"
          />
          {/* Quick presets */}
          <div className="flex gap-0.5">
            {PRESET_COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                onClick={() => setShapeColor(c)}
                className="w-4 h-4 rounded border transition-all"
                style={{ backgroundColor: c, borderColor: shapeColor === c ? '#fff' : 'rgba(255,255,255,0.2)', borderWidth: '1px' }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Size selector */}
        <select
          value={shapeSize}
          onChange={(e) => setShapeSize(e.target.value as 'sm' | 'md' | 'lg')}
          className="input-field h-6 py-0 text-xs px-1 w-16 shrink-0"
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>

        {/* Snap toggle */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`px-1.5 py-1 rounded text-xs font-medium transition-all ${
            snapToGrid
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-theme-muted hover:text-theme-secondary border border-panel-border'
          }`}
          title={`Snap to ${GRID_SIZE}px grid: ${snapToGrid ? 'ON' : 'OFF'}`}
        >
          Snap
        </button>
      </div>

      <Divider />

      {/* Quick add shapes */}
      <div className="flex items-center gap-0.5 px-1 shrink-0">
        <ToolbarBtn icon={<Square className="w-3.5 h-3.5" />} title="Rectangle" onClick={addRect} />
        <ToolbarBtn icon={<Circle className="w-3.5 h-3.5" />} title="Circle" onClick={addCircle} />
        <ToolbarBtn icon={<Triangle className="w-3.5 h-3.5" />} title="Triangle" onClick={addTriangle} />
        <ToolbarBtn icon={<Minus className="w-3.5 h-3.5" />} title="Line" onClick={addLine} />
        <ToolbarBtn icon={<Star className="w-3.5 h-3.5" />} title="Star" onClick={addStar} />
        <ToolbarBtn icon={<Square className="w-3.5 h-3.5" />} title="Rounded Rect" onClick={addRoundedRect} />
      </div>

      {/* Zoom controls */}
      <ZoomControls zoom={zoom} setZoom={setZoom} />
    </>
  );
}

// ─────────────────────────────────────────────
// Text toolbar
// ─────────────────────────────────────────────

function TextControls({
  obj,
  setTextProp,
  setProp,
  deleteObj,
  duplicateObj,
  fabricCanvas,
}: {
  obj: fabric.Textbox | fabric.IText;
  setTextProp: (p: Record<string, unknown>) => void;
  setProp: (p: Partial<fabric.Object>) => void;
  deleteObj: () => void;
  duplicateObj: () => void;
  fabricCanvas: fabric.Canvas | null;
}) {
  const { zoom, setZoom, applyImageFillToText, removeImageFillFromText } = useStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageFill, setShowImageFill] = useState(false);
  const [imageFillPos, setImageFillPos] = useState({ left: 0, top: 0 });
  const [imageFillTab, setImageFillTab] = useState<'uploads' | 'stock'>('uploads');
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const imageFillBtnRef = React.useRef<HTMLButtonElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const color = String(obj.fill || '#000000');
  const hasImageFill = !!(obj as any).imageFill;

  const openImageFill = () => {
    if (imageFillBtnRef.current) {
      const r = imageFillBtnRef.current.getBoundingClientRect();
      setImageFillPos({ left: r.left, top: r.bottom + 6 });
    }
    setShowColorPicker(false);
    setShowImageFill((p) => !p);
  };

  // Fetch uploaded images whenever the dropdown opens
  useEffect(() => {
    if (!showImageFill) return;
    setLoadingUploads(true);
    fetch('/api/media/list')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setUploadedImages(data.items || []))
      .catch(() => setUploadedImages([]))
      .finally(() => setLoadingUploads(false));
  }, [showImageFill]);

  const handleLocalUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedImages((prev) => [{ url: dataUrl, name: file.name }, ...prev]);
      applyImageFillToText(obj, dataUrl, 1);
      setShowImageFill(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Type label */}
      <div className="flex items-center gap-1.5 pr-2 shrink-0">
        <AlignLeft className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-xs text-sky-400 font-medium">Text</span>
      </div>
      <Divider />

      {/* Font family */}
      <select
        value={obj.fontFamily?.replace(', sans-serif', '') || 'Inter'}
        onChange={(e) => setTextProp({ fontFamily: e.target.value + ', sans-serif' })}
        className="input-field h-7 py-0 text-xs w-28 shrink-0"
      >
        {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* Font size */}
      <div className="flex items-center gap-1 shrink-0">
        <label className="text-xs text-theme-muted">Size</label>
        <input
          type="number"
          min={6}
          max={256}
          value={obj.fontSize || 16}
          onChange={(e) => setTextProp({ fontSize: Number(e.target.value) || 1 })}
          className="input-field h-7 py-0 text-xs w-16"
        />
      </div>

      {/* Text color */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker((prev) => !prev)}
          title="Text color"
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-panel-border bg-panel-light text-xs text-theme-secondary hover:border-zinc-500 hover:text-theme-primary transition-colors"
        >
          <span className="w-4 h-4 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
          Color
        </button>
        {showColorPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
            <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-xl border border-panel-border bg-panel shadow-2xl p-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setTextProp({ fill: e.target.value })}
                className="w-full h-10 rounded-lg border border-panel-border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setTextProp({ fill: e.target.value })}
                className="input-field w-full mt-2 text-xs"
              />
            </div>
          </>
        )}
      </div>

      {/* Image Fill button — dropdown uses fixed position to escape overflow-x:auto clipping */}
      <div className="relative shrink-0">
        <button
          ref={imageFillBtnRef}
          onClick={openImageFill}
          title="Image Fill — apply a photo as your text fill"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-colors ${
            hasImageFill
              ? 'bg-violet-500/20 border-violet-400/60 text-violet-300 hover:bg-violet-500/30'
              : 'border-panel-border bg-panel-light text-zinc-300 hover:border-zinc-500 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {hasImageFill ? '✓ Image Fill' : 'Image Fill'}
        </button>
      </div>

      {showImageFill && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowImageFill(false)} />
          <div
            className="fixed z-[9999] w-80 rounded-xl border border-panel-border bg-panel shadow-2xl p-3 space-y-3"
            style={{ left: imageFillPos.left, top: imageFillPos.top }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-theme-primary">Image Fill</p>
                <p className="text-[11px] text-theme-muted mt-0.5">Fill text characters with a photo</p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Upload from device */}
                <label
                  className="flex items-center gap-1 text-[11px] text-theme-secondary hover:text-theme-primary px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
                  title="Upload image from device"
                >
                  <ImageIcon className="w-3 h-3" />
                  Upload
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLocalUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {hasImageFill && (
                  <button
                    onClick={() => { removeImageFillFromText(obj); setShowImageFill(false); }}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-0.5 bg-slate-800/80 rounded-lg">
              {(['uploads', 'stock'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setImageFillTab(tab)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
                    imageFillTab === tab
                      ? 'bg-violet-500/30 text-violet-200 border border-violet-500/40'
                      : 'text-theme-muted hover:text-theme-secondary'
                  }`}
                >
                  {tab === 'uploads' ? 'My Uploads' : 'Stock Photos'}
                </button>
              ))}
            </div>

            {/* Uploads tab */}
            {imageFillTab === 'uploads' && (
              <div>
                {loadingUploads ? (
                  <div className="flex items-center justify-center h-20 text-theme-muted text-xs">
                    Loading uploads…
                  </div>
                ) : uploadedImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-20 gap-2">
                    <p className="text-theme-muted text-xs">No uploaded images yet</p>
                    <label className="text-[11px] text-violet-300 hover:text-violet-200 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 cursor-pointer transition-colors">
                      Upload one now
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLocalUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                    {uploadedImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { applyImageFillToText(obj, img.url, 1); setShowImageFill(false); }}
                        className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-violet-400/60 transition-all aspect-square bg-slate-800"
                        title={img.name}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-[9px] text-white font-semibold truncate px-1">{img.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stock tab */}
            {imageFillTab === 'stock' && (
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                {IMAGE_FILL_STOCK.map((img) => (
                  <button
                    key={img.url}
                    onClick={() => { applyImageFillToText(obj, img.url, 1); setShowImageFill(false); }}
                    className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-violet-400/60 transition-all aspect-square bg-slate-800"
                    title={img.label}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-[9px] text-white font-semibold">{img.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] text-theme-muted text-center">
              {hasImageFill ? '✓ Fill active — click another image to swap' : 'Click any image to apply as text fill'}
            </p>
          </div>
        </>
      )}

      {/* Style toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToggleBtn
          icon={<Bold className="w-3.5 h-3.5" />}
          active={obj.fontWeight === 'bold'}
          onClick={() => setTextProp({ fontWeight: obj.fontWeight === 'bold' ? 'normal' : 'bold' })}
          title="Bold"
        />
        <ToggleBtn
          icon={<Italic className="w-3.5 h-3.5" />}
          active={obj.fontStyle === 'italic'}
          onClick={() => setTextProp({ fontStyle: obj.fontStyle === 'italic' ? 'normal' : 'italic' })}
          title="Italic"
        />
        <ToggleBtn
          icon={<Underline className="w-3.5 h-3.5" />}
          active={!!obj.underline}
          onClick={() => setTextProp({ underline: !obj.underline })}
          title="Underline"
        />
        <ToggleBtn
          icon={<Strikethrough className="w-3.5 h-3.5" />}
          active={!!obj.linethrough}
          onClick={() => setTextProp({ linethrough: !obj.linethrough })}
          title="Strikethrough"
        />
      </div>

      <Divider />

      {/* Alignment */}
      <div className="flex items-center gap-0.5 shrink-0">
        {[
          { icon: <AlignLeft className="w-3.5 h-3.5" />, val: 'left', title: 'Start' },
          { icon: <AlignCenter className="w-3.5 h-3.5" />, val: 'center', title: 'Center' },
          { icon: <AlignRight className="w-3.5 h-3.5" />, val: 'right', title: 'End' },
        ].map(({ icon, val, title }) => (
          <ToggleBtn
            key={val}
            icon={icon}
            active={obj.textAlign === val}
            onClick={() => setTextProp({ textAlign: val })}
            title={title}
          />
        ))}
      </div>

      <Divider />

      {/* Opacity */}
      <OpacityControl obj={obj as unknown as fabric.Object} setProp={setProp} />

      <Divider />

      {/* Object actions */}
      <ObjectActions
        deleteObj={deleteObj}
        duplicateObj={duplicateObj}
        fabricCanvas={fabricCanvas}
        obj={obj as unknown as fabric.Object}
      />


      <div className="flex-1" />
      <ZoomControls zoom={zoom} setZoom={setZoom} />
    </>
  );
}

// ─────────────────────────────────────────────
// Shape toolbar
// ─────────────────────────────────────────────

function ShapeControls({
  obj,
  setProp,
  deleteObj,
  duplicateObj,
  fabricCanvas,
}: {
  obj: fabric.Object;
  setProp: (p: Partial<fabric.Object>) => void;
  deleteObj: () => void;
  duplicateObj: () => void;
  fabricCanvas: fabric.Canvas | null;
}) {
  const { zoom, setZoom } = useStore();
  const isRect = obj.type === 'rect';

  return (
    <>
      {/* Type label */}
      <div className="flex items-center gap-1.5 pr-2 shrink-0">
        <Square className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium capitalize">{obj.type}</span>
      </div>
      <Divider />

      {/* Fill color */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">Fill</label>
        <input
          type="color"
          value={String(obj.fill || '#000000')}
          onChange={(e) => setProp({ fill: e.target.value })}
          className="w-7 h-7 rounded-md cursor-pointer border border-panel-border bg-transparent"
        />
        <input
          type="text"
          value={String(obj.fill || '#000000')}
          onChange={(e) => setProp({ fill: e.target.value })}
          className="input-field h-7 py-0 font-mono text-xs w-20"
        />
      </div>

      <Divider />

      {/* Stroke */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">Stroke</label>
        <input
          type="color"
          value={String(obj.stroke || '#000000')}
          onChange={(e) => setProp({ stroke: e.target.value })}
          className="w-7 h-7 rounded-md cursor-pointer border border-panel-border bg-transparent"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setProp({ strokeWidth: Math.max(0, (obj.strokeWidth || 0) - 1) })}
            className="w-6 h-6 flex items-center justify-center rounded text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-theme-secondary w-5 text-center tabular-nums">{obj.strokeWidth || 0}</span>
          <button
            onClick={() => setProp({ strokeWidth: (obj.strokeWidth || 0) + 1 })}
            className="w-6 h-6 flex items-center justify-center rounded text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Corner radius for rects */}
      {isRect && (
        <>
          <Divider />
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-xs text-theme-muted">Radius</label>
            <input
              type="range"
              min={0}
              max={60}
              value={(obj as fabric.Rect).rx || 0}
              onChange={(e) => setProp({ rx: Number(e.target.value), ry: Number(e.target.value) } as any)}
              className="w-20 accent-emerald-500"
            />
            <span className="text-xs text-theme-secondary w-4 tabular-nums">{(obj as fabric.Rect).rx || 0}</span>
          </div>
        </>
      )}

      <Divider />

      {/* Flip */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolbarBtn
          icon={<FlipHorizontal className="w-3.5 h-3.5" />}
          title="Flip Horizontal"
          onClick={() => setProp({ flipX: !obj.flipX })}
        />
        <ToolbarBtn
          icon={<FlipVertical className="w-3.5 h-3.5" />}
          title="Flip Vertical"
          onClick={() => setProp({ flipY: !obj.flipY })}
        />
      </div>

      <Divider />

      <OpacityControl obj={obj} setProp={setProp} />

      <Divider />

      <ObjectActions deleteObj={deleteObj} duplicateObj={duplicateObj} fabricCanvas={fabricCanvas} obj={obj} />

      <div className="flex-1" />
      <ZoomControls zoom={zoom} setZoom={setZoom} />
    </>
  );
}

// ─────────────────────────────────────────────
// Image toolbar
// ─────────────────────────────────────────────

function ImageControls({
  obj,
  setProp,
  deleteObj,
  duplicateObj,
  fabricCanvas,
}: {
  obj: fabric.Object;
  setProp: (p: Partial<fabric.Object>) => void;
  deleteObj: () => void;
  duplicateObj: () => void;
  fabricCanvas: fabric.Canvas | null;
}) {
  const { zoom, setZoom } = useStore();

  return (
    <>
      {/* Type label */}
      <div className="flex items-center gap-1.5 pr-2 shrink-0">
        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs text-amber-400 font-medium">Image</span>
      </div>
      <Divider />

      {/* Opacity slider */}
      <div className="flex items-center gap-2 shrink-0">
        <label className="text-xs text-theme-muted">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((obj.opacity ?? 1) * 100)}
          onChange={(e) => setProp({ opacity: Number(e.target.value) / 100 })}
          className="w-24 accent-amber-500"
        />
        <span className="text-xs text-theme-secondary w-8 tabular-nums">{Math.round((obj.opacity ?? 1) * 100)}%</span>
      </div>

      <Divider />

      {/* Flip */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolbarBtn icon={<FlipHorizontal className="w-3.5 h-3.5" />} title="Flip H" onClick={() => setProp({ flipX: !obj.flipX })} />
        <ToolbarBtn icon={<FlipVertical className="w-3.5 h-3.5" />} title="Flip V" onClick={() => setProp({ flipY: !obj.flipY })} />
      </div>

      <Divider />

      {/* Position */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex flex-col items-center">
          <label className="text-xs text-theme-dim leading-none mb-0.5">X</label>
          <input
            type="number"
            value={Math.round(obj.left || 0)}
            onChange={(e) => setProp({ left: Number(e.target.value) })}
            className="input-field h-7 py-0 text-xs w-16 text-center tabular-nums"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="text-xs text-theme-dim leading-none mb-0.5">Y</label>
          <input
            type="number"
            value={Math.round(obj.top || 0)}
            onChange={(e) => setProp({ top: Number(e.target.value) })}
            className="input-field h-7 py-0 text-xs w-16 text-center tabular-nums"
          />
        </div>
      </div>

      <Divider />

      <ObjectActions deleteObj={deleteObj} duplicateObj={duplicateObj} fabricCanvas={fabricCanvas} obj={obj} />

      <div className="flex-1" />
      <ZoomControls zoom={zoom} setZoom={setZoom} />
    </>
  );
}

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────

function OpacityControl({
  obj,
  setProp,
}: {
  obj: fabric.Object;
  setProp: (p: Partial<fabric.Object>) => void;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <label className="text-xs text-theme-muted">Opacity</label>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round((obj.opacity ?? 1) * 100)}
        onChange={(e) => setProp({ opacity: Number(e.target.value) / 100 })}
        className="w-20 accent-emerald-500"
      />
      <span className="text-xs text-theme-secondary w-8 tabular-nums">{Math.round((obj.opacity ?? 1) * 100)}%</span>
    </div>
  );
}

function ObjectActions({
  deleteObj,
  duplicateObj,
  fabricCanvas,
  obj,
}: {
  deleteObj: () => void;
  duplicateObj: () => void;
  fabricCanvas: fabric.Canvas | null;
  obj: fabric.Object;
}) {
  const bringForward = () => {
    if (!fabricCanvas || !obj) return;
    fabricCanvas.bringForward(obj);
    fabricCanvas.renderAll();
  };
  const sendBackward = () => {
    if (!fabricCanvas || !obj) return;
    fabricCanvas.sendBackwards(obj);
    fabricCanvas.renderAll();
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <ToolbarBtn icon={<RotateCcw className="w-3.5 h-3.5" />} title="Rotate Left" onClick={() => {
        if (!fabricCanvas || !obj) return;
        const next = ((obj.angle || 0) - 15) % 360;
        obj.set({ angle: next });
        fabricCanvas.renderAll();
        fabricCanvas.fire('object:modified', { target: obj });
      }} />
      <ToolbarBtn icon={<RotateCw className="w-3.5 h-3.5" />} title="Rotate Right" onClick={() => {
        if (!fabricCanvas || !obj) return;
        const next = ((obj.angle || 0) + 15) % 360;
        obj.set({ angle: next });
        fabricCanvas.renderAll();
        fabricCanvas.fire('object:modified', { target: obj });
      }} />
      <ToolbarBtn icon={<Copy className="w-3.5 h-3.5" />} title="Duplicate" onClick={duplicateObj} />
      <ToolbarBtn icon={<ChevronUp className="w-3.5 h-3.5" />} title="Bring Forward" onClick={bringForward} />
      <ToolbarBtn icon={<ChevronDown className="w-3.5 h-3.5" />} title="Send Backward" onClick={sendBackward} />
      <ToolbarBtn
        icon={<Trash2 className="w-3.5 h-3.5" />}
        title="Delete"
        onClick={deleteObj}
        danger
      />
    </div>
  );
}

function ZoomControls({ zoom, setZoom }: { zoom: number; setZoom: (z: number) => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-panel-border">
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="w-7 h-7 flex items-center justify-center rounded text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-theme-muted tabular-nums w-11 text-center">{Math.round(zoom * 100)}%</span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-7 h-7 flex items-center justify-center rounded text-theme-dim hover:text-theme-primary hover:bg-panel-hover transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setZoom(1)}
        className="text-xs text-theme-dim hover:text-theme-secondary px-1.5 py-1 rounded hover:bg-panel-hover transition-colors"
      >
        1:1
      </button>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-panel-border mx-1 shrink-0" />;
}

function ToggleBtn({
  icon, active, onClick, title,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-all
        ${active
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          : 'text-theme-muted hover:text-theme-primary hover:bg-panel-hover'}`}
    >
      {icon}
    </button>
  );
}

function ToolbarBtn({
  icon, onClick, title, danger,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-all
        ${danger
          ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10'
          : 'text-theme-muted hover:text-theme-primary hover:bg-panel-hover'}`}
    >
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────
// Video clip toolbar (shown when a video clip is selected on timeline)
// ─────────────────────────────────────────────

function VideoClipToolbar({ clip }: { clip: VideoClip }) {
  const { updateVideoClip, removeVideoClip, setActiveVideoClip } = useStore();
  const [isMuted, setIsMuted] = useState(clip.volume === 0);

  const clipDuration = clip.duration - clip.trimStart - clip.trimEnd;

  return (
    <>
      <div className="flex items-center gap-1.5 pr-2 shrink-0">
        <Film className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-xs text-sky-400 font-medium">Video</span>
      </div>

      <Divider />

      {/* Clip name */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">Clip</label>
        <span className="text-xs text-theme-secondary truncate max-w-[160px]">{clip.name}</span>
      </div>

      <Divider />

      {/* Duration info */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">Duration</label>
        <span className="text-xs text-theme-secondary tabular-nums">{clipDuration.toFixed(1)}s</span>
      </div>

      <Divider />

      {/* Trim start */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">Start trim</label>
        <input
          type="number"
          min={0}
          max={clip.duration - clip.trimEnd - 0.1}
          step={0.1}
          value={clip.trimStart.toFixed(1)}
          onChange={(e) => updateVideoClip(clip.id, { trimStart: Number(e.target.value) || 0 })}
          className="input-field h-7 py-0 text-xs w-16 text-center tabular-nums"
        />
      </div>

      {/* Trim end */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-theme-muted">End trim</label>
        <input
          type="number"
          min={0}
          max={clip.duration - clip.trimStart - 0.1}
          step={0.1}
          value={clip.trimEnd.toFixed(1)}
          onChange={(e) => updateVideoClip(clip.id, { trimEnd: Number(e.target.value) || 0 })}
          className="input-field h-7 py-0 text-xs w-16 text-center tabular-nums"
        />
      </div>

      <Divider />

      {/* Volume */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            const newVolume = isMuted ? 1 : 0;
            setIsMuted(!isMuted);
            updateVideoClip(clip.id, { volume: newVolume });
          }}
          className="w-7 h-7 flex items-center justify-center rounded text-theme-muted hover:text-theme-primary hover:bg-panel-hover transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(clip.volume * 100)}
          onChange={(e) => updateVideoClip(clip.id, { volume: Number(e.target.value) / 100 })}
          className="w-16 accent-sky-500"
        />
        <span className="text-xs text-theme-secondary w-8 tabular-nums">{Math.round(clip.volume * 100)}%</span>
      </div>

      <div className="flex-1" />

      {/* Delete clip */}
      <ToolbarBtn
        icon={<Trash2 className="w-3.5 h-3.5" />}
        title="Remove clip"
        onClick={() => { removeVideoClip(clip.id); setActiveVideoClip(null); }}
        danger
      />
    </>
  );
}