import React, { useState } from 'react';
import {
  MousePointer2, Type, Square, Circle, Triangle,
  Minus, PenLine, Image, LayoutTemplate, Layers,
} from 'lucide-react';
import { useStore, ToolMode } from '../store/useStore';

interface Tool {
  id: ToolMode | 'divider';
  icon?: React.ReactNode;
  label?: string;
}

const TOOLS: Tool[] = [
  { id: 'select', icon: <MousePointer2 className="w-5 h-5" />, label: 'Select' },
  { id: 'divider' },
  { id: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Circle' },
  { id: 'triangle', icon: <Triangle className="w-5 h-5" />, label: 'Triangle' },
  { id: 'line', icon: <Minus className="w-5 h-5" />, label: 'Line' },
  { id: 'divider' },
  { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { id: 'pen', icon: <PenLine className="w-5 h-5" />, label: 'Freehand' },
];

const BRUSH_COLORS = [
  '#22c55e', '#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#ffffff', '#18181b', '#64748b', '#14b8a6',
];

const BRUSH_SIZES = [
  { value: 2, label: 'Extra Fine' },
  { value: 5, label: 'Fine' },
  { value: 10, label: 'Medium' },
  { value: 20, label: 'Thick' },
  { value: 40, label: 'Extra Thick' },
];

export default function ToolSidebar() {
  const { toolMode, setToolMode, setLeftPanelTab, brushColor, brushSize, setBrushColor, setBrushSize } = useStore();
  const [showBrushPanel, setShowBrushPanel] = useState(false);

  const handleTool = (id: ToolMode) => {
    setToolMode(id);
    if (id === 'text') setLeftPanelTab('text');
    else if (['rectangle', 'circle', 'triangle', 'line'].includes(id)) setLeftPanelTab('shapes');
    else if (id === 'image') setLeftPanelTab('uploads');
    if (id !== 'pen') setShowBrushPanel(false);
  };

  return (
    <div className="w-14 bg-panel border-r border-panel-border flex flex-col items-center py-3 gap-1 shrink-0 relative">
      {TOOLS.map((tool, idx) => {
        if (tool.id === 'divider') {
          return <div key={idx} className="w-8 h-px bg-panel-border my-1" />;
        }
        const isPenWithPanel = tool.id === 'pen' && showBrushPanel;
        return (
          <React.Fragment key={tool.id as string}>
            <button
              title={tool.label}
              onClick={() => {
                if (tool.id === 'pen' && toolMode === 'pen') {
                  setShowBrushPanel(!showBrushPanel);
                } else {
                  handleTool(tool.id as ToolMode);
                  if (tool.id === 'pen') setShowBrushPanel(true);
                }
              }}
              onContextMenu={(e) => {
                if (tool.id === 'pen') {
                  e.preventDefault();
                  setShowBrushPanel(!showBrushPanel);
                }
              }}
              className={`tool-btn relative ${toolMode === tool.id ? 'active' : ''}`}
            >
              {tool.icon}
              {tool.id === 'pen' && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-panel-border"
                  style={{ backgroundColor: brushColor }}
                />
              )}
            </button>
            {isPenWithPanel && (
              <div className="absolute left-full ml-1 top-12 z-50 animate-slide-in">
                <div className="bg-panel border border-panel-border rounded-lg shadow-xl p-3 w-40">
                  <div className="text-xs text-theme-dim uppercase tracking-wider font-medium mb-2">Brush Color</div>
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {BRUSH_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${brushColor === c ? 'border-emerald-400 scale-110' : 'border-panel-border'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-theme-dim uppercase tracking-wider font-medium mb-2">Brush Size</div>
                  <div className="space-y-1">
                    {BRUSH_SIZES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setBrushSize(s.value)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${brushSize === s.value ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'hover:bg-panel-hover text-theme-secondary'}`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div
                            className="rounded-full bg-current"
                            style={{ width: Math.min(s.value, 16), height: Math.min(s.value, 16) }}
                          />
                        </div>
                        <span>{s.label}</span>
                        <span className="ml-auto text-theme-dim">{s.value}px</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-panel-border">
                    <label className="text-xs text-theme-dim uppercase tracking-wider font-medium mb-2 block">Custom</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="flex-1 bg-panel-light border border-panel-border rounded px-2 py-1 text-xs text-theme-primary w-14"
                      />
                      <span className="text-xs text-theme-dim">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      <div className="flex-1" />

      {/* Panel shortcut buttons */}
      <div className="w-8 h-px bg-panel-border my-1" />
      <button
        title="Templates"
        onClick={() => setLeftPanelTab('templates')}
        className="tool-btn"
      >
        <LayoutTemplate className="w-5 h-5" />
      </button>
      <button
        title="Layers"
        onClick={() => setLeftPanelTab('layers')}
        className="tool-btn"
      >
        <Layers className="w-5 h-5" />
      </button>
      <button
        title="Images"
        onClick={() => setLeftPanelTab('uploads')}
        className="tool-btn"
      >
        <Image className="w-5 h-5" />
      </button>
    </div>
  );
}
