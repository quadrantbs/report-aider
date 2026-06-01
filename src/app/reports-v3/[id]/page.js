"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BlockEditor from "@/components/reports-v3/BlockEditor";
import V3Preview from "@/components/reports-v3/V3Preview";
import { DEFAULT_BLOCKS, AddBlockBar } from "@/components/reports-v3/blockDefaults";

export default function ReportV3EditorPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const [reportRes, sourcesRes] = await Promise.all([
          fetch(`/api/v3/reports/${id}`),
          fetch("/api/v2/sources"),
        ]);
        if (reportRes.ok) {
          const data = await reportRes.json();
          if (data.variables && typeof data.variables.get === "function") {
            data.variables = Object.fromEntries(data.variables);
          }
          data.variables = data.variables || {};
          data.blocks = data.blocks || [];
          data.globalSourceIds = (data.globalSourceIds || []).map((s) => s._id || s);
          setReport(data);
        }
        if (sourcesRes.ok) setSources(await sourcesRes.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---- blocks ----
  const setBlocks = (blocks) => setReport((r) => ({ ...r, blocks }));
  const updateBlock = (i, updated) => setBlocks(report.blocks.map((b, idx) => (idx === i ? updated : b)));
  const removeBlock = (i) => setBlocks(report.blocks.filter((_, idx) => idx !== i));
  const addBlock = (type) => setBlocks([...report.blocks, DEFAULT_BLOCKS[type]()]);
  const moveBlock = (i, dir) => {
    const target = i + dir;
    if (target < 0 || target >= report.blocks.length) return;
    const next = [...report.blocks];
    [next[i], next[target]] = [next[target], next[i]];
    setBlocks(next);
  };

  // ---- variables ----
  const setVariable = (key, value) =>
    setReport((r) => ({ ...r, variables: { ...r.variables, [key]: value } }));
  const addVariable = () =>
    setReport((r) => ({ ...r, variables: { ...r.variables, [`var_${Object.keys(r.variables).length + 1}`]: "" } }));
  const removeVariable = (key) =>
    setReport((r) => {
      const next = { ...r.variables };
      delete next[key];
      return { ...r, variables: next };
    });
  const renameVariable = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey) return;
    setReport((r) => {
      const next = {};
      for (const [k, v] of Object.entries(r.variables)) next[k === oldKey ? newKey : k] = v;
      return { ...r, variables: next };
    });
  };

  // ---- global sources ----
  const toggleSource = (sourceId) =>
    setReport((r) => {
      const has = r.globalSourceIds.includes(sourceId);
      return {
        ...r,
        globalSourceIds: has ? r.globalSourceIds.filter((s) => s !== sourceId) : [...r.globalSourceIds, sourceId],
      };
    });

  // ---- AI ----
  const runGenerate = useCallback(
    async (prompt, mode = "text") => {
      try {
        const res = await fetch("/api/v3/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            mode,
            sourceIds: report.globalSourceIds,
            variables: report.variables,
          }),
        });
        if (!res.ok) {
          showToast("AI generation failed", "error");
          return mode === "list" ? [] : "";
        }
        const data = await res.json();
        return mode === "list" ? data.items : data.result;
      } catch (error) {
        console.error(error);
        showToast("AI generation failed", "error");
        return mode === "list" ? [] : "";
      }
    },
    [report]
  );

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v3/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: report.title,
          blocks: report.blocks,
          variables: report.variables,
          globalSourceIds: report.globalSourceIds,
          status: report.status,
        }),
      });
      if (res.ok) showToast("Saved", "success");
      else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to save", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!report) return <div className="p-10 text-center">Report not found. <Link href="/reports-v3" className="link">Back</Link></div>;

  return (
    <div className="container mx-auto p-4 max-w-7xl pb-24">
      <div className="mb-4">
        <Link href="/reports-v3" className="btn btn-ghost btn-sm mb-2">← All V3 Reports</Link>
        <input
          className="input input-bordered text-2xl font-bold w-full"
          value={report.title}
          onChange={(e) => setReport({ ...report, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: editor */}
        <div className="space-y-4">
          {/* Variables */}
          <div className="card bg-base-100 border border-base-content/20">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Variables <span className="font-normal text-base-content/40 text-xs">— use <code className="bg-base-300 px-1 rounded">{"{{key}}"}</code></span></h3>
                <button className="btn btn-xs btn-ghost border border-base-content/20" onClick={addVariable}>+ Variable</button>
              </div>
              {Object.keys(report.variables).length === 0 ? (
                <p className="text-xs text-base-content/30 italic">No variables yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(report.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1 bg-base-200 border border-base-content/20 rounded-lg px-2 py-1">
                      <span className="text-xs font-mono text-base-content/40">{"{{"}</span>
                      <input
                        className="input input-xs w-24 font-mono bg-transparent border-none p-0 focus:outline-none"
                        defaultValue={key}
                        onBlur={(e) => renameVariable(key, e.target.value.trim())}
                      />
                      <span className="text-xs font-mono text-base-content/40">{"}}"}</span>
                      <input
                        className="input input-xs input-bordered w-32 bg-base-100 ml-1"
                        value={value}
                        placeholder="value"
                        onChange={(e) => setVariable(key, e.target.value)}
                      />
                      <button className="text-error opacity-50 hover:opacity-100 text-xs ml-1" onClick={() => removeVariable(key)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global sources */}
          {sources.length > 0 && (
            <div className="card bg-base-100 border border-base-content/20">
              <div className="card-body p-4">
                <h3 className="font-bold text-sm mb-1">AI Context Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <label key={s._id} className="flex items-center gap-1 text-xs bg-base-200 border border-base-content/20 rounded px-2 py-1 cursor-pointer">
                      <input type="checkbox" className="checkbox checkbox-xs" checked={report.globalSourceIds.includes(s._id)} onChange={() => toggleSource(s._id)} />
                      {s.title}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blocks */}
          {report.blocks.map((block, i) => (
            <BlockEditor
              key={i}
              block={block}
              index={i}
              total={report.blocks.length}
              onChange={(updated) => updateBlock(i, updated)}
              onRemove={() => removeBlock(i)}
              onMove={(dir) => moveBlock(i, dir)}
              onGenerate={runGenerate}
            />
          ))}

          {/* Add block */}
          <AddBlockBar onAdd={addBlock} />
        </div>

        {/* RIGHT: preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <V3Preview blocks={report.blocks} variables={report.variables} />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 px-4 py-3 flex justify-end gap-2 items-center">
        <select
          className="select select-sm select-bordered"
          value={report.status}
          onChange={(e) => setReport({ ...report, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type} fixed bottom-20 right-4 w-auto z-50 shadow-lg`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
