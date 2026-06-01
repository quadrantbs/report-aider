"use client";

import { useState } from "react";

function newItem() {
  return { id: crypto.randomUUID(), text: "", children: [] };
}

export default function ListItemEditor({ item, depth, onChange, onRemove, onGenerate, enableAI = true }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [generating, setGenerating] = useState(false);

  const update = (field, value) => onChange({ ...item, [field]: value });

  const addChild = () => {
    update("children", [...(item.children || []), newItem()]);
  };

  const updateChild = (idx, updated) => {
    update("children", (item.children || []).map((c, i) => (i === idx ? updated : c)));
  };

  const removeChild = (idx) => {
    update("children", (item.children || []).filter((_, i) => i !== idx));
  };

  const handleGenerate = async (mode) => {
    if (!onGenerate || !item.prompt) return;
    setGenerating(true);
    try {
      if (mode === "list") {
        const items = await onGenerate(item.prompt, "list");
        if (Array.isArray(items)) {
          update("children", [
            ...(item.children || []),
            ...items.map((it) => ({ id: crypto.randomUUID(), text: it.text || "", children: [] })),
          ]);
        }
      } else {
        const text = await onGenerate(item.prompt, "text");
        if (typeof text === "string") update("text", text);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Visual depth cue via left border colors cycling.
  const borderColors = ["border-primary", "border-secondary", "border-accent", "border-info"];
  const borderColor = borderColors[depth % borderColors.length];

  return (
    <div className={`pl-3 border-l-2 ${borderColor} space-y-1.5`}>
      <div className="flex items-start gap-2">
        <span className="text-base-content/30 text-xs mt-2 select-none">•</span>
        <textarea
          className="textarea textarea-sm textarea-bordered flex-1 min-h-[2.5rem]"
          rows={1}
          value={item.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Point text..."
        />
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="btn btn-xs btn-ghost border border-base-content/20"
            onClick={() => setShowPrompt((s) => !s)}
            title="AI for this point"
          >
            🤖
          </button>
          <button
            type="button"
            className="btn btn-xs btn-ghost text-error border border-base-content/20"
            onClick={onRemove}
            title="Delete point"
          >
            ✕
          </button>
        </div>
      </div>

      {showPrompt && (
        <div className="flex items-center gap-2 ml-5">
          <input
            className="input input-xs input-bordered flex-1"
            value={item.prompt || ""}
            onChange={(e) => update("prompt", e.target.value)}
            placeholder="AI prompt — fill text, or generate sub-items..."
          />
          {enableAI && (
            <div className="join">
              <button
                type="button"
                className="btn btn-xs btn-primary join-item"
                onClick={() => handleGenerate("text")}
                disabled={generating || !item.prompt}
                title="Generate this item's text"
              >
                {generating ? "..." : "Text"}
              </button>
              <button
                type="button"
                className="btn btn-xs btn-secondary join-item"
                onClick={() => handleGenerate("list")}
                disabled={generating || !item.prompt}
                title="Generate sub-items under this item"
              >
                Sub-items
              </button>
            </div>
          )}
        </div>
      )}

      {/* Children */}
      {(item.children || []).length > 0 && (
        <div className="space-y-1.5 mt-1.5">
          {item.children.map((child, idx) => (
            <ListItemEditor
              key={child.id || idx}
              item={child}
              depth={depth + 1}
              onChange={(updated) => updateChild(idx, updated)}
              onRemove={() => removeChild(idx)}
              onGenerate={onGenerate}
              enableAI={enableAI}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-xs btn-ghost text-secondary border border-dashed border-base-content/20 ml-5"
        onClick={addChild}
      >
        + Add Sub-item
      </button>
    </div>
  );
}
