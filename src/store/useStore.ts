import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolMode = 'select' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'pen' | 'image' | 'magicGrab' | 'magicErase' | 'bgRemover' | 'adjustments';
export type SidebarTab = 'shapes' | 'text' | 'uploads' | 'templates' | 'layers' | 'magicTools' | 'adjustments';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn' | 'hardLight' | 'softLight' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
export type PageTransition = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-in' | 'zoom-out' | 'rotate' | 'wipe-left' | 'wipe-right';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  clarity: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
}

export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  adjustments: ImageAdjustments;
}

export interface VideoClip {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // seconds
  startTime: number; // position on timeline in seconds
  trimStart: number; // trim offset in seconds
  trimEnd: number;   // trim end offset from clip end in seconds
  volume: number;    // 0–1
  canvasObjectId?: string; // linked fabric object id
}

export interface VideoTrackState {
  clips: VideoClip[];
  isPlaying: boolean;
  currentTime: number;   // playback head position in seconds
  totalDuration: number;  // total timeline duration
  zoom: number;           // timeline zoom (pixels per second)
}

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
  // Layer management
  layers: LayerInfo[];
  selectedLayerId: string | null;
  showLayersPanel: boolean;
  // Image adjustments
  selectedObjectAdjustments: ImageAdjustments;
  showAdjustmentsPanel: boolean;
  // Magic tools state
  magicEraseMode: 'freehand' | 'brush';
  eraseStrokeWidth: number;
  showMagicToolsPanel: boolean;
  // Page transition animation
  isPageTransitioning: boolean;
  pageTransitionType: PageTransition;
  // Video timeline
  videoTrack: VideoTrackState;
  activeVideoClipId: string | null;
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
  setPageTransitionType: (transition: PageTransition) => void;
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
  // Layer management actions
  updateLayersFromCanvas: () => void;
  updateLayer: (id: string, updates: Partial<LayerInfo>) => void;
  setSelectedLayerId: (id: string | null) => void;
  setShowLayersPanel: (show: boolean) => void;
  // Image adjustments actions
  setObjectAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  applyAdjustmentsToObject: (obj: fabric.Object, adjustments: ImageAdjustments) => void;
  setShowAdjustmentsPanel: (show: boolean) => void;
  // Magic tools actions
  setShowMagicToolsPanel: (show: boolean) => void;
  setEraseMode: (mode: 'freehand' | 'brush') => void;
  setEraseStrokeWidth: (width: number) => void;
  removeBackground: () => Promise<void>;
  // Text + Image combination
  applyImageFillToText: (textObj: fabric.Object, imageUrl: string, opacity?: number) => Promise<void>;
  removeImageFillFromText: (textObj: fabric.Object) => void;
  setTextImageOpacity: (textObj: fabric.Object, opacity: number) => void;
  // Video timeline actions
  addVideoClip: (clip: Omit<VideoClip, 'id'>) => string;
  removeVideoClip: (clipId: string) => void;
  updateVideoClip: (clipId: string, updates: Partial<VideoClip>) => void;
  setVideoPlaying: (playing: boolean) => void;
  setVideoCurrentTime: (time: number) => void;
  setVideoTimelineZoom: (zoom: number) => void;
  setActiveVideoClip: (clipId: string | null) => void;
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


