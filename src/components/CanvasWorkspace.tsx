import React, { useEffect, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useStore } from '../store/useStore';
import PageNavigator from './PageNavigator';

export default function CanvasWorkspace() {
  const { canvasRef, containerRef, guides } = useCanvas();
  const { zoom, fabricCanvas, activeObject, canvasWidth, canvasHeight } = useStore();
  const setZoom = useStore((state) => state.setZoom);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [autoFit, setAutoFit] = useState(true);

  // Keyboard shortcuts: undo/redo/delete/duplicate/bring/send/new page
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        store.addBlankPage();
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

      // Layer shortcuts: Ctrl+[ send back, Ctrl+] bring forward
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

  // Track workspace container size for fit-to-screen behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({ width: container.clientWidth, height: container.clientHeight });
    };

    updateSize();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateSize())
      : null;

    if (observer) observer.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!autoFit || !containerSize.width || !containerSize.height) return;

    const horizontalPadding = 96;
    const verticalPadding = 220;
    const availableWidth = Math.max(containerSize.width - horizontalPadding, 1);
    const availableHeight = Math.max(containerSize.height - verticalPadding, 1);
    const fitScale = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight, 1);

    if (fitScale > 0) {
      setZoom(Number(fitScale.toFixed(3)));
    }
  }, [autoFit, containerSize, canvasWidth, canvasHeight, setZoom]);

  // Ctrl+wheel zoom on container
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

  const hasSelection = !!activeObject;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-canvas-bg flex items-start justify-center relative"
      style={{ minWidth: 0, minHeight: 0 }}
    >
      {/* Grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, #52525b 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Canvas wrapper with centered viewport and top/bottom scroll padding */}
      <div className="relative my-12 mx-auto" style={{ padding: '0 48px 180px' }}>
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.1s ease' }}
        >
          <div
            className={`relative rounded-2xl overflow-hidden ${hasSelection ? 'ring-2 ring-emerald-500/30' : ''}`}
            style={{
              boxShadow: '0 8px 68px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.05)',
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              {guides.map((guide, index) => {
                const thickness = 2;
                if (guide.orientation === 'vertical') {
                  return (
                    <div key={index}>
                      {/* Vertical line */}
                      <div
                        className="absolute bg-emerald-400/80 shadow-lg"
                        style={{ left: guide.pos - thickness / 2, top: guide.start, width: thickness, height: Math.max(12, guide.end - guide.start) }}
                      />
                      {/* Label with gap value */}
                      <div
                        className="absolute rounded-full bg-emerald-500/95 text-[10px] text-white px-2 py-1 font-semibold shadow-md whitespace-nowrap"
                        style={{ left: guide.pos + 8, top: (guide.start + guide.end) / 2 - 12 }}
                      >
                        {guide.label}px
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={index}>
                    {/* Horizontal line */}
                    <div
                      className="absolute bg-emerald-400/80 shadow-lg"
                      style={{ left: guide.start, top: guide.pos - thickness / 2, width: Math.max(12, guide.end - guide.start), height: thickness }}
                    />
                    {/* Label with gap value */}
                    <div
                      className="absolute rounded-full bg-emerald-500/95 text-[10px] text-white px-2 py-1 font-semibold shadow-md whitespace-nowrap"
                      style={{ left: (guide.start + guide.end) / 2 - 24, top: guide.pos + 6 }}
                    >
                      {guide.label}px
                    </div>
                  </div>
                );
              })}
            </div>
            <canvas ref={canvasRef} className="block" style={{ width: canvasWidth, height: canvasHeight }} />
          </div>
        </div>
      </div>

      {/* Canvas metrics badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-zinc-600 bg-panel/70 backdrop-blur-sm border border-panel-border/60 rounded-full px-3 py-1.5">
        <span>{canvasWidth} × {canvasHeight}</span>
        <button
          type="button"
          onClick={() => setAutoFit((prev) => !prev)}
          className={`rounded-full px-2 py-0.5 text-[11px] transition ${autoFit ? 'bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
        >
          {autoFit ? 'Fit on' : 'Fit off'}
        </button>
      </div>

      {/* Page navigator strip */}
      <PageNavigator />
    </div>
  );
}
