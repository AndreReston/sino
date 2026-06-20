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
    brushColor,
    brushSize,
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
    const onObjectAdded = (e: any) => {
      const obj = e.target as any;
      if (!obj.id) {
        obj.id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }
      pushHistory(serializeCanvas(canvas));
    };
    const onObjectModified = () => { pushHistory(serializeCanvas(canvas)); };
    const onObjectRemoved = () => { pushHistory(serializeCanvas(canvas)); };
    const onSelectionCreated = (e: any) => { setActiveObject(e.selected?.[0] || null); };
    const onSelectionUpdated = (e: any) => { setActiveObject(e.selected?.[0] || null); };
    const onSelectionCleared = () => { setActiveObject(null); setGuides([]); };

    canvas.on('object:added', onObjectAdded);
    canvas.on('object:modified', onObjectModified);
    canvas.on('object:removed', onObjectRemoved);
    canvas.on('selection:created', onSelectionCreated);
    canvas.on('selection:updated', onSelectionUpdated);
    canvas.on('selection:cleared', onSelectionCleared);

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
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:modified', onObjectModified);
      canvas.off('object:removed', onObjectRemoved);
      canvas.off('selection:created', onSelectionCreated);
      canvas.off('selection:updated', onSelectionUpdated);
      canvas.off('selection:cleared', onSelectionCleared);
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
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = brushColor;
    } else if (toolMode === 'magicErase') {
      fabricCanvas.isDrawingMode = true;
      if (!fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      }
      fabricCanvas.freeDrawingBrush.width = 40;
      // Try to set composite operation to destination-out to emulate eraser
      try {
        // @ts-expect-error: fabric brush may support globalCompositeOperation
        fabricCanvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
      } catch (e) {
        // ignore if not supported
      }
      fabricCanvas.defaultCursor = 'crosshair';
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
    }

    const handleMouseDown = (opt: any) => {
      if (toolMode === 'select' || toolMode === 'pen') return;

      // Magic Grab: pick the topmost object under pointer and activate it
      if (toolMode === 'magicGrab') {
        const pointer = fabricCanvas.getPointer(opt.e);
        const objects = fabricCanvas.getObjects().slice().reverse();
        let picked: fabric.Object | null = null;
        for (const o of objects) {
          try {
            if ((o as any).containsPoint) {
              if ((o as any).containsPoint(new fabric.Point(pointer.x, pointer.y))) {
                picked = o;
                break;
              }
            } else {
              const r = o.getBoundingRect(true);
              if (pointer.x >= r.left && pointer.x <= r.left + r.width && pointer.y >= r.top && pointer.y <= r.top + r.height) {
                picked = o;
                break;
              }
            }
          } catch (e) {
            // ignore
          }
        }
        if (picked) {
          fabricCanvas.setActiveObject(picked as any);
          setActiveObject(picked as any);
          pushHistory(serializeCanvas(fabricCanvas));
        }
        // switch back to select after grabbing
        useStore.getState().setToolMode('select');
        return;
      }

      const pointer = fabricCanvas.getPointer(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      // Magic Erase: start raster erasing if clicking on an image
      if (toolMode === 'magicErase') {
        const objs = fabricCanvas.getObjects().slice().reverse();
        const target = objs.find(o => {
          if (!o.visible) return false;
          const r = o.getBoundingRect(true);
          return x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height;
        });
        if (target && (target as any).type === 'image') {
          const imgObj = target as fabric.Image;
          const el = imgObj.getElement();
          if (el instanceof HTMLImageElement) {
            const off = document.createElement('canvas');
            off.width = el.naturalWidth || el.width || 1;
            off.height = el.naturalHeight || el.height || 1;
            const ctx = off.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, off.width, off.height);
            ctx.drawImage(el, 0, 0, off.width, off.height);

            (fabricCanvas as any).__eraseSession = { image: imgObj, canvas: off, ctx };
          }
        }
        return;
      }

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

      const handleMouseMove = (opt: any) => {
        if (toolMode !== 'magicErase') return;
        const session = (fabricCanvas as any).__eraseSession;
        if (!session) return;
        const imgObj: fabric.Image = session.image;
        const { ctx, canvas: off } = session;
        const pointer = fabricCanvas.getPointer(opt.e);
        const ix = Math.round(((pointer.x - (imgObj.left || 0)) / ((imgObj.width || 1) * (imgObj.scaleX || 1))) * off.width);
        const iy = Math.round(((pointer.y - (imgObj.top || 0)) / ((imgObj.height || 1) * (imgObj.scaleY || 1))) * off.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(ix, iy, Math.max(8, 16), 0, Math.PI * 2);
        ctx.fill();
        // preview by updating element src
        try {
          const url = off.toDataURL();
          (imgObj.getElement() as HTMLImageElement).src = url;
          imgObj.setSrc(url, () => { fabricCanvas.requestRenderAll(); });
        } catch (e) { /* ignore */ }
      };

      const handleMouseUp = (opt: any) => {
        if (toolMode !== 'magicErase') return;
        const session = (fabricCanvas as any).__eraseSession;
        if (!session) return;
        const imgObj: fabric.Image = session.image;
        const off: HTMLCanvasElement = session.canvas;
        const dataUrl = off.toDataURL();
        fabric.Image.fromURL(dataUrl, (newImg) => {
          newImg.set({ left: imgObj.left, top: imgObj.top, scaleX: imgObj.scaleX, scaleY: imgObj.scaleY, width: imgObj.width, height: imgObj.height, angle: imgObj.angle });
          fabricCanvas.remove(imgObj);
          fabricCanvas.add(newImg);
          fabricCanvas.setActiveObject(newImg);
          fabricCanvas.renderAll();
          pushHistory(serializeCanvas(fabricCanvas));
        });
        delete (fabricCanvas as any).__eraseSession;
      };

    const onToolMouseUp = (opt: any) => {
      if (toolMode === 'magicErase') {
        // push history after erasing strokes
        pushHistory(serializeCanvas(fabricCanvas));
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('mouse:up', onToolMouseUp);
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:up', onToolMouseUp);
    };
  }, [toolMode, fabricCanvas, brushColor, brushSize]);

  return { canvasRef, containerRef, guides };
}