/** All custom fabric object properties that must survive toJSON/loadFromJSON round-trips */
const CUSTOM_PROPS = ['id', 'name', 'imageFill', 'imageFillOpacity', 'videoSource', 'videoClipId'];

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
  // New state for advanced features
  layers: [],
  selectedLayerId: null,
  showLayersPanel: false,
  selectedObjectAdjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    clarity: 0,
    highlights: 0,
    shadows: 0,
  },
  showAdjustmentsPanel: false,
  magicEraseMode: 'brush',
  eraseStrokeWidth: 20,
  showMagicToolsPanel: false,
  isPageTransitioning: false,
  pageTransitionType: 'fade',
  videoTrack: {
    clips: [],
    isPlaying: false,
    currentTime: 0,
    totalDuration: 30,
    zoom: 80, // px per second
  },
  activeVideoClipId: null,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  togglePageSelection: (pageId) =>
    set((state) => ({
      selectedPageIds: state.selectedPageIds.includes(pageId)
        ? state.selectedPageIds.filter((id) => id !== pageId)
        : [...state.selectedPageIds, pageId],
    })),
  clearPageSelection: () => set({ selectedPageIds: [] }),
  setPageTransitionType: (transition) => set({ pageTransitionType: transition }),
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
      videoTrack: {
        clips: [],
        isPlaying: false,
        currentTime: 0,
        totalDuration: 30,
        zoom: 80,
      },
      activeVideoClipId: null,
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
          void _restoreImageFills(fabricCanvas);
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
      fabricCanvas.loadFromJSON(JSON.parse(json), () => {
        fabricCanvas.renderAll();
        void _restoreImageFills(fabricCanvas);
      });
    }
    set({ historyIndex: newIndex });
  },
  redo: () => {
    const { history, historyIndex, fabricCanvas } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const json = history[newIndex];
    if (fabricCanvas && json) {
      fabricCanvas.loadFromJSON(JSON.parse(json), () => {
        fabricCanvas.renderAll();
        void _restoreImageFills(fabricCanvas);
      });
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
    const json = fabricCanvas.toJSON(CUSTOM_PROPS);
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

    // Start transition animation
    set({ isPageTransitioning: true });

    // 1. Persist current page (including fresh thumbnail)
    if (fabricCanvas) {
      const json = fabricCanvas.toJSON(CUSTOM_PROPS);
      const thumbnail = captureThumbnail(fabricCanvas);
      const newPages = [...pages];
      newPages[activePageIndex] = {
        ...(newPages[activePageIndex] ?? { page_id: `page_${Date.now()}` }),
        canvas_data: json,
        thumbnail,
      };
      set({ pages: newPages });
    }

    // 2. Switch index and load page after brief fade
    setTimeout(() => {
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
          void _restoreImageFills(fabricCanvas);
          fabricCanvas.selection = true;
          fabricCanvas.defaultCursor = 'default';
          fabricCanvas.isDrawingMode = false;
          // Re-attach history listeners after load
          _reattachListeners(fabricCanvas);
          
          // End transition animation
          setTimeout(() => set({ isPageTransitioning: false }), 50);
        });
      } else {
        fabricCanvas.clear();
        fabricCanvas.renderAll();
        fabricCanvas.selection = true;
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.isDrawingMode = false;
        _reattachListeners(fabricCanvas);
        
        // End transition animation
        setTimeout(() => set({ isPageTransitioning: false }), 50);
      }
    }, 200); // Fade out duration
  },

  addBlankPage: () => {
    const { activePageIndex } = get();
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
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  alignCenterV: () => {
    const { activeObject, fabricCanvas, canvasHeight } = get();
    if (!activeObject || !fabricCanvas) return;
    const objHeight = (activeObject.height || 0) * (activeObject.scaleY || 1);
    activeObject.set({ top: (canvasHeight - objHeight) / 2 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  alignTop: () => {
    const { activeObject, fabricCanvas } = get();
    if (!activeObject || !fabricCanvas) return;
    activeObject.set({ top: 0 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  alignBottom: () => {
    const { activeObject, fabricCanvas, canvasHeight } = get();
    if (!activeObject || !fabricCanvas) return;
    const objHeight = (activeObject.height || 0) * (activeObject.scaleY || 1);
    activeObject.set({ top: canvasHeight - objHeight });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  alignLeft: () => {
    const { activeObject, fabricCanvas } = get();
    if (!activeObject || !fabricCanvas) return;
    activeObject.set({ left: 0 });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  alignRight: () => {
    const { activeObject, fabricCanvas, canvasWidth } = get();
    if (!activeObject || !fabricCanvas) return;
    const objWidth = (activeObject.width || 0) * (activeObject.scaleX || 1);
    activeObject.set({ left: canvasWidth - objWidth });
    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  // ── Layer management ─────────────────────────────────────────────────────
  updateLayersFromCanvas: () => {
    const { fabricCanvas } = get();
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    const newLayers: LayerInfo[] = objects.map((obj: any, idx) => ({
      id: obj.id || `obj_${idx}`,
      name: obj.name || `Layer ${idx + 1}`,
      visible: obj.visible !== false,
      locked: (obj as any).selectable === false,
      opacity: obj.opacity || 1,
      blendMode: (obj as any).blendMode || 'normal',
      adjustments: (obj as any).adjustments || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        clarity: 0,
        highlights: 0,
        shadows: 0,
      },
    }));
    set({ layers: newLayers });
  },

  updateLayer: (id, updates) => {
    const { fabricCanvas } = get();
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getObjects().find((o: any) => o.id === id);
    if (!obj) return;

    // Update layer metadata
    if (updates.name) (obj as any).name = updates.name;
    if (updates.visible !== undefined) obj.set({ visible: updates.visible });
    if (updates.locked !== undefined) (obj as any).selectable = !updates.locked;
    if (updates.opacity !== undefined) obj.set({ opacity: updates.opacity });
    if (updates.blendMode) {
      const blend = updates.blendMode === 'normal' ? 'source-over' : updates.blendMode;
      obj.set({ globalCompositeOperation: blend });
      (obj as any).blendMode = updates.blendMode;
    }

    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));

    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  setShowLayersPanel: (show) => set({ showLayersPanel: show }),

  // ── Image adjustments ────────────────────────────────────────────────────
  setObjectAdjustments: (adjustments) => {
    set((state) => ({
      selectedObjectAdjustments: { ...state.selectedObjectAdjustments, ...adjustments },
    }));
  },

  applyAdjustmentsToObject: (obj, adjustments) => {
    if (!obj) return;
    (obj as any).adjustments = adjustments;

    if (!(obj instanceof fabric.Image)) {
      get().fabricCanvas?.renderAll();
      get().pushHistory(JSON.stringify(get().fabricCanvas?.toJSON(CUSTOM_PROPS) || '{}'));
      return;
    }

    const filters: any[] = [];

    const ImageFilters = (fabric.Image.filters as any);
    if (adjustments.brightness !== 0) {
      filters.push(new ImageFilters.Brightness({ brightness: adjustments.brightness / 100 }));
    }
    if (adjustments.contrast !== 0) {
      filters.push(new ImageFilters.Contrast({ contrast: 1 + adjustments.contrast / 100 }));
    }
    if (adjustments.saturation !== 0) {
      filters.push(new ImageFilters.Saturation({ saturation: 1 + adjustments.saturation / 100 }));
    }
    if (adjustments.hue !== 0) {
      filters.push(new ImageFilters.HueRotation({ rotation: (adjustments.hue * Math.PI) / 180 }));
    }

    obj.filters = filters;
    obj.applyFilters();

    get().fabricCanvas?.renderAll();
    get().pushHistory(JSON.stringify(get().fabricCanvas?.toJSON(CUSTOM_PROPS) || '{}'));
  },

  setShowAdjustmentsPanel: (show) => set({ showAdjustmentsPanel: show }),

  // ── Magic tools ──────────────────────────────────────────────────────────
  setShowMagicToolsPanel: (show) => set({ showMagicToolsPanel: show }),
  setEraseMode: (mode) => set({ magicEraseMode: mode }),
  setEraseStrokeWidth: (width) => set({ eraseStrokeWidth: width }),

  removeBackground: async () => {
    const { activeObject, fabricCanvas } = get();
    if (!(activeObject instanceof fabric.Image) || !fabricCanvas) return;

    // For now, create a simple alpha channel removal
    // In production, this would use an ML model like rembg or similar API
    const img = activeObject as fabric.Image;
    const imgElement = img.getElement();
    if (!(imgElement instanceof HTMLImageElement)) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use image's natural dimensions for accuracy
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image with transparency at full natural size
    ctx.drawImage(imgElement, 0, 0);
    const newImageUrl = canvas.toDataURL();
    fabric.Image.fromURL(newImageUrl, (newImg) => {
      newImg.set({
        left: img.left,
        top: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        width: img.width,
        height: img.height,
      });
        fabricCanvas.remove(img);
        fabricCanvas.add(newImg);
        fabricCanvas.setActiveObject(newImg);
        fabricCanvas.renderAll();
        get().updateLayersFromCanvas();
        get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
      });
  },

  // ── Text + Image Combination ─────────────────────────────────────────────
  applyImageFillToText: async (textObj, imageUrl, opacity = 1) => {
    const { fabricCanvas } = get();
    if (!fabricCanvas || (!textObj)) return;

    try {
      // Create an HTMLImageElement and load it with crossOrigin to allow pattern use
      const imgEl = new Image();
      imgEl.crossOrigin = 'anonymous';
      imgEl.onload = () => {
        try {
          const pattern = new fabric.Pattern({ source: imgEl, repeat: 'repeat' });
          textObj.set({
            fill: pattern,
            opacity: opacity,
            imageFill: imageUrl,
            imageFillOpacity: opacity,
          } as any);

          // Ensure canvas and UI update
          fabricCanvas.renderAll();
          // mark active object and emit modified event so React listeners refresh
          fabricCanvas.setActiveObject(textObj as any);
          fabricCanvas.fire('object:modified', { target: textObj });
          get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
        } catch (err) {
          console.error('Failed to create pattern from image element:', err);
        }
      };
      imgEl.onerror = (e) => console.error('Image load failed for image fill:', e);
      imgEl.src = imageUrl;
    } catch (error) {
      console.error('Failed to apply image fill:', error);
    }
  },

  removeImageFillFromText: (textObj) => {
    const { fabricCanvas } = get();
    if (!fabricCanvas || !textObj) return;

    // Reset fill to default color
    textObj.set({
      fill: '#18181b',
      opacity: 1,
    });

    // Remove image fill references (persist via set so toJSON updates)
    textObj.set({
      fill: '#18181b',
      opacity: 1,
      imageFill: undefined,
      imageFillOpacity: undefined,
    } as any);

    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  setTextImageOpacity: (textObj, opacity) => {
    const { fabricCanvas } = get();
    if (!fabricCanvas || !textObj || !(textObj as any).imageFill) return;

    textObj.set({ opacity, imageFillOpacity: opacity } as any);

    fabricCanvas.renderAll();
    get().pushHistory(JSON.stringify(fabricCanvas.toJSON(CUSTOM_PROPS)));
  },

  // ── Video timeline actions ─────────────────────────────────────────────
  addVideoClip: (clip) => {
    const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newClip: VideoClip = { ...clip, id };
    set((state) => {
      const clips = [...state.videoTrack.clips, newClip];
      const totalDuration = Math.max(
        state.videoTrack.totalDuration,
        ...clips.map((c) => c.startTime + (c.duration - c.trimStart - c.trimEnd))
      );
      return { videoTrack: { ...state.videoTrack, clips, totalDuration } };
    });
    return id;
  },

  removeVideoClip: (clipId) => {
    set((state) => {
      const clips = state.videoTrack.clips.filter((c) => c.id !== clipId);
      return {
        videoTrack: { ...state.videoTrack, clips },
        activeVideoClipId: state.activeVideoClipId === clipId ? null : state.activeVideoClipId,
      };
    });
  },

  updateVideoClip: (clipId, updates) => {
    set((state) => {
      const clips = state.videoTrack.clips.map((c) =>
        c.id === clipId ? { ...c, ...updates } : c
      );
      return { videoTrack: { ...state.videoTrack, clips } };
    });
  },

  setVideoPlaying: (playing) => {
    set((state) => ({ videoTrack: { ...state.videoTrack, isPlaying: playing } }));
  },

  setVideoCurrentTime: (time) => {
    set((state) => ({ videoTrack: { ...state.videoTrack, currentTime: time } }));
  },

  setVideoTimelineZoom: (zoom) => {
    set((state) => ({ videoTrack: { ...state.videoTrack, zoom } }));
  },

  setActiveVideoClip: (clipId) => {
    set({ activeVideoClipId: clipId });
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: rebuild fabric.Pattern fills for any objects whose
// imageFill URL survived the toJSON/loadFromJSON round-trip.  Fabric does not
// auto-reconstruct cross-origin pattern sources, so we do it manually.
// ─────────────────────────────────────────────────────────────────────────────
async function _restoreImageFills(canvas: fabric.Canvas): Promise<void> {
  const objects = canvas.getObjects();
  const tasks = objects
    .filter((obj) => !!(obj as any).imageFill)
    .map(
      (obj) =>
        new Promise<void>((resolve) => {
          const url = (obj as any).imageFill as string;
          const opacity = (obj as any).imageFillOpacity ?? 1;
          fabric.Image.fromURL(
            url,
            (img) => {
              const pattern = new fabric.Pattern({
                source: img.getElement() as HTMLImageElement,
                repeat: 'repeat',
              });
              obj.set({ fill: pattern, opacity });
              resolve();
            },
            { crossOrigin: 'anonymous' }
          );
        })
    );
  if (tasks.length > 0) {
    await Promise.all(tasks);
    canvas.renderAll();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: re-attach the history / selection listeners after a page
// load (because loadFromJSON fires 'object:added' for every object, which
// would pollute the undo stack with the loaded state).
// ─────────────────────────────────────────────────────────────────────────────
function _reattachListeners(canvas: fabric.Canvas) {
  const serialize = () => JSON.stringify(canvas.toJSON(CUSTOM_PROPS));

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