import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolMode = 'select' | 'text' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'pen' | 'image';
export type SidebarTab = 'shapes' | 'text' | 'uploads' | 'templates';

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
}

export interface CanvasActions {
  setFabricCanvas: (canvas: fabric.Canvas) => void;
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
}

type Store = CanvasState & CanvasActions;

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

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setToolMode: (mode) => set({ toolMode: mode }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
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
}));
