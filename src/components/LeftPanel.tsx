import React, { useState } from 'react';
import {
  LayoutTemplate, Shapes, Type, Image, Layers,
  ChevronRight, Eye, EyeOff, Trash2, Lock, Unlock,
  Upload, Search,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { fabric } from 'fabric';

type Tab = 'templates' | 'elements' | 'text' | 'images' | 'layers';

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'templates', icon: <LayoutTemplate className="w-4 h-4" />, label: 'Templates' },
  { id: 'elements', icon: <Shapes className="w-4 h-4" />, label: 'Elements' },
  { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
  { id: 'images', icon: <Image className="w-4 h-4" />, label: 'Media' },
  { id: 'layers', icon: <Layers className="w-4 h-4" />, label: 'Layers' },
];

const TEXT_STYLES = [
  { label: 'Heading', size: 48, weight: '700', preview: 'Add a Heading' },
  { label: 'Subheading', size: 32, weight: '600', preview: 'Add a Subheading' },
  { label: 'Body Text', size: 18, weight: '400', preview: 'Add body text' },
  { label: 'Caption', size: 13, weight: '400', preview: 'Add a caption' },
];

const SHAPE_COLORS = ['#22c55e', '#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff', '#71717a'];

const STOCK_IMAGES = [
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=300',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=300',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=300',
  'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=300',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=300',
  'https://images.pexels.com/photos/7376/startup-photos.jpg?w=300',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=300',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?w=300',
];

const TEMPLATE_STYLES = [
  { name: 'Minimal Dark', bg: '#18181b', accent: '#22c55e' },
  { name: 'Ocean Blue', bg: '#0c4a6e', accent: '#38bdf8' },
  { name: 'Warm Sunset', bg: '#7c2d12', accent: '#f59e0b' },
  { name: 'Pure White', bg: '#ffffff', accent: '#18181b' },
  { name: 'Forest', bg: '#14532d', accent: '#86efac' },
  { name: 'Rose', bg: '#881337', accent: '#fda4af' },
];

