import React, { useEffect, useState, useCallback } from 'react';
import {
  MousePointer2, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronUp, ChevronDown, Copy, Trash2,
  FlipHorizontal, FlipVertical, Minus, Plus,
  Image as ImageIcon, Sliders, RotateCcw,
  Square, Circle, Triangle, Minus as LineIcon,
  Lock, Unlock,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { fabric } from 'fabric';

const FONT_FAMILIES = [
  'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica',
  'Courier New', 'Trebuchet MS', 'Verdana', 'Impact',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96, 128];

// ─────────────────────────────────────────────
// Main toolbar
// ─────────────────────────────────────────────

export default function ContextualToolbar() {
  const { activeObject, fabricCanvas, zoom, setZoom, historyIndex, history, undo, redo } = useStore();
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

  return (
    <div className="flex items-center h-12 bg-panel border-b border-panel-border px-3 gap-1.5 z-50 shrink-0 overflow-x-auto">
      {/* No selection: canvas-level controls */}
      {!obj && <NoSelectionControls zoom={zoom} setZoom={setZoom} />}

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
    </div>
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

  return (
    <>
      <span className="text-xs text-zinc-500 pr-2 whitespace-nowrap">Canvas</span>
      <Divider />

      {/* Background color */}
      <div className="flex items-center gap-2 px-2">
        <label className="text-xs text-zinc-500 whitespace-nowrap">Background</label>
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
        <span className="text-xs text-zinc-500">Size</span>
        <span className="text-xs text-zinc-300 tabular-nums">{canvasWidth} × {canvasHeight}px</span>
      </div>

      <div className="flex-1" />

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
  obj: fabric.Textbox;
  setTextProp: (p: Record<string, unknown>) => void;
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
      <select
        value={obj.fontSize || 16}
        onChange={(e) => setTextProp({ fontSize: Number(e.target.value) })}
        className="input-field h-7 py-0 text-xs w-16 shrink-0"
      >
        {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Text color */}
      <input
        type="color"
        value={String(obj.fill || '#000000')}
        onChange={(e) => setTextProp({ fill: e.target.value })}
        className="w-7 h-7 rounded-md cursor-pointer border border-panel-border bg-transparent shrink-0"
        title="Text color"
      />

      <Divider />

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
          { icon: <AlignLeft className="w-3.5 h-3.5" />, val: 'left' },
          { icon: <AlignCenter className="w-3.5 h-3.5" />, val: 'center' },
          { icon: <AlignRight className="w-3.5 h-3.5" />, val: 'right' },
          { icon: <AlignJustify className="w-3.5 h-3.5" />, val: 'justify' },
        ].map(({ icon, val }) => (
          <ToggleBtn
            key={val}
            icon={icon}
            active={obj.textAlign === val}
            onClick={() => setTextProp({ textAlign: val })}
            title={`Align ${val}`}
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
        <label className="text-xs text-zinc-500">Fill</label>
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
        <label className="text-xs text-zinc-500">Stroke</label>
        <input
          type="color"
          value={String(obj.stroke || '#000000')}
          onChange={(e) => setProp({ stroke: e.target.value })}
          className="w-7 h-7 rounded-md cursor-pointer border border-panel-border bg-transparent"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setProp({ strokeWidth: Math.max(0, (obj.strokeWidth || 0) - 1) })}
            className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs text-zinc-300 w-5 text-center tabular-nums">{obj.strokeWidth || 0}</span>
          <button
            onClick={() => setProp({ strokeWidth: (obj.strokeWidth || 0) + 1 })}
            className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
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
            <label className="text-xs text-zinc-500">Radius</label>
            <input
              type="range"
              min={0}
              max={60}
              value={(obj as fabric.Rect).rx || 0}
              onChange={(e) => setProp({ rx: Number(e.target.value), ry: Number(e.target.value) })}
              className="w-20 accent-emerald-500"
            />
            <span className="text-xs text-zinc-300 w-4 tabular-nums">{(obj as fabric.Rect).rx || 0}</span>
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
        <label className="text-xs text-zinc-500">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((obj.opacity ?? 1) * 100)}
          onChange={(e) => setProp({ opacity: Number(e.target.value) / 100 })}
          className="w-24 accent-amber-500"
        />
        <span className="text-xs text-zinc-300 w-8 tabular-nums">{Math.round((obj.opacity ?? 1) * 100)}%</span>
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
          <label className="text-xs text-zinc-600 leading-none mb-0.5">X</label>
          <input
            type="number"
            value={Math.round(obj.left || 0)}
            onChange={(e) => setProp({ left: Number(e.target.value) })}
            className="input-field h-7 py-0 text-xs w-16 text-center tabular-nums"
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="text-xs text-zinc-600 leading-none mb-0.5">Y</label>
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
      <label className="text-xs text-zinc-500">Opacity</label>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round((obj.opacity ?? 1) * 100)}
        onChange={(e) => setProp({ opacity: Number(e.target.value) / 100 })}
        className="w-20 accent-emerald-500"
      />
      <span className="text-xs text-zinc-300 w-8 tabular-nums">{Math.round((obj.opacity ?? 1) * 100)}%</span>
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
        className="w-7 h-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-zinc-400 tabular-nums w-11 text-center">{Math.round(zoom * 100)}%</span>
      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="w-7 h-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setZoom(1)}
        className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded hover:bg-panel-hover transition-colors"
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
          : 'text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover'}`}
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
          : 'text-zinc-500 hover:text-zinc-100 hover:bg-panel-hover'}`}
    >
      {icon}
    </button>
  );
}
