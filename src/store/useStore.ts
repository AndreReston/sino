import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolMode = 'select' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'pen' | 'image';
export type SidebarTab = 'shapes' | 'text' | 'uploads' | 'templates';

export interface SavedDesign {
  id: string;
  title: string;
  pages: Array<{ page_id: string; canvas_data: any; thumbnail?: string }>;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  canvasName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasState {
  activeObjectId: string | null;
  activeObject: fabric.Object | null;
  toolMode: ToolMode;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  canvasName: string;
  fabricCanvas: fabric.Canvas | null;
  history: string[];
  historyIndex: number;
  sidebarTab: SidebarTab;
  // multi-page project
  projectId?: string;
  projectTitle?: string;
  activePageIndex: number;
  pages: Array<{ page_id: string; canvas_data: any; thumbnail?: string }>;
  selectedPageIds: string[];
  designId: string | null;
}

export interface CanvasActions {
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
  setToolMode: (mode: ToolMode) => void;
  setZoom: (zoom: number) => void;
  setActiveObject: (obj: fabric.Object | null) => void;
  setCanvasSize: (w: number, h: number) => void;
  setCanvasBackground: (color: string) => void;
  setCanvasName: (name: string) => void;
  pushHistory: (json: string) => void;
  undo: () => void;
  redo: () => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setLeftPanelTab: (tab: SidebarTab) => void; // alias kept for ToolSidebar compatibility
  // pages
  saveCurrentPage: () => void;
  setActivePageIndex: (index: number) => void;
  addBlankPage: () => void;
  duplicateCurrentPage: () => void;
  deleteCurrentPage: () => void;
  togglePageSelection: (pageId: string) => void;
  clearPageSelection: () => void;
  resetWorkspace: () => void;
  loadDesign: (design: SavedDesign) => Promise<void>;
  exportDesign: () => SavedDesign;
  exportAllAsZip: () => Promise<void>;
  exportPagesAsZip: (pageIds?: string[] | null, format?: 'png' | 'jpg') => Promise<void>;
  // alignment
  alignCenterH: () => void;
  alignCenterV: () => void;
  alignTop: () => void;
  alignBottom: () => void;
  alignLeft: () => void;
  alignRight: () => void;
}

type Store = CanvasState & CanvasActions;

/** Capture a small thumbnail from the live canvas */
function captureThumbnail(canvas: fabric.Canvas): string {
  try {
    return canvas.toDataURL({ format: 'png', quality: 0.6, multiplier: 0.15 });
  } catch {
    return '';
  }
}

export const useStore = create<Store>((set, get) => ({
  activeObjectId: null,
  activeObject: null,
  toolMode: 'select',
  zoom: 1,
  canvasWidth: 1080,
  canvasHeight: 1080,
  canvasBackground: '#ffffff',
  canvasName: 'Untitled Design',
  fabricCanvas: null,
  history: [],
  historyIndex: -1,
  sidebarTab: 'shapes',
  projectId: 'proj_local',
  projectTitle: 'Untitled Project',
  activePageIndex: 0,
  pages: [
    { page_id: 'page_1', canvas_data: null, thumbnail: '' },
  ],
  selectedPageIds: [],
  designId: null,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  togglePageSelection: (pageId) =>
    set((state) => ({
      selectedPageIds: state.selectedPageIds.includes(pageId)
        ? state.selectedPageIds.filter((id) => id !== pageId)
        : [...state.selectedPageIds, pageId],
    })),
  clearPageSelection: () => set({ selectedPageIds: [] }),
  resetWorkspace: () => {
    const blankPage = { page_id: `page_${Date.now()}`, canvas_data: null, thumbnail: '' };
    const fabricCanvas = get().fabricCanvas;
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.setWidth(1080);
      fabricCanvas.setHeight(1080);
      fabricCanvas.setBackgroundColor('#ffffff', () => fabricCanvas.renderAll());
    }
    set({
      designId: null,
      activeObjectId: null,
      activeObject: null,
      toolMode: 'select',
      zoom: 1,
      canvasWidth: 1080,
      canvasHeight: 1080,
      canvasBackground: '#ffffff',
      canvasName: 'Untitled Design',
      history: [],
      historyIndex: -1,
      sidebarTab: 'shapes',
      activePageIndex: 0,
      pages: [blankPage],
      selectedPageIds: [],
    });
  },
  setToolMode: (mode) => set({ toolMode: mode }),
  setZoom: (zoom) => set({ zoom }),
  setActiveObject: (obj) =>
    set({ activeObject: obj, activeObjectId: obj ? (obj as any).id || null : null }),
  setCanvasSize: (w, h) => set({ canvasWidth: w, canvasHeight: h }),
  setCanvasBackground: (color) => {
    const { fabricCanvas } = get();
    if (fabricCanvas) {
      fabricCanvas.setBackgroundColor(color, () => fabricCanvas.renderAll());
    }
    set({ canvasBackground: color });
  },
  setCanvasName: (name) => set({ canvasName: name }),
  exportDesign: () => {
    const { pages, canvasWidth, canvasHeight, canvasBackground, canvasName, designId } = get();
    const now = new Date().toISOString();
    return {
      id: designId ?? `design_${Date.now()}`,
      title: canvasName || 'Untitled Design',
      pages,
      canvasWidth,
      canvasHeight,
      canvasBackground,
      canvasName,
      createdAt: now,
      updatedAt: now,
    };
  },
  loadDesign: async (design) => {
    set({
      designId: design.id,
      canvasName: design.title,
      canvasWidth: design.canvasWidth,
      canvasHeight: design.canvasHeight,
      canvasBackground: design.canvasBackground,
      pages: design.pages.length ? design.pages : [{ page_id: `page_${Date.now()}`, canvas_data: null, thumbnail: '' }],
      activePageIndex: 0,
      history: [],
      historyIndex: -1,
      selectedPageIds: [],
    });

    const fabricCanvas = get().fabricCanvas;
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    fabricCanvas.setWidth(design.canvasWidth);
    fabricCanvas.setHeight(design.canvasHeight);
    fabricCanvas.setBackgroundColor(design.canvasBackground, () => {
      const page = design.pages[0];
      if (page?.canvas_data) {
        fabricCanvas.loadFromJSON(page.canvas_data, () => {
          fabricCanvas.renderAll();
          _reattachListeners(fabricCanvas);
          get().saveCurrentPage();
        });
      } else {
        fabricCanvas.renderAll();
        _reattachListeners(fabricCanvas);
        get().saveCurrentPage();
      }
    });
  },
  pushHistory: (json) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { history, historyIndex, fabricCanvas } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const json = history[newIndex];
    if (fabricCanvas && json) {
      fabricCanvas.loadFromJSON(JSON.parse(json), () => fabricCanvas.renderAll());
    }
    set({ historyIndex: newIndex });
  },
  redo: () => {
    const { history, historyIndex, fabricCanvas } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const json = history[newIndex];
    if (fabricCanvas && json) {
      fabricCanvas.loadFromJSON(JSON.parse(json), () => fabricCanvas.renderAll());
    }
    set({ historyIndex: newIndex });
  },
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setLeftPanelTab: (tab) => set({ sidebarTab: tab }), // alias

  // ── Page management ──────────────────────────────────────────────────────

  /** Snapshot the live canvas into the pages array (with thumbnail). */
  saveCurrentPage: () => {
    const { fabricCanvas, pages, activePageIndex } = get();
    if (!fabricCanvas) return;
    const json = fabricCanvas.toJSON(['id', 'name']);
    const thumbnail = captureThumbnail(fabricCanvas);
    const newPages = [...pages];
    newPages[activePageIndex] = {
      ...(newPages[activePageIndex] ?? { page_id: `page_${Date.now()}` }),
      canvas_data: json,
      thumbnail,
    };
    set({ pages: newPages });
  },

  /** Switch active page: save current → update index → load target. */
  setActivePageIndex: (index) => {
    const { fabricCanvas, pages, activePageIndex } = get();

    // 1. Persist current page (including fresh thumbnail)
    if (fabricCanvas) {
      const json = fabricCanvas.toJSON(['id', 'name']);
      const thumbnail = captureThumbnail(fabricCanvas);
      const newPages = [...pages];
      newPages[activePageIndex] = {
        ...(newPages[activePageIndex] ?? { page_id: `page_${Date.now()}` }),
        canvas_data: json,
        thumbnail,
      };
      set({ pages: newPages });
    }

    // 2. Switch index
    set({ activePageIndex: index, activeObject: null, activeObjectId: null, toolMode: 'select' });

    // 3. Load target page (read from the latest state)
    if (!fabricCanvas) return;
    const target = get().pages[index];

    fabricCanvas.off('object:added');
    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:removed');

    if (target?.canvas_data) {
      fabricCanvas.loadFromJSON(target.canvas_data, () => {
        fabricCanvas.renderAll();
        fabricCanvas.selection = true;
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.isDrawingMode = false;
        // Re-attach history listeners after load
        _reattachListeners(fabricCanvas);
      });
    } else {
      fabricCanvas.clear();
      fabricCanvas.renderAll();
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.isDrawingMode = false;
      _reattachListeners(fabricCanvas);
    }
  },

  addBlankPage: () => {
    const { pages, activePageIndex } = get();
    // Save current first
    get().saveCurrentPage();

    const newId = `page_${Date.now()}`;
    const newPage = { page_id: newId, canvas_data: null, thumbnail: '' };
    const newPages = [...get().pages]; // re-read after saveCurrentPage
    const insertAt = activePageIndex + 1;
    newPages.splice(insertAt, 0, newPage);
    set({ pages: newPages });
    // Switch (will persist current & load blank)
    get().setActivePageIndex(insertAt);
  },

  duplicateCurrentPage: () => {
    const { activePageIndex } = get();
    // Save current first so canvas_data is up to date
    get().saveCurrentPage();

    const pages = get().pages; // re-read after save
    const current = pages[activePageIndex];
    const copy = {
      page_id: `page_${Date.now()}`,
      canvas_data: current?.canvas_data ? JSON.parse(JSON.stringify(current.canvas_data)) : null,
      thumbnail: current?.thumbnail ?? '',
    };
    const newPages = [...pages];
    const insertAt = activePageIndex + 1;
    newPages.splice(insertAt, 0, copy);
    set({ pages: newPages });
    get().setActivePageIndex(insertAt);
  },

  deleteCurrentPage: () => {
    const { pages, activePageIndex, selectedPageIds } = get();
    if (pages.length <= 1) return;
    const newPages = [...pages];
    newPages.splice(activePageIndex, 1);
    const newSelected = selectedPageIds.filter((id) => newPages.some((page) => page.page_id === id));
    const newIndex = Math.max(0, activePageIndex - 1);
    set({ pages: newPages, selectedPageIds: newSelected });
    get().setActivePageIndex(newIndex);
  },

  exportAllAsZip: async () => {
    let JSZip: any;
    try {
      JSZip = (await import('jszip')).default;
    } catch {
      alert('Export All requires the `jszip` package. Run `npm install jszip` and restart.');
      return;
    }
    // Save current page first
    get().saveCurrentPage();

    const zip = new JSZip();
    const { pages, canvasWidth, canvasHeight } = get();
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const c = document.createElement('canvas');
      c.width = canvasWidth;
      c.height = canvasHeight;
      const off = new fabric.Canvas(c);
      if (p.canvas_data) {
        await new Promise<void>((res) =>
          off.loadFromJSON(p.canvas_data, () => { off.renderAll(); res(); })
        );
      }
      await new Promise((res) => setTimeout(res, 80));
      const dataUrl = off.toDataURL({ format: 'png', quality: 0.95 });
      zip.file(`${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
      off.dispose();
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${get().canvasName || 'design'}_pages.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportPagesAsZip: async (pageIds, format = 'png') => {
    let JSZip: any;
    try {
      JSZip = (await import('jszip')).default;
    } catch {
      alert('Export requires the `jszip` package. Run `npm install jszip` and restart.');
      return;
    }

    get().saveCurrentPage();
    const pages = get().pages;
    const selected = pageIds?.length
      ? pages.filter((page) => pageIds.includes(page.page_id))
      : pages;

    if (selected.length === 0) {
      alert('No pages selected for export.');
      return;
    }

    const zip = new JSZip();
    const { canvasWidth, canvasHeight } = get();

    for (let i = 0; i < selected.length; i += 1) {
      const p = selected[i];
      const c = document.createElement('canvas');
      c.width = canvasWidth;
      c.height = canvasHeight;
      const off = new fabric.Canvas(c, { renderOnAddRemove: false });

      if (p.canvas_data) {
        await new Promise<void>((res) =>
          off.loadFromJSON(p.canvas_data, () => {
            off.renderAll();
            res();
          })
        );
      } else {
        off.renderAll();
      }

      await new Promise((res) => setTimeout(res, 40));
      const dataUrl = off.toDataURL({
        format: format === 'jpg' ? 'jpeg' : 'png',
        quality: 0.95,
      });
      zip.file(`${i + 1}.${format}`, dataUrl.split(',')[1], { base64: true });
      off.dispose();
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    const label = pageIds?.length ? `${pageIds.length}_page_export` : 'all_pages_export';
    a.download = `${get().canvasName || 'design'}_${label}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },

  alignCenterH: () => {
    const { activeObject, fabricCanvas, canvasWidth } = get();
    if (!activeObject || !fabricCanvas) return;
    const objWidth = (activeObject.width || 0) * (activeObject.scaleX || 1);
    activeObject.set({ left: (canvasWidth - objWidth) / 2 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },

  alignCenterV: () => {
    const { activeObject, fabricCanvas, canvasHeight } = get();
    if (!activeObject || !fabricCanvas) return;
    const objHeight = (activeObject.height || 0) * (activeObject.scaleY || 1);
    activeObject.set({ top: (canvasHeight - objHeight) / 2 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },

  alignTop: () => {
    const { activeObject, fabricCanvas } = get();
    if (!activeObject || !fabricCanvas) return;
    activeObject.set({ top: 0 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },

  alignBottom: () => {
    const { activeObject, fabricCanvas, canvasHeight } = get();
    if (!activeObject || !fabricCanvas) return;
    const objHeight = (activeObject.height || 0) * (activeObject.scaleY || 1);
    activeObject.set({ top: canvasHeight - objHeight });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },

  alignLeft: () => {
    const { activeObject, fabricCanvas } = get();
    if (!activeObject || !fabricCanvas) return;
    activeObject.set({ left: 0 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },

  alignRight: () => {
    const { activeObject, fabricCanvas, canvasWidth } = get();
    if (!activeObject || !fabricCanvas) return;
    const objWidth = (activeObject.width || 0) * (activeObject.scaleX || 1);
    activeObject.set({ left: canvasWidth - objWidth });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(['id', 'name'])));
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: re-attach the history / selection listeners after a page
// load (because loadFromJSON fires 'object:added' for every object, which
// would pollute the undo stack with the loaded state).
// ─────────────────────────────────────────────────────────────────────────────
function _reattachListeners(canvas: fabric.Canvas) {
  const serialize = () => JSON.stringify(canvas.toJSON(['id', 'name']));

  canvas.on('object:added', (e) => {
    const obj = e.target as any;
    if (!obj.id) {
      obj.id = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }
    useStore.getState().pushHistory(serialize());
  });
  canvas.on('object:modified', () => useStore.getState().pushHistory(serialize()));
  canvas.on('object:removed', () => useStore.getState().pushHistory(serialize()));
  canvas.on('selection:created', (e: any) => useStore.getState().setActiveObject(e.selected?.[0] || null));
  canvas.on('selection:updated', (e: any) => useStore.getState().setActiveObject(e.selected?.[0] || null));
  canvas.on('selection:cleared', () => useStore.getState().setActiveObject(null));
}
