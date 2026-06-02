import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useStore } from '../store/useStore';

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    (canvas: fabric.Canvas) => {
      return JSON.stringify(canvas.toJSON(['id', 'name']));
    },
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
    });

    setFabricCanvas(canvas);
    pushHistory(serializeCanvas(canvas));

    return () => {
      setFabricCanvas(null);
      canvas.dispose();
    };
  }, []);

  // Sync canvas size
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.setWidth(canvasWidth);
    fabricCanvas.setHeight(canvasHeight);
    fabricCanvas.renderAll();
  }, [canvasWidth, canvasHeight, fabricCanvas]);

  // Handle tool mode
  useEffect(() => {
    if (!fabricCanvas) return;

    if (toolMode === 'select') {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
    } else if (toolMode === 'pen') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush.width = 3;
      fabricCanvas.freeDrawingBrush.color = '#22c55e';
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
    }

    const handleMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
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

  return { canvasRef, containerRef };
}
