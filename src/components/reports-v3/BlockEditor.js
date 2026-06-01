"use client";

import { useState } from "react";
import ListItemEditor from "./ListItemEditor";
import MarkerLevels from "./MarkerLevels";

const STYLES = [
  { v: "none", label: "Normal" },
  { v: "bold", label: "Bold" },
  { v: "italic", label: "Italic" },
  { v: "bold-italic", label: "Bold+Italic" },
];

const BLOCK_LABELS = {
  keyvalue: "Header (Label : Value)",
  paragraph: "Paragraph",
  list: "List",
  divider: "Divider",
};

const newItem = () => ({ id: crypto.randomUUID(), text: "", children: [] });

function StyleSelect({ value, onChange, label = "Style" }) {
  return (
    <label className="flex items-center gap-1 text-xs">
      <span className="text-base-content/50">{label}</span>
      <select className="select select-xs select-bordered" value={value || "none"} onChange={(e) => onChange(e.target.value)}>
        {STYLES.map((s) => (
          <option key={s.v} value={s.v}>{s.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function BlockEditor({ block, index, total, onChange, onRemove, onMove, onGenerate, enableAI = true }) {
  const [generatingList, setGeneratingList] = useState(false);
  const [paraGenerating, setParaGenerating] = useState(false);
  const update = (field, value) => onChange({ ...block, [field]: value });

  // ---- keyvalue ----
  const updateRow = (i, field, value) =>
    update("rows", block.rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => update("rows", [...(block.rows || []), { label: "", value: "" }]);
  const removeRow = (i) => update("rows", block.rows.filter((_, idx) => idx !== i));

  // ---- list ----
  const updateItem = (i, updated) => update("items", block.items.map((it, idx) => (idx === i ? updated : it)));
  const removeItem = (i) => update("items", block.items.filter((_, idx) => idx !== i));
  const addItem = () => update("items", [...(block.items || []), newItem()]);

  const generateList = async () => {
    if (!onGenerate || !block.prompt) return;
    setGeneratingList(true);
    try {
      const items = await onGenerate(block.prompt, "list");
      if (Array.isArray(items)) {
        const withIds = items.map((it) => ({ id: crypto.randomUUID(), text: it.text || "", children: [] }));
        update("items", [...(block.items || []), ...withIds]);
      }
    } finally {
      setGeneratingList(false);
    }
  };

  const generateParagraph = async () => {
    if (!onGenerate || !block.prompt) return;
    setParaGenerating(true);
    try {
      const text = await onGenerate(block.prompt, "text");
      if (typeof text === "string") update("text", text);
    } finally {
      setParaGenerating(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-content/20 shadow-sm">
      <div className="card-body p-4 gap-3">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-base-300 pb-2">
          <span className="badge badge-sm badge-neutral">{BLOCK_LABELS[block.type] || block.type}</span>
          <div className="flex gap-1">
            <button type="button" className="btn btn-xs btn-ghost border border-base-content/20" onClick={() => onMove(-1)} disabled={index === 0}>↑</button>
            <button type="button" className="btn btn-xs btn-ghost border border-base-content/20" onClick={() => onMove(1)} disabled={index === total - 1}>↓</button>
            <button type="button" className="btn btn-xs btn-ghost text-error border border-base-content/20" onClick={onRemove}>Delete</button>
          </div>
        </div>

        {/* DIVIDER */}
        {block.type === "divider" && (
          <p className="text-center text-base-content/30 font-mono text-sm">_____________________</p>
        )}

        {/* PARAGRAPH */}
        {block.type === "paragraph" && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1 text-xs">
                <span className="text-base-content/50">Label/Heading</span>
                <input
                  className="input input-xs input-bordered w-32"
                  value={block.label || ""}
                  onChange={(e) => update("label", e.target.value)}
                  placeholder="(empty)"
                />
              </label>
              <StyleSelect value={block.labelStyle} onChange={(v) => update("labelStyle", v)} label="Label style" />
              <div className="ml-auto"><StyleSelect value={block.style} onChange={(v) => update("style", v)} label="Body style" /></div>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={block.text || ""}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Write a paragraph... use {{variable}} as needed"
            />
            <div className="flex items-center gap-2">
              <input
                className="input input-xs input-bordered flex-1"
                value={block.prompt || ""}
                onChange={(e) => update("prompt", e.target.value)}
                placeholder="AI prompt (optional)..."
              />
              {enableAI && (
                <button type="button" className="btn btn-xs btn-primary" onClick={generateParagraph} disabled={paraGenerating || !block.prompt}>
                  {paraGenerating ? "..." : "🤖 Generate"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* KEYVALUE */}
        {block.type === "keyvalue" && (
          <div className="space-y-2">
            <div className="flex justify-end"><StyleSelect value={block.style} onChange={(v) => update("style", v)} /></div>
            {(block.rows || []).map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input input-sm input-bordered w-40"
                  value={row.label}
                  onChange={(e) => updateRow(i, "label", e.target.value)}
                  placeholder="Label"
                />
                <span className="text-base-content/40">:</span>
                <input
                  className="input input-sm input-bordered flex-1"
                  value={row.value}
                  onChange={(e) => updateRow(i, "value", e.target.value)}
                  placeholder="Value"
                />
                <button type="button" className="btn btn-xs btn-ghost text-error" onClick={() => removeRow(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-xs btn-ghost border border-base-content/20" onClick={addRow}>+ Add Row</button>
          </div>
        )}

        {/* LIST */}
        {block.type === "list" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1 text-xs">
                <span className="text-base-content/50">List heading</span>
                <input
                  className="input input-xs input-bordered w-40"
                  value={block.label || ""}
                  onChange={(e) => update("label", e.target.value)}
                  placeholder="(empty)"
                />
              </label>
              <StyleSelect value={block.labelStyle} onChange={(v) => update("labelStyle", v)} label="Heading style" />
              <StyleSelect value={block.itemStyle} onChange={(v) => update("itemStyle", v)} label="Item style" />
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs" checked={block.spacing !== false} onChange={(e) => update("spacing", e.target.checked)} />
                <span className="text-base-content/50">Spacing between items</span>
              </label>
            </div>

            <MarkerLevels markers={block.markers} onChange={(m) => update("markers", m)} />

            <div className="space-y-2 bg-base-200/40 rounded-lg p-2">
              {(block.items || []).map((item, i) => (
                <ListItemEditor
                  key={item.id || i}
                  item={item}
                  depth={0}
                  onChange={(updated) => updateItem(i, updated)}
                  onRemove={() => removeItem(i)}
                  onGenerate={onGenerate}
                  enableAI={enableAI}
                />
              ))}
              <button type="button" className="btn btn-sm btn-secondary btn-outline" onClick={addItem}>+ Add Item</button>
            </div>

            {/* List-level AI: generate whole list */}
            <div className="flex items-center gap-2 border-t border-base-300 pt-2">
              <input
                className="input input-xs input-bordered flex-1"
                value={block.prompt || ""}
                onChange={(e) => update("prompt", e.target.value)}
                placeholder="AI prompt to generate the whole list..."
              />
              {enableAI && (
                <button type="button" className="btn btn-xs btn-primary" onClick={generateList} disabled={generatingList || !block.prompt}>
                  {generatingList ? "..." : "🤖 Generate List"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
