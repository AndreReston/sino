import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useStore } from '../store/useStore';

export default function CanvasArea() {
  const { canvasRef, containerRef } = useCanvas();
  const { zoom, setZoom, fabricCanvas, canvasWidth, canvasHeight } = useStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const store = useStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        store.redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = store.fabricCanvas;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (obj) {
          canvas.remove(obj);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const canvas = store.fabricCanvas;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (obj) {
          obj.clone((cloned: any) => {
            cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
      }
      if (e.key === 'Escape') {
        store.setToolMode('select');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        useStore.getState().setZoom(useStore.getState().zoom + delta);
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-canvas-bg flex items-center justify-center relative"
      style={{ minWidth: 0, minHeight: 0 }}
    >
      {/* Grid dot pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Canvas wrapper */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease',
        }}
        className="relative canvas-shadow rounded-sm"
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-panel/80 backdrop-blur-sm border border-panel-border rounded-lg px-2 py-1.5">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors text-xs px-1"
        >
          −
        </button>
        <span className="text-xs text-zinc-400 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors text-xs px-1"
        >
          +
        </button>
      </div>

      {/* Canvas size indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-zinc-600 bg-panel/60 backdrop-blur-sm border border-panel-border/50 rounded px-2 py-1">
        {canvasWidth} × {canvasHeight}
      </div>
    </div>
  );
}