export default function LeftPanel() {
  const { leftPanelTab, setLeftPanelTab, fabricCanvas, setCanvasBackground } = useStore();
  const [search, setSearch] = useState('');
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  const refreshLayers = () => {
    if (fabricCanvas) {
      setLayers([...fabricCanvas.getObjects()].reverse());
    }
  };

  React.useEffect(() => {
    if (!fabricCanvas) return;
    const update = () => refreshLayers();
    fabricCanvas.on('object:added', update);
    fabricCanvas.on('object:removed', update);
    fabricCanvas.on('object:modified', update);
    return () => {
      fabricCanvas.off('object:added', update);
      fabricCanvas.off('object:removed', update);
      fabricCanvas.off('object:modified', update);
    };
  }, [fabricCanvas]);

  const addText = (size: number, weight: string, text: string) => {
    if (!fabricCanvas) return;
    const tb = new fabric.Textbox(text, {
      left: 100,
      top: 100,
      width: 400,
      fontSize: size,
      fontWeight: weight,
      fontFamily: 'Inter, sans-serif',
      fill: '#fafafa',
    });
    fabricCanvas.add(tb);
    fabricCanvas.setActiveObject(tb);
    fabricCanvas.renderAll();
  };

  const addShape = (type: string, color: string) => {
    if (!fabricCanvas) return;
    let obj: fabric.Object;
    const cx = fabricCanvas.getWidth() / 2;
    const cy = fabricCanvas.getHeight() / 2;

    if (type === 'rect') {
      obj = new fabric.Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill: color, rx: 4, ry: 4 });
    } else if (type === 'circle') {
      obj = new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: color });
    } else if (type === 'triangle') {
      obj = new fabric.Triangle({ left: cx - 50, top: cy - 60, width: 100, height: 100, fill: color });
    } else if (type === 'star') {
      const points = createStarPoints(cx, cy, 5, 50, 25);
      obj = new fabric.Polygon(points, { fill: color });
    } else {
      obj = new fabric.Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill: color });
    }
    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
  };

  const addImage = (url: string) => {
    if (!fabricCanvas) return;
    fabric.Image.fromURL(url, (img) => {
      const maxW = fabricCanvas.getWidth() * 0.5;
      const scale = Math.min(maxW / (img.width || 1), 1);
      img.scale(scale);
      img.set({ left: 80, top: 80 });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const applyTemplate = (bg: string) => {
    setCanvasBackground(bg);
  };

  const toggleLayerVisibility = (obj: fabric.Object) => {
    obj.set({ visible: !obj.visible });
    fabricCanvas?.renderAll();
    refreshLayers();
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
    refreshLayers();
  };

  const deleteLayer = (obj: fabric.Object) => {
    fabricCanvas?.remove(obj);
    fabricCanvas?.renderAll();
    refreshLayers();
  };

  return (
    <div className="w-64 bg-panel border-r border-panel-border flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-panel-border overflow-x-auto shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setLeftPanelTab(tab.id); if (tab.id === 'layers') refreshLayers(); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 text-xs font-medium shrink-0 border-b-2 transition-all
              ${leftPanelTab === tab.id
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Templates */}
        {leftPanelTab === 'templates' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Canvas Themes</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_STYLES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t.bg)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-panel-border hover:border-neon-green/50 transition-all hover:scale-105"
                  style={{ backgroundColor: t.bg }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <span className="text-xs text-white font-medium">Apply</span>
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ color: t.accent, fontSize: '9px' }}>
                      {t.name}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 w-6 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
                  <div className="absolute top-4.5 left-2 w-10 h-1 rounded-full opacity-60" style={{ backgroundColor: t.accent }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Elements */}
        {leftPanelTab === 'elements' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Shapes</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { type: 'rect', label: 'Rect' },
                  { type: 'circle', label: 'Circle' },
                  { type: 'triangle', label: 'Triangle' },
                  { type: 'star', label: 'Star' },
                ].map((s) => (
                  <button
                    key={s.type}
                    onClick={() => addShape(s.type, '#3f3f46')}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-panel-light hover:bg-panel-hover border border-panel-border hover:border-neon-green/40 transition-all text-zinc-400 hover:text-zinc-100"
                  >
                    <ShapeIcon type={s.type} />
                    <span className="text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {SHAPE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => addShape('rect', c)}
                    className="w-7 h-7 rounded-full border-2 border-transparent hover:border-zinc-100 hover:scale-110 transition-all"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text */}
        {leftPanelTab === 'text' && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Text Styles</p>
            {TEXT_STYLES.map((ts) => (
              <button
                key={ts.label}
                onClick={() => addText(ts.size, ts.weight, ts.preview)}
                className="w-full text-left px-3 py-3 rounded-lg bg-panel-light hover:bg-panel-hover border border-panel-border hover:border-neon-green/40 transition-all group"
              >
                <div
                  className="text-zinc-200 group-hover:text-white transition-colors truncate"
                  style={{ fontSize: `${Math.min(ts.size * 0.5, 24)}px`, fontWeight: ts.weight }}
                >
                  {ts.preview}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{ts.label} · {ts.size}px</div>
              </button>
            ))}
          </div>
        )}

        {/* Images / Media */}
        {leftPanelTab === 'images' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 p-2 bg-panel-light rounded-lg border border-panel-border border-dashed hover:border-neon-green/50 cursor-pointer transition-colors group">
              <Upload className="w-4 h-4 text-zinc-500 group-hover:text-neon-green transition-colors" />
              <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Upload image</span>
              <input
                type="file"
                accept="image/*"
                className="absolute opacity-0 w-full h-full cursor-pointer"
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
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Stock Photos</p>
            <div className="grid grid-cols-2 gap-2">
              {STOCK_IMAGES.map((url, i) => (
                <button
                  key={i}
                  onClick={() => addImage(url)}
                  className="aspect-video rounded-lg overflow-hidden bg-panel-light border border-panel-border hover:border-neon-green/50 transition-all hover:scale-105 group"
                >
                  <img
                    src={url}
                    alt="stock"
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layers */}
        {leftPanelTab === 'layers' && (
          <div className="space-y-1 animate-fade-in">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">
              Layers ({layers.length})
            </p>
            {layers.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-8">No objects on canvas</p>
            )}
            {layers.map((obj, idx) => {
              const label = (obj as any).name || (obj.type === 'textbox' ? 'Text' : obj.type || 'Object');
              const isVisible = obj.visible !== false;
              const isLocked = (obj as any).lockMovementX;
              return (
                <div
                  key={(obj as any).id || idx}
                  onClick={() => {
                    fabricCanvas?.setActiveObject(obj);
                    fabricCanvas?.renderAll();
                  }}
                  className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-panel-hover cursor-pointer group transition-colors"
                >
                  <span className="text-xs text-zinc-500 w-5 text-right shrink-0">{layers.length - idx}</span>
                  <LayerTypeIcon type={obj.type || ''} />
                  <span className="text-xs text-zinc-300 flex-1 truncate">{label}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(obj); }}
                      className="text-zinc-500 hover:text-zinc-100 transition-colors"
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerLock(obj); }}
                      className="text-zinc-500 hover:text-zinc-100 transition-colors"
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(obj); }}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ShapeIcon({ type }: { type: string }) {
  if (type === 'circle') return <div className="w-6 h-6 rounded-full bg-zinc-400" />;
  if (type === 'triangle') return (
    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-zinc-400" />
  );
  if (type === 'star') return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-zinc-400">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
  return <div className="w-6 h-4 rounded-sm bg-zinc-400" />;
}

function LayerTypeIcon({ type }: { type: string }) {
  if (type === 'textbox' || type === 'text') return <Type className="w-3.5 h-3.5 text-neon-blue shrink-0" />;
  if (type === 'image') return <Image className="w-3.5 h-3.5 text-neon-green shrink-0" />;
  if (type === 'circle') return <div className="w-3.5 h-3.5 rounded-full bg-zinc-500 shrink-0" />;
  return <div className="w-3.5 h-3.5 rounded-sm bg-zinc-500 shrink-0" />;
}

function createStarPoints(cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  const points: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < 2 * spikes; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}
