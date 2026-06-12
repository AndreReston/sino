import { useEffect, useRef, useCallback } from 'react';
import { Plus, Copy, Trash2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

/**
 * Canva-style page strip — fixed at the bottom of the workspace.
 *
 * Key fixes vs. the original:
 *  1. Thumbnails come from the stored `thumbnail` field (set on every
 *     saveCurrentPage call), so they never require an off-screen fabric
 *     canvas render, which was causing blank images.
 *  2. The active page is indicated by a bright ring + page number badge.
 *  3. Add / Duplicate / Delete buttons live inside the strip.
 *  4. The current page thumbnail refreshes automatically whenever the
 *     fabricCanvas fires object:added / object:modified / object:removed.
 */
export default function PageNavigator() {
  const {
    pages,
    activePageIndex,
    selectedPageIds,
    setActivePageIndex,
    addBlankPage,
    duplicateCurrentPage,
    deleteCurrentPage,
    togglePageSelection,
    clearPageSelection,
    fabricCanvas,
    pageTransitionType,
    setPageTransitionType,
  } = useStore();

  // Refresh the thumbnail of the active page periodically while the user edits.
  const thumbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleThumbnailUpdate = useCallback(() => {
    if (thumbTimerRef.current) clearTimeout(thumbTimerRef.current);
    thumbTimerRef.current = setTimeout(() => {
      useStore.getState().saveCurrentPage();
    }, 600); // debounce 600 ms after last change
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.on('object:added', scheduleThumbnailUpdate);
    fabricCanvas.on('object:modified', scheduleThumbnailUpdate);
    fabricCanvas.on('object:removed', scheduleThumbnailUpdate);
    return () => {
      fabricCanvas.off('object:added', scheduleThumbnailUpdate);
      fabricCanvas.off('object:modified', scheduleThumbnailUpdate);
      fabricCanvas.off('object:removed', scheduleThumbnailUpdate);
      if (thumbTimerRef.current) clearTimeout(thumbTimerRef.current);
    };
  }, [fabricCanvas, scheduleThumbnailUpdate]);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-40 flex justify-center pb-6 pointer-events-none"
      style={{ background: 'linear-gradient(to top, rgba(7,7,10,0.9) 40%, transparent)' }}
    >
      <div className="flex items-center gap-3 pointer-events-auto px-4 py-3 rounded-[28px] bg-[#09090c]/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] max-w-[740px] mx-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {pages.map((page, i) => {
            const isActive = i === activePageIndex;
            const isSelected = selectedPageIds.includes(page.page_id);
            return (
              <div key={page.page_id} className="relative">
                <button
                  onClick={() => setActivePageIndex(i)}
                  className={`flex flex-col items-center gap-1 rounded-2xl overflow-hidden border-2 transition-all duration-150 ${
                    isActive
                      ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.35)] bg-emerald-500/5'
                      : 'border-panel-border bg-canvas-surface hover:border-panel-hover'
                  }`}
                  style={{ width: 84, minHeight: 72 }}
                  title={`Page ${i + 1}`}
                  type="button"
                >
                  <div className="w-full h-12 bg-zinc-950 overflow-hidden">
                    {page.thumbnail ? (
                      <img src={page.thumbnail} alt={`Page ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <div className="w-full h-full bg-panel-hover flex items-center justify-center">
                        <span className="text-theme-muted text-[11px]">Empty</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center px-2 py-1 text-[11px] font-semibold tracking-wide">
                    <span className={isActive ? 'text-emerald-300' : 'text-theme-muted'}>Page {i + 1}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePageSelection(page.page_id);
                  }}
                  className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? 'bg-emerald-400 border-emerald-500 text-black'
                      : 'bg-black/60 border-panel-border text-theme-secondary hover:border-zinc-400'
                  }`}
                  title={isSelected ? 'Deselect page for export' : 'Select page for export'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="w-px h-12 bg-panel-border" />

        <div className="flex flex-col gap-2">
          {selectedPageIds.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-theme-secondary">
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">
                {selectedPageIds.length} selected
              </span>
              <button
                type="button"
                onClick={clearPageSelection}
                className="text-[11px] text-theme-muted hover:text-theme-secondary"
              >
                Clear
              </button>
            </div>
          )}
          <button
            onClick={addBlankPage}
            title="Add blank page"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add page
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={duplicateCurrentPage}
              title="Duplicate this page"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-panel-hover text-theme-secondary text-xs font-medium border border-panel-border hover:border-zinc-500 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Dupe
            </button>
            <button
              onClick={() => {
                // S6: Add confirmation before destructive action
                if (window.confirm(`Delete page ${activePageIndex + 1}? This cannot be undone.`)) {
                  deleteCurrentPage();
                }
              }}
              disabled={pages.length <= 1}
              title="Delete this page"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-2xl bg-panel-hover text-theme-secondary text-xs font-medium border border-panel-border hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Del
            </button>
          </div>
        </div>

        {/* Transition selector */}
        <div className="w-px h-12 bg-panel-border" />
        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-theme-muted">Transition</label>
          <select
            value={pageTransitionType}
            onChange={(e) => setPageTransitionType(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-panel-light border border-panel-border text-theme-secondary text-xs hover:border-zinc-500 transition-colors focus:outline-none focus:border-emerald-500/50"
          >
            <option value="fade">Fade</option>
            <option value="slide-left">Slide Left</option>
            <option value="slide-right">Slide Right</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-down">Slide Down</option>
            <option value="zoom-in">Zoom In</option>
            <option value="zoom-out">Zoom Out</option>
            <option value="rotate">Rotate</option>
            <option value="wipe-left">Wipe Left</option>
            <option value="wipe-right">Wipe Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}
