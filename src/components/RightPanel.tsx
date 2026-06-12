import React, { useEffect, useState, useCallback } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  ChevronUp, ChevronDown, Trash2, Copy, FlipHorizontal, FlipVertical,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { fabric } from 'fabric';

const FONT_FAMILIES = [
  'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica',
  'Courier New', 'Trebuchet MS', 'Verdana', 'Impact',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

export default function RightPanel() {
  const {
    activeObject,
    fabricCanvas,
    canvasBackground,
    setCanvasBackground,
    canvasWidth,
    canvasHeight,
    selectedObjectAdjustments,
    setObjectAdjustments,
    applyAdjustmentsToObject,
    removeBackground,
  } = useStore();
  const { alignCenterH, alignCenterV, alignTop, alignBottom, alignLeft, alignRight } = useStore();
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);


  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.on('object:modified', refresh);
    fabricCanvas.on('selection:updated', refresh);
    return () => {
      fabricCanvas.off('object:modified', refresh);
      fabricCanvas.off('selection:updated', refresh);
    };
  }, [fabricCanvas, refresh]);

  const obj = activeObject;
  const isText = obj?.type === 'textbox' || obj?.type === 'text';
  const isImage = obj?.type === 'image';

  const setProp = (props: Partial<fabric.Object>) => {
    if (!obj || !fabricCanvas) return;
    obj.set(props as any);
    fabricCanvas.renderAll();
    refresh();
  };

  const setTextProp = (props: Record<string, unknown>) => {
    if (!obj || !fabricCanvas) return;
    (obj as fabric.Textbox).set(props as any);
    fabricCanvas.renderAll();
    refresh();
  };

  const deleteObj = () => {
    if (!obj || !fabricCanvas) return;
    // S6: Add confirmation before destructive action
    if (window.confirm(`Delete this ${obj.type}? This cannot be undone. You can undo with Ctrl/Cmd+Z.`)) {
      fabricCanvas.remove(obj);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  const duplicateObj = () => {
    if (!obj || !fabricCanvas) return;
    obj.clone((cloned: fabric.Object) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const bringForward = () => {
    if (!obj || !fabricCanvas) return;
    fabricCanvas.bringForward(obj);
    fabricCanvas.renderAll();
  };

  const sendBackward = () => {
    if (!obj || !fabricCanvas) return;
    fabricCanvas.sendBackwards(obj);
    fabricCanvas.renderAll();
  };

  return (
    <div className="w-64 bg-panel border-l border-panel-border flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-panel-border shrink-0">
        <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
          {obj ? `Properties · ${obj.type}` : 'Canvas'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!obj && <CanvasProperties bg={canvasBackground} setBg={setCanvasBackground} w={canvasWidth} h={canvasHeight} />}

        {obj && (
          <>
            {/* Quick Actions */}
            <Section title="Actions">
              <div className="flex gap-1.5 flex-wrap">
                <ActionBtn icon={<Copy className="w-3.5 h-3.5" />} label="Duplicate" onClick={duplicateObj} />
                <ActionBtn icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" onClick={deleteObj} danger />
                <ActionBtn icon={<ChevronUp className="w-3.5 h-3.5" />} label="Forward" onClick={bringForward} />
                <ActionBtn icon={<ChevronDown className="w-3.5 h-3.5" />} label="Backward" onClick={sendBackward} />
                <ActionBtn
                  icon={<FlipHorizontal className="w-3.5 h-3.5" />}
                  label="Flip H"
                  onClick={() => setProp({ flipX: !obj.flipX })}
                />
                <ActionBtn
                  icon={<FlipVertical className="w-3.5 h-3.5" />}
                  label="Flip V"
                  onClick={() => setProp({ flipY: !obj.flipY })}
                />
              </div>
            </Section>

            {/* Alignment */}
            <Section title="Align">
              <div className="flex gap-1.5 flex-wrap">
                <ActionBtn icon={<AlignHorizontalSpaceAround className="w-3.5 h-3.5" />} label="Center H" onClick={alignCenterH} />
                <ActionBtn icon={<AlignVerticalSpaceAround className="w-3.5 h-3.5" />} label="Center V" onClick={alignCenterV} />
                <ActionBtn icon={<AlignLeft className="w-3.5 h-3.5" />} label="Left" onClick={alignLeft} />
                <ActionBtn icon={<AlignRight className="w-3.5 h-3.5" />} label="Right" onClick={alignRight} />
                <ActionBtn icon={<AlignJustify className="w-3.5 h-3.5" />} label="Top" onClick={alignTop} />
                <ActionBtn icon={<AlignJustify className="w-3.5 h-3.5" />} label="Bottom" onClick={alignBottom} />
              </div>
            </Section>

            {/* Position & Size */}
            <Section title="Position & Size">
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="X"
                  value={Math.round(obj.left || 0)}
                  onChange={(v) => setProp({ left: v })}
                />
                <NumberField
                  label="Y"
                  value={Math.round(obj.top || 0)}
                  onChange={(v) => setProp({ top: v })}
                />
                <NumberField
                  label="W"
                  value={Math.round((obj.width || 0) * (obj.scaleX || 1))}
                  onChange={(v) => setProp({ scaleX: v / (obj.width || 1) })}
                />
                <NumberField
                  label="H"
                  value={Math.round((obj.height || 0) * (obj.scaleY || 1))}
                  onChange={(v) => setProp({ scaleY: v / (obj.height || 1) })}
                />
                <NumberField
                  label="Angle"
                  value={Math.round(obj.angle || 0)}
                  onChange={(v) => setProp({ angle: v })}
                />
                <NumberField
                  label="Opacity"
                  value={Math.round((obj.opacity ?? 1) * 100)}
                  min={0}
                  max={100}
                  onChange={(v) => setProp({ opacity: v / 100 })}
                />
              </div>
            </Section>

            {/* Fill & Stroke (not for images) */}
            {!isImage && (
              <Section title="Fill & Stroke">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-theme-muted w-16 shrink-0">Fill</label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={isText ? String((obj as fabric.Textbox).fill || '#ffffff') : String(obj.fill || '#000000')}
                        onChange={(e) => isText ? setTextProp({ fill: e.target.value }) : setProp({ fill: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-panel-border bg-transparent"
                      />
                      <input
                        type="text"
                        value={isText ? String((obj as fabric.Textbox).fill || '#ffffff') : String(obj.fill || '#000000')}
                        onChange={(e) => isText ? setTextProp({ fill: e.target.value }) : setProp({ fill: e.target.value })}
                        className="input-field flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  {!isText && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-theme-muted w-16 shrink-0">Stroke</label>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={String(obj.stroke || '#000000')}
                            onChange={(e) => setProp({ stroke: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-panel-border bg-transparent"
                          />
                          <input
                            type="text"
                            value={String(obj.stroke || '#000000')}
                            onChange={(e) => setProp({ stroke: e.target.value })}
                            className="input-field flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-theme-muted w-16 shrink-0">Stroke W</label>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={obj.strokeWidth || 0}
                          onChange={(e) => setProp({ strokeWidth: Number(e.target.value) })}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-xs text-theme-muted w-5 text-right">{obj.strokeWidth || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </Section>
            )}

            {/* Typography */}
            {isText && (
              <Section title="Typography">
                <div className="space-y-2">
                  <select
                    value={(obj as fabric.Textbox).fontFamily || 'Inter'}
                    onChange={(e) => setTextProp({ fontFamily: e.target.value })}
                    className="input-field w-full text-xs"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <select
                      value={(obj as fabric.Textbox).fontSize || 16}
                      onChange={(e) => setTextProp({ fontSize: Number(e.target.value) })}
                      className="input-field flex-1 text-xs"
                    >
                      {FONT_SIZES.map((s) => (
                        <option key={s} value={s}>{s}px</option>
                      ))}
                    </select>
                    <input
                      type="color"
                      value={String((obj as fabric.Textbox).fill || '#ffffff')}
                      onChange={(e) => setTextProp({ fill: e.target.value })}
                      className="w-9 h-9 rounded cursor-pointer border border-panel-border bg-transparent"
                    />
                  </div>

                  <div className="flex gap-1">
                    {[
                      { icon: <Bold className="w-3.5 h-3.5" />, prop: 'fontWeight', on: 'bold', off: 'normal' },
                      { icon: <Italic className="w-3.5 h-3.5" />, prop: 'fontStyle', on: 'italic', off: 'normal' },
                      { icon: <Underline className="w-3.5 h-3.5" />, prop: 'underline', on: true, off: false },
                      { icon: <Strikethrough className="w-3.5 h-3.5" />, prop: 'linethrough', on: true, off: false },
                    ].map(({ icon, prop, on, off }) => {
                      const val = (obj as any)[prop];
                      const isActive = val === on;
                      return (
                        <button
                          key={prop}
                          onClick={() => setTextProp({ [prop]: isActive ? off : on })}
                          className={`tool-btn w-8 h-8 ${isActive ? 'active' : ''}`}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-1">
                    {[
                      { icon: <AlignLeft className="w-3.5 h-3.5" />, val: 'left' },
                      { icon: <AlignCenter className="w-3.5 h-3.5" />, val: 'center' },
                      { icon: <AlignRight className="w-3.5 h-3.5" />, val: 'right' },
                      { icon: <AlignJustify className="w-3.5 h-3.5" />, val: 'justify' },
                    ].map(({ icon, val }) => (
                      <button
                        key={val}
                        onClick={() => setTextProp({ textAlign: val })}
                        className={`tool-btn w-8 h-8 ${(obj as fabric.Textbox).textAlign === val ? 'active' : ''}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-theme-muted">Line Height</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.8}
                        max={3}
                        step={0.1}
                        value={(obj as fabric.Textbox).lineHeight || 1.2}
                        onChange={(e) => setTextProp({ lineHeight: Number(e.target.value) })}
                        className="flex-1 accent-emerald-500"
                      />
                      <span className="text-xs text-theme-muted w-8 text-right">
                        {((obj as fabric.Textbox).lineHeight || 1.2).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Image adjustments */}
            {isImage && (
              <Section title="Image">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-theme-muted">Blend Mode</label>
                    <select
                      value={(obj as any).globalCompositeOperation || 'source-over'}
                      onChange={(e) => setProp({ globalCompositeOperation: e.target.value })}
                      className="input-field w-full text-xs"
                    >
                      {[
                        { label: 'Normal', value: 'source-over' },
                        { label: 'Multiply', value: 'multiply' },
                        { label: 'Screen', value: 'screen' },
                        { label: 'Overlay', value: 'overlay' },
                        { label: 'Darken', value: 'darken' },
                        { label: 'Lighten', value: 'lighten' },
                        { label: 'Color Dodge', value: 'color-dodge' },
                        { label: 'Color Burn', value: 'color-burn' },
                        { label: 'Hard Light', value: 'hard-light' },
                        { label: 'Soft Light', value: 'soft-light' },
                        { label: 'Difference', value: 'difference' },
                        { label: 'Exclusion', value: 'exclusion' },
                        { label: 'Hue', value: 'hue' },
                        { label: 'Saturation', value: 'saturation' },
                        { label: 'Color', value: 'color' },
                        { label: 'Luminosity', value: 'luminosity' },
                      ].map((mode) => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {([
                      { label: 'Brightness', field: 'brightness', min: -100, max: 100 },
                      { label: 'Contrast', field: 'contrast', min: -100, max: 100 },
                      { label: 'Saturation', field: 'saturation', min: -100, max: 100 },
                      { label: 'Hue', field: 'hue', min: -180, max: 180 },
                    ] as const).map(({ label, field, min, max }) => (
                      <div key={field} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-theme-muted">
                          <span>{label}</span>
                          <span>{selectedObjectAdjustments[field]}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={selectedObjectAdjustments[field]}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            const next = { ...selectedObjectAdjustments, [field]: value };
                            setObjectAdjustments(next);
                            if (obj) applyAdjustmentsToObject(obj, next);
                          }}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const reset = { brightness: 0, contrast: 0, saturation: 0, hue: 0, clarity: 0, highlights: 0, shadows: 0 };
                        setObjectAdjustments(reset);
                        if (obj) applyAdjustmentsToObject(obj, reset);
                      }}
                      className="flex-1 rounded-xl border border-panel-border px-3 py-2 text-xs text-theme-secondary hover:text-theme-primary hover:border-panel-hover transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => removeBackground()}
                      className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs text-white hover:bg-emerald-400 transition-colors"
                    >
                      Remove Background
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {/* Corner Radius for rects */}
            {obj.type === 'rect' && (
              <Section title="Corner Radius">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={(obj as fabric.Rect).rx || 0}
                    onChange={(e) => setProp({ rx: Number(e.target.value), ry: Number(e.target.value) } as any)}
                    className="flex-1 accent-neon-green"
                  />
                  <span className="text-xs text-theme-muted w-6 text-right">{(obj as fabric.Rect).rx || 0}</span>
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CanvasProperties({ bg, setBg, w, h }: { bg: string; setBg: (c: string) => void; w: number; h: number }) {
  return (
    <Section title="Canvas Settings">
      <div className="space-y-3">
        <div className="text-xs text-theme-muted mb-1">Size: {w} × {h}px</div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-theme-muted w-20 shrink-0">Background</label>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-panel-border bg-transparent"
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="input-field flex-1 font-mono text-xs"
          />
        </div>
        <div className="pt-1">
          <p className="text-xs text-theme-dim">Click on an object to edit its properties.</p>
        </div>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-panel-border">
      <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2.5">{title}</p>
      {children}
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  const clampValue = (next: number) => {
    let valid = Number(next);
    if (Number.isNaN(valid)) return;
    if (typeof min === 'number') valid = Math.max(min, valid);
    if (typeof max === 'number') valid = Math.min(max, valid);
    onChange(valid);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-theme-muted">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => clampValue(value - 1)}
          disabled={typeof min === 'number' && value <= min}
          className="w-7 h-7 rounded border border-panel-border text-theme-muted hover:bg-panel-hover disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={1}
          onChange={(e) => clampValue(Number(e.target.value))}
          className="input-field text-xs text-center tabular-nums flex-1"
        />
        <button
          type="button"
          onClick={() => clampValue(value + 1)}
          disabled={typeof max === 'number' && value >= max}
          className="w-7 h-7 rounded border border-panel-border text-theme-muted hover:bg-panel-hover disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs border transition-all
        ${danger
          ? 'border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-600/50'
          : 'border-panel-border text-theme-muted hover:text-theme-primary hover:bg-panel-hover'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
