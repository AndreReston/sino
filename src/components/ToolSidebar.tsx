import React from 'react';
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

export default function ToolSidebar() {
  const { toolMode, setToolMode, setLeftPanelTab } = useStore();

  const handleTool = (id: ToolMode) => {
    setToolMode(id);
    if (id === 'text') setLeftPanelTab('text');
    else if (['rectangle', 'circle', 'triangle', 'line'].includes(id)) setLeftPanelTab('shapes');
    else if (id === 'image') setLeftPanelTab('uploads');
  };

  return (
    <div className="w-14 bg-panel border-r border-panel-border flex flex-col items-center py-3 gap-1 shrink-0">
      {TOOLS.map((tool, idx) => {
        if (tool.id === 'divider') {
          return <div key={idx} className="w-8 h-px bg-panel-border my-1" />;
        }
        return (
          <button
            key={tool.id}
            title={tool.label}
            onClick={() => handleTool(tool.id as ToolMode)}
            className={`tool-btn ${toolMode === tool.id ? 'active' : ''}`}
          >
            {tool.icon}
          </button>
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
