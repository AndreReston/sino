import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useStore } from '../store/useStore';
import PageNavigator from './PageNavigator';

export default function Workspace() {
  const { canvasRef, containerRef } = useCanvas();
  const { zoom, setZoom, canvasWidth, canvasHeight } = useStore();

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const store = useStore.getState();

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        store.redo();
      }

      // New page: Ctrl+Shift+N
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        store.addBlankPage();
      }

      // Delete selected object
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

      // Duplicate: Ctrl+D
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

      // Layer order: Ctrl+[ / Ctrl+]
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        const canvas = store.fabricCanvas;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) { canvas.sendBackwards(obj); canvas.renderAll(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        const canvas = store.fabricCanvas;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) { canvas.bringForward(obj); canvas.renderAll(); }
      }

      if (e.key === 'Escape') {
        store.setToolMode('select');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Ctrl+wheel zoom ─────────────────────────────────────────────────────
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
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-canvas-bg flex items-start justify-center relative"
      style={{ minWidth: 0, minHeight: 0 }}
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #52525b 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Canvas wrapper — extra bottom padding so the page strip doesn't overlap */}
      <div className="relative my-12 mx-auto" style={{ padding: '0 48px 120px' }}>
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.1s ease',
          }}
        >
          <div
            className="relative rounded-sm overflow-hidden"
            style={{
              boxShadow: '0 4px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Canvas dimensions badge */}
      <div className="absolute bottom-[110px] left-4 text-xs text-zinc-600 bg-panel/70 backdrop-blur-sm border border-panel-border/60 rounded-lg px-3 py-1.5 pointer-events-none">
        {canvasWidth} × {canvasHeight}
      </div>

      {/* Page navigator strip */}
      <PageNavigator />
    </div>
  );
}
