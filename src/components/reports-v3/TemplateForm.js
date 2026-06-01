"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlockEditor from "./BlockEditor";
import V3Preview from "./V3Preview";
import { DEFAULT_BLOCKS, AddBlockBar } from "./blockDefaults";

export default function TemplateForm({ initial, templateId }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic || false);
  const [defaultVariables, setDefaultVariables] = useState(initial?.defaultVariables || []);
  const [blocks, setBlocks] = useState(initial?.blocks || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---- blocks ----
  const updateBlock = (i, updated) => setBlocks(blocks.map((b, idx) => (idx === i ? updated : b)));
  const removeBlock = (i) => setBlocks(blocks.filter((_, idx) => idx !== i));
  const addBlock = (type) => setBlocks([...blocks, DEFAULT_BLOCKS[type]()]);
  const moveBlock = (i, dir) => {
    const target = i + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[target]] = [next[target], next[i]];
    setBlocks(next);
  };

  // ---- default variables ----
  const addVar = () => setDefaultVariables([...defaultVariables, { key: "", label: "", defaultValue: "" }]);
  const updateVar = (i, field, value) =>
    setDefaultVariables(defaultVariables.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  const removeVar = (i) => setDefaultVariables(defaultVariables.filter((_, idx) => idx !== i));

  // preview uses default values for variables
  const previewVars = {};
  defaultVariables.forEach((v) => {
    if (v.key) previewVars[v.key] = v.defaultValue || `{{${v.key}}}`;
  });

  const save = async () => {
    setError("");
    if (!name.trim()) {
      setError("Format name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { name, description, isPublic, defaultVariables, blocks };
      const res = await fetch(templateId ? `/api/v3/templates/${templateId}` : "/api/v3/templates", {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/reports-v3/templates");
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to save format.");
        setSaving(false);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to save format.");
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl pb-24">
      <div className="mb-4">
        <Link href="/reports-v3/templates" className="btn btn-ghost btn-sm mb-2">← All Formats</Link>
        <h1 className="text-3xl font-bold">{templateId ? "Edit Format" : "New Format"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          {/* General */}
          <div className="card bg-base-100 border border-base-content/20">
            <div className="card-body p-4 gap-2">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-sm">Format Name</span></label>
                <input className="input input-sm input-bordered" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LMG Activity Report" />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm">Description</span></label>
                <input className="input input-sm input-bordered" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this format for?" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" className="toggle toggle-success toggle-sm" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <span className="text-sm">{isPublic ? "Public (all users can use)" : "Private (only you)"}</span>
              </label>
            </div>
          </div>

          {/* Default variables */}
          <div className="card bg-base-100 border border-base-content/20">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Default Variables <span className="font-normal text-base-content/40 text-xs">— auto-added to every report</span></h3>
                <button className="btn btn-xs btn-ghost border border-base-content/20" onClick={addVar}>+ Variable</button>
              </div>
              {defaultVariables.length === 0 ? (
                <p className="text-xs text-base-content/30 italic">No variables yet.</p>
              ) : (
                <div className="space-y-2 mt-1">
                  {defaultVariables.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap bg-base-200 border border-base-content/20 rounded-lg px-2 py-1.5">
                      <span className="text-xs font-mono text-base-content/40">{"{{"}</span>
                      <input className="input input-xs w-24 font-mono bg-transparent border-none p-0 focus:outline-none" value={v.key} placeholder="key" onChange={(e) => updateVar(i, "key", e.target.value)} />
                      <span className="text-xs font-mono text-base-content/40">{"}}"}</span>
                      <input className="input input-xs input-bordered w-28 bg-base-100" value={v.label} placeholder="Label" onChange={(e) => updateVar(i, "label", e.target.value)} />
                      <input className="input input-xs input-bordered w-28 bg-base-100" value={v.defaultValue} placeholder="Default value" onChange={(e) => updateVar(i, "defaultValue", e.target.value)} />
                      <button className="text-error opacity-50 hover:opacity-100 text-xs ml-auto" onClick={() => removeVar(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blocks */}
          {blocks.map((block, i) => (
            <BlockEditor
              key={i}
              block={block}
              index={i}
              total={blocks.length}
              onChange={(updated) => updateBlock(i, updated)}
              onRemove={() => removeBlock(i)}
              onMove={(dir) => moveBlock(i, dir)}
              enableAI={false}
            />
          ))}

          <AddBlockBar onAdd={addBlock} />
        </div>

        {/* RIGHT preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <V3Preview blocks={blocks} variables={previewVars} />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 px-4 py-3 flex justify-end items-center gap-3">
        {error && <span className="text-error text-sm">{error}</span>}
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Format"}
        </button>
      </div>
    </div>
  );
}
