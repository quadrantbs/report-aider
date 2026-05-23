"use client";

import { useRef } from "react";

const WA_PRESETS = [
  { label: "Plain", format: "{isi}" },
  { label: "*Bold*", format: "*{isi}*" },
  { label: "_Italic_", format: "_{isi}_" },
  { label: "_*Bold Italic*_", format: "_*{isi}*_" },
];

const EMPTY_LIST = {
  enabled: false,
  type: "number",
  itemStyle: "none",
  nested: false,
  prefix: "",
  suffix: "",
};

export default function PartCard({ part, index, totalParts, onMove, onChange, onRemove, availableVariables = [] }) {
  const promptRef = useRef(null);
  const formatRef = useRef(null);

  const insertVar = (ref, current, setter) => (key) => {
    const el = ref.current;
    const tag = `{{${key}}}`;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setter(current.slice(0, start) + tag + current.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
    } else {
      setter((current || "") + tag);
    }
  };
  const wa = part.renderConfig?.wa || {};
  const list = { ...EMPTY_LIST, ...(wa.list || {}) };
  const listEnabled = list.enabled === true;

  const update = (field, value) =>
    onChange({ ...part, [field]: value });

  const updateWa = (waField, value) =>
    onChange({
      ...part,
      renderConfig: { ...part.renderConfig, wa: { ...wa, [waField]: value } },
    });

  const updateList = (listField, value) =>
    onChange({
      ...part,
      renderConfig: {
        ...part.renderConfig,
        wa: { ...wa, list: { ...list, [listField]: value } },
      },
    });

  const preview = (wa.format || "{isi}")
    .replace(/\\n/g, "↵")
    .replace("{isi}", "content");

  return (
    <div className="p-4 bg-base-100 border border-gray-100 border-solid rounded-lg relative">
      {/* Move / Remove */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          className="btn btn-circle btn-xs btn-ghost border border-base-content/20 disabled:opacity-30 bg-info">↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === totalParts - 1}
          className="btn btn-circle btn-xs btn-ghost border border-base-content/20 disabled:opacity-30 bg-info">↓</button>
        <button type="button" onClick={onRemove}
          className="btn btn-circle btn-xs btn-error">✖</button>
      </div>

      {/* Label & Key */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Label (Display Name)</span></label>
          <input type="text" className="input input-sm input-bordered" value={part.label}
            onChange={(e) => update("label", e.target.value)} required />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Key (lowercase, no spaces)</span></label>
          <input type="text" className="input input-sm input-bordered" value={part.key}
            onChange={(e) => update("key", e.target.value)} required />
        </div>
      </div>

      {/* AI Prompt */}
      <div className="form-control mt-2">
        <label className="label"><span className="label-text text-xs text-primary font-bold">AI Prompt (Optional)</span></label>
        <textarea ref={promptRef} className="textarea textarea-sm textarea-bordered" value={part.defaultPrompt}
          onChange={(e) => update("defaultPrompt", e.target.value)}
          placeholder="Prompt to generate AI content..." />
        {availableVariables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {availableVariables.map((v) => (
              <button key={v.key} type="button"
                className="btn btn-xs btn-ghost border border-base-content/20 font-mono text-primary"
                onClick={() => insertVar(promptRef, part.defaultPrompt || "", (val) => update("defaultPrompt", val))(v.key)}>
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input type */}
      <div className="mt-3 border-t border-base-300 pt-3">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xs font-bold text-base-content/60 uppercase">Input</p>
          <div className="join">
            {[{ v: "text", label: "Text" }, { v: "select", label: "Select" }].map(({ v, label }) => (
              <button key={v} type="button"
                className={`btn btn-xs join-item ${(part.inputType || "text") === v ? "btn-primary" : "btn-ghost border-base-300"}`}
                onClick={() => update("inputType", v)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {part.inputType === "select" && (
          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              {(part.options || []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-1 bg-base-100 border border-base-content/20 rounded px-2 py-0.5">
                  <input
                    className="input input-xs w-20 bg-transparent border-none p-0 focus:outline-none font-mono text-xs"
                    value={opt}
                    onChange={(e) => {
                      const next = [...(part.options || [])];
                      next[oi] = e.target.value;
                      update("options", next);
                    }}
                  />
                  <button type="button" className="text-error opacity-50 hover:opacity-100 text-xs"
                    onClick={() => update("options", (part.options || []).filter((_, i) => i !== oi))}>✕</button>
                </div>
              ))}
              <button type="button"
                className="btn btn-xs btn-ghost border border-base-content/20"
                onClick={() => update("options", [...(part.options || []), ""])}>
                + Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WA Format */}
      <div className="mt-3 border-t border-base-300 pt-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-base-content/60 uppercase">WA Format</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-base-content/50">List</span>
            <input type="checkbox" className="toggle toggle-xs toggle-primary"
              checked={listEnabled}
              onChange={(e) => updateList("enabled", e.target.checked)} />
          </label>
        </div>

        {!listEnabled && (
          <>
            <div className="flex flex-wrap gap-1 mb-2">
              {WA_PRESETS.map((p) => (
                <button key={p.label} type="button"
                  className="btn btn-xs btn-outline font-mono"
                  onClick={() => updateWa("format", p.format)}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-xs">
                  Format{" "}
                  <span className="text-base-content/40">
                    (use <code className="bg-base-300 px-1 rounded">{"{isi}"}</code> as content,{" "}
                    <code className="bg-base-300 px-1 rounded">\n</code> for newline)
                  </span>
                </span>
              </label>
              <input ref={formatRef} type="text" className="input input-sm input-bordered font-mono"
                value={wa.format || "{isi}"}
                onChange={(e) => updateWa("format", e.target.value)}
                placeholder="e.g. *To: {isi}*" />
              {availableVariables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableVariables.map((v) => (
                    <button key={v.key} type="button"
                      className="btn btn-xs btn-ghost border border-base-content/20 font-mono text-primary"
                      onClick={() => insertVar(formatRef, wa.format || "{isi}", (val) => updateWa("format", val))(v.key)}>
                      {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs"
                  checked={wa.showLabel !== false}
                  onChange={(e) => updateWa("showLabel", e.target.checked)} />
                <span className="text-xs">Show label in WA output</span>
              </label>
              <span className="text-xs text-base-content/40 font-mono">Preview: {preview}</span>
            </div>
          </>
        )}

        {listEnabled && (
          <div className="space-y-3">
            {/* Type */}
            <div>
              <p className="text-xs text-base-content/50 mb-1">Type</p>
              <div className="join">
                {[{ v: "number", label: "1, 2, 3" }, { v: "letter", label: "a, b, c" }].map(({ v, label }) => (
                  <button key={v} type="button"
                    className={`btn btn-xs join-item ${list.type === v ? "btn-primary" : "btn-ghost border-base-300"}`}
                    onClick={() => updateList("type", v)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Item style */}
            <div>
              <p className="text-xs text-base-content/50 mb-1">Item Style</p>
              <div className="join">
                {[
                  { v: "none", label: "—" },
                  { v: "bold", label: "*B*" },
                  { v: "italic", label: "_I_" },
                  { v: "bold-italic", label: "_*BI*_" },
                ].map(({ v, label }) => (
                  <button key={v} type="button"
                    className={`btn btn-xs join-item font-mono ${list.itemStyle === v ? "btn-primary" : "btn-ghost border-base-300"}`}
                    onClick={() => updateList("itemStyle", v)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nested + Show label */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs"
                  checked={list.nested === true}
                  onChange={(e) => updateList("nested", e.target.checked)} />
                <span className="text-xs">Nested items</span>
              </label>
              {list.nested && (
                <div className="text-xs text-base-content/40 bg-base-300 rounded px-2 py-1 font-mono w-full mt-1">
                  Item utama<br />
                  {"  "}sub-item (2 spasi di depan)<br />
                  {"  "}sub-item lain<br />
                  Item utama berikutnya
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs"
                  checked={wa.showLabel !== false}
                  onChange={(e) => updateWa("showLabel", e.target.checked)} />
                <span className="text-xs">Show label</span>
              </label>
            </div>

            {/* Before / After */}
            <div className="grid grid-cols-2 gap-2">
              <div className="form-control">
                <label className="label py-0">
                  <span className="label-text text-xs">Before list <span className="text-base-content/30">(\n = newline)</span></span>
                </label>
                <input type="text" className="input input-sm input-bordered font-mono"
                  value={list.prefix || ""}
                  onChange={(e) => updateList("prefix", e.target.value)}
                  placeholder="e.g. Summary:\n" />
              </div>
              <div className="form-control">
                <label className="label py-0">
                  <span className="label-text text-xs">After list <span className="text-base-content/30">(\n = newline)</span></span>
                </label>
                <input type="text" className="input input-sm input-bordered font-mono"
                  value={list.suffix || ""}
                  onChange={(e) => updateList("suffix", e.target.value)}
                  placeholder="e.g. \n---" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
