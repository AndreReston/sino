import { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';
import { useStore } from '../store/useStore';

type GuideLine = {
  orientation: 'vertical' | 'horizontal';
  pos: number;
  start: number;
  end: number;
  label: string;
};

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const {
    setFabricCanvas,
    setActiveObject,
    pushHistory,
    toolMode,
    canvasWidth,
    canvasHeight,
    canvasBackground,
    fabricCanvas,
  } = useStore();

  const serializeCanvas = useCallback(
    (canvas: fabric.Canvas) => JSON.stringify(canvas.toJSON(['id', 'name'])),
    []
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBackground,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    // Assign unique ids to new objects
    canvas.on('object:added', (e) => {
      const obj = e.target as any;
      if (!obj.id) {
        obj.id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }
      pushHistory(serializeCanvas(canvas));
    });

    canvas.on('object:modified', () => {
      pushHistory(serializeCanvas(canvas));
    });

    canvas.on('object:removed', () => {
      pushHistory(serializeCanvas(canvas));
    });

    canvas.on('selection:created', (e) => {
      setActiveObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setActiveObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setActiveObject(null);
      setGuides([]);
    });

    const clearGuides = () => setGuides([]);

    const updateGuides = (opt: any) => {
      const target = opt.target as fabric.Object | null;
      if (!target) {
        setGuides([]);
        return;
      }

      const movingRect = target.getBoundingRect(true);
      const verticalCandidates: Array<{ gap: number; x: number; start: number; end: number; label: string }> = [];
      const horizontalCandidates: Array<{ gap: number; y: number; start: number; end: number; label: string }> = [];

      canvas.getObjects().forEach((obj) => {
        if (obj === target || !obj.visible) return;
        const otherRect = obj.getBoundingRect(true);

        const verticalOverlap = Math.max(0, Math.min(movingRect.top + movingRect.height, otherRect.top + otherRect.height) - Math.max(movingRect.top, otherRect.top));
        if (verticalOverlap > 16) {
          if (otherRect.left >= movingRect.left + movingRect.width) {
            const gap = otherRect.left - (movingRect.left + movingRect.width);
            verticalCandidates.push({
              gap,
              x: movingRect.left + movingRect.width + gap / 2,
              start: Math.max(movingRect.top, otherRect.top),
              end: Math.min(movingRect.top + movingRect.height, otherRect.top + otherRect.height),
              label: `${Math.round(gap)}`,
            });
          } else if (movingRect.left >= otherRect.left + otherRect.width) {
            const gap = movingRect.left - (otherRect.left + otherRect.width);
            verticalCandidates.push({
              gap,
              x: otherRect.left + otherRect.width + gap / 2,
              start: Math.max(movingRect.top, otherRect.top),
              end: Math.min(movingRect.top + movingRect.height, otherRect.top + otherRect.height),
              label: `${Math.round(gap)}`,
            });
          }
        }

        const horizontalOverlap = Math.max(0, Math.min(movingRect.left + movingRect.width, otherRect.left + otherRect.width) - Math.max(movingRect.left, otherRect.left));
        if (horizontalOverlap > 16) {
          if (otherRect.top >= movingRect.top + movingRect.height) {
            const gap = otherRect.top - (movingRect.top + movingRect.height);
            horizontalCandidates.push({
              gap,
              y: movingRect.top + movingRect.height + gap / 2,
              start: Math.max(movingRect.left, otherRect.left),
              end: Math.min(movingRect.left + movingRect.width, otherRect.left + otherRect.width),
              label: `${Math.round(gap)}`,
            });
          } else if (movingRect.top >= otherRect.top + otherRect.height) {
            const gap = movingRect.top - (otherRect.top + otherRect.height);
            horizontalCandidates.push({
              gap,
              y: otherRect.top + otherRect.height + gap / 2,
              start: Math.max(movingRect.left, otherRect.left),
              end: Math.min(movingRect.left + movingRect.width, otherRect.left + otherRect.width),
              label: `${Math.round(gap)}`,
            });
          }
        }
      });

      const guides: GuideLine[] = [];
      const bestVertical = verticalCandidates.sort((a, b) => a.gap - b.gap)[0];
      const bestHorizontal = horizontalCandidates.sort((a, b) => a.gap - b.gap)[0];

      if (bestVertical && bestVertical.gap > 0) {
        guides.push({
          orientation: 'vertical',
          pos: bestVertical.x,
          start: bestVertical.start,
          end: bestVertical.end,
          label: bestVertical.label,
        });
      }
      if (bestHorizontal && bestHorizontal.gap > 0) {
        guides.push({
          orientation: 'horizontal',
          pos: bestHorizontal.y,
          start: bestHorizontal.start,
          end: bestHorizontal.end,
          label: bestHorizontal.label,
        });
      }

      setGuides(guides);
    };

    canvas.on('object:moving', updateGuides);
    canvas.on('object:scaling', updateGuides);
    canvas.on('mouse:up', clearGuides);

    setFabricCanvas(canvas);
    const store = useStore.getState();
    const initialPage = store.pages[store.activePageIndex];

    if (initialPage?.canvas_data) {
      canvas.loadFromJSON(initialPage.canvas_data, () => {
        canvas.renderAll();
        store.saveCurrentPage();
      });
    } else {
      pushHistory(serializeCanvas(canvas));
      setTimeout(() => {
        const currentStore = useStore.getState();
        if (currentStore.saveCurrentPage) currentStore.saveCurrentPage();
      }, 0);
    }

    return () => {
      // S9: Remove event listeners before disposing canvas to prevent memory leaks
      canvas.off('object:moving', updateGuides);
      canvas.off('object:scaling', updateGuides);
      canvas.off('mouse:up', clearGuides);
      setFabricCanvas(null);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync canvas size
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.setWidth(canvasWidth);
    fabricCanvas.setHeight(canvasHeight);
    fabricCanvas.renderAll();
  }, [canvasWidth, canvasHeight, fabricCanvas]);

  // Handle tool mode and shape placement
  useEffect(() => {
    if (!fabricCanvas) return;

    if (toolMode === 'select') {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
    } else if (toolMode === 'pen') {
      fabricCanvas.isDrawingMode = true;
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      }
      fabricCanvas.freeDrawingBrush.width = 3;
      fabricCanvas.freeDrawingBrush.color = '#22c55e';
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
    }

    const handleMouseDown = (opt: any) => {
      if (toolMode === 'select' || toolMode === 'pen') return;

      const pointer = fabricCanvas.getPointer(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      let obj: fabric.Object | null = null;

      if (toolMode === 'rectangle') {
        obj = new fabric.Rect({
          left: x - 60,
          top: y - 40,
          width: 120,
          height: 80,
          fill: '#3f3f46',
          stroke: '#22c55e',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        });
      } else if (toolMode === 'circle') {
        obj = new fabric.Circle({
          left: x - 50,
          top: y - 50,
          radius: 50,
          fill: '#3f3f46',
          stroke: '#22c55e',
          strokeWidth: 2,
        });
      } else if (toolMode === 'triangle') {
        obj = new fabric.Triangle({
          left: x - 50,
          top: y - 50,
          width: 100,
          height: 100,
          fill: '#3f3f46',
          stroke: '#22c55e',
          strokeWidth: 2,
        });
      } else if (toolMode === 'line') {
        obj = new fabric.Line([x, y, x + 120, y], {
          stroke: '#22c55e',
          strokeWidth: 3,
          strokeLineCap: 'round',
        });
      } else if (toolMode === 'text') {
        const textbox = new fabric.Textbox('Click to edit', {
          left: x,
          top: y,
          width: 200,
          fontSize: 32,
          fontFamily: 'Inter, sans-serif',
          fill: '#fafafa',
          editable: true,
        });
        obj = textbox;
      }

      if (obj) {
        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        useStore.getState().setToolMode('select');
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
    };
  }, [toolMode, fabricCanvas]);

  return { canvasRef, containerRef, guides };
}
