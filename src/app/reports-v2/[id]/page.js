"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReportPreview from "@/components/reports-v2/ReportPreview";
import HelpModal from "@/components/reports-v2/HelpModal";

export default function ReportEditorPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPart, setGeneratingPart] = useState(null);
  const [toast, setToast] = useState(null);
  const [tokohList, setTokohList] = useState([]);
  const partRefs = useRef({});

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [reportRes, sourcesRes, tokohRes] = await Promise.all([
        fetch(`/api/v2/reports/${id}`),
        fetch("/api/v2/sources"),
        fetch("/api/v2/tokoh"),
      ]);
      if (reportRes.ok && sourcesRes.ok) {
        const reportData = await reportRes.json();
        const sourcesData = await sourcesRes.json();
        // normalize variables: Mongoose Map comes as object
        if (reportData.variables && typeof reportData.variables.get === "function") {
          reportData.variables = Object.fromEntries(reportData.variables);
        }
        reportData.variables = reportData.variables || {};

        // sync parts with schema: add parts for new schema sections
        const structure = reportData.schemaId?.structure || [];
        const existingKeys = new Set((reportData.parts || []).map((p) => p.partKey));
        const missingParts = structure
          .filter((def) => !existingKeys.has(def.key))
          .map((def) => ({ partKey: def.key, content: "", overridePrompt: def.defaultPrompt || "", sourceIds: [] }));
        if (missingParts.length > 0) {
          reportData.parts = [...(reportData.parts || []), ...missingParts];
        }

        // sync variables from schema: add variables defined in format but missing in report
        const schemaVars = reportData.schemaId?.defaultVariables || [];
        schemaVars.forEach((v) => {
          if (!(v.key in reportData.variables)) {
            reportData.variables[v.key] = v.defaultValue || "";
          }
        });

        setReport(reportData);
        setSources(sourcesData);
      }
      if (tokohRes.ok) setTokohList(await tokohRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- variables helpers ---
  const getVariables = () => report.variables || {};

  const setVariable = (key, value) => {
    setReport({ ...report, variables: { ...getVariables(), [key]: value } });
  };

  const addVariable = () => {
    const key = `var_${Date.now()}`;
    setReport({ ...report, variables: { ...getVariables(), [key]: "" } });
  };

  const removeVariable = (key) => {
    const next = { ...getVariables() };
    delete next[key];
    setReport({ ...report, variables: next });
  };

  const renameVariableKey = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey) return;
    const vars = getVariables();
    const next = {};
    for (const [k, v] of Object.entries(vars)) {
      next[k === oldKey ? newKey : k] = v;
    }
    setReport({ ...report, variables: next });
  };


  // --- part helpers ---
  const updatePartContent = (partKey, content) => {
    const newParts = report.parts.map((p) =>
      p.partKey === partKey ? { ...p, content } : p
    );
    const newData = { ...(report.data || {}) };
    newData[partKey] = content;
    setReport({ ...report, parts: newParts, data: newData });
  };

  const toggleSourceForPart = (partKey, sourceId) => {
    const newParts = report.parts.map((p) => {
      if (p.partKey === partKey) {
        const sourceIds = p.sourceIds || [];
        const exists = sourceIds.some((s) => (s._id || s) === sourceId);
        return {
          ...p,
          sourceIds: exists
            ? sourceIds.filter((s) => (s._id || s) !== sourceId)
            : [...sourceIds, sourceId],
        };
      }
      return p;
    });
    setReport({ ...report, parts: newParts });
  };

  const generateWithAI = async (partKey) => {
    const part = report.parts.find((p) => p.partKey === partKey);
    const schemaPart = report.schemaId.structure.find((s) => s.key === partKey);
    setGeneratingPart(partKey);
    try {
      const res = await fetch("/api/v2/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: part.overridePrompt || schemaPart.defaultPrompt,
          sourceIds: (part.sourceIds || []).map(s => s._id || s),
          config: part.overrideAiConfig || schemaPart.aiConfig,
          variables: getVariables(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updatePartContent(partKey, data.result);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to generate AI content", "error");
    } finally {
      setGeneratingPart(null);
    }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      const finalData = {};
      report.parts.forEach(p => { finalData[p.partKey] = p.content; });
      const res = await fetch(`/api/v2/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...report, data: finalData, variables: getVariables() }),
      });
      if (res.ok) {
        showToast("Saved successfully", "success");
      } else {
        showToast("Failed to save report", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal menyimpan laporan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner"></span></div>;
  if (!report) return <div>Report not found</div>;

  const variables = getVariables();
  const variableEntries = Object.entries(variables);

  return (
    <div className="container mx-auto p-4 max-w-[1600px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link href="/reports-v2" className="btn btn-ghost btn-xs">← Back</Link>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-xs text-base-content/50">Format: {report.schemaId.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          <HelpModal />
          <button onClick={saveReport} className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Variables Panel */}
      <div className="card bg-base-200 border border-base-300 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase text-base-content/50">Variables <span className="font-normal normal-case text-base-content/40">— use <code className="bg-base-300 px-1 rounded">{"{{variable_name}}"}</code> in content or prompt</span></p>
            <button type="button" onClick={addVariable} className="btn btn-xs btn-ghost border border-base-300">+ Add</button>
          </div>
          {variableEntries.length === 0 ? (
            <p className="text-xs text-base-content/30 italic">No variables yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variableEntries.map(([key, value], idx) => {
                const schemaDef = (report.schemaId?.defaultVariables || []).find((v) => v.key === key);
                const items = Array.isArray(value) ? value : (value ? [value] : []);
                const removeItem = (i) => {
                  const next = items.filter((_, ii) => ii !== i);
                  setVariable(key, next.length === 1 ? next[0] : next.length === 0 ? "" : next);
                };
                const addItem = (val) => {
                  if (!val) return;
                  const next = [...items, val];
                  setVariable(key, next.length === 1 ? next[0] : next);
                };
                return (
                  <div key={idx} className="flex flex-col gap-1 bg-base-100 border border-base-content/20 rounded-lg px-2 py-1.5 w-[220px]">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {schemaDef?.label
                          ? <span className="text-xs font-semibold text-base-content/70">{schemaDef.label}</span>
                          : <>
                              <span className="text-xs font-mono text-base-content/40">{"{{"}</span>
                              <input
                                className="input input-xs w-20 font-mono bg-transparent border-none p-0 focus:outline-none text-base-content/70"
                                value={key}
                                onChange={(e) => renameVariableKey(key, e.target.value)}
                              />
                              <span className="text-xs font-mono text-base-content/40">{"}}"}</span>
                            </>
                        }
                        {schemaDef?.label && <span className="text-xs font-mono text-base-content/30">{`{{${key}}}`}</span>}
                      </div>
                      <button onClick={() => removeVariable(key)} className="text-error opacity-40 hover:opacity-100 text-xs leading-none shrink-0">✕</button>
                    </div>
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {items.map((item, i) => (
                          <span key={i} className="flex items-center gap-0.5 bg-base-200 border border-base-content/20 rounded px-1.5 py-0.5 text-xs">
                            {item}
                            <button onClick={() => removeItem(i)} className="text-error opacity-50 hover:opacity-100 ml-0.5 leading-none">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1">
                      <input
                        className="input input-xs flex-1 bg-base-200 border border-base-content/20 rounded"
                        placeholder={items.length > 0 ? "tambah..." : (schemaDef?.defaultValue || "value...")}
                        onKeyDown={(e) => { if (e.key === "Enter") { addItem(e.target.value); e.target.value = ""; } }}
                        onBlur={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = ""; } }}
                      />
                      {tokohList.length > 0 && (
                        <select
                          className="select select-xs bg-base-200 border border-base-content/20 text-base-content/60 flex-1 min-w-[80px] rounded-lg"
                          value=""
                          onChange={(e) => { if (e.target.value) addItem(e.target.value); }}
                        >
                          <option value="">figure...</option>
                          {tokohList.map((t) => (
                            <option key={t._id} value={t.jabatan ? `${t.name} (${t.jabatan})` : t.name}>
                              {t.name}{t.jabatan ? ` — ${t.jabatan}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        className="select select-xs bg-base-200 border border-base-content/20 text-base-content/60 flex-1 min-w-[80px] rounded-lg"
                        value=""
                        onChange={(e) => { if (e.target.value) addItem(e.target.value); }}
                      >
                        <option value="">part...</option>
                        {report.parts.filter((p) => p.content).map((p) => {
                          const def = report.schemaId.structure.find((s) => s.key === p.partKey);
                          return (
                            <option key={p.partKey} value={p.content}>
                              {def?.label || p.partKey}: {p.content.slice(0, 30)}{p.content.length > 30 ? "…" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
          {report.schemaId.structure.map((def) => {
            const part = report.parts.find((p) => p.partKey === def.key);
            if (!part) return null;
            return (
              <div key={def.key} className="card bg-base-100 shadow-inner border border-base-content/20">
                <div className="card-body p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-primary">{def.label}</h3>
                    {/* ask ai is commented because need further flow */}
                    {/* <button
                      className={`btn btn-xs btn-secondary ${generatingPart === def.key ? "loading" : ""}`}
                      onClick={() => generateWithAI(def.key)}
                      disabled={generatingPart !== null}
                    >
                      Ask AI
                    </button> */}
                  </div>

                  {def.inputType === "select" && (def.options || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(def.options || []).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`btn btn-sm ${part.content === opt ? "btn-primary" : "btn-ghost border-base-300"}`}
                          onClick={() => updatePartContent(def.key, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      ref={(el) => { partRefs.current[def.key] = el; }}
                      className="textarea textarea-bordered w-full h-32 font-serif"
                      value={part.content}
                      onChange={(e) => updatePartContent(def.key, e.target.value)}
                      placeholder={def.placeholder || `Enter ${def.label}...`}
                    />
                  )}

                  {/* commented for now */}
                  {/* <div className="mt-2">
                    <p className="text-[10px] uppercase font-bold text-base-content/40 mb-1">Context Sources</p>
                    <div className="flex flex-wrap gap-1">
                      {sources.map((source) => {
                        const isAttached = (part.sourceIds || []).some(s => (s._id || s) === source._id);
                        return (
                          <button
                            key={source._id}
                            className={`btn btn-xs ${isAttached ? "btn-info" : "btn-ghost border-base-300"}`}
                            onClick={() => toggleSourceForPart(def.key, source._id)}
                          >
                            {source.title}
                          </button>
                        );
                      })}
                      {sources.length === 0 && (
                        <p className="text-xs text-base-content/30 italic">
                          No sources yet. <Link href="/reports-v2/sources/new" className="link">Add one</Link>
                        </p>
                      )}
                    </div>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Side */}
        <div className="sticky top-4">
          <ReportPreview report={report} schema={report.schemaId} />
        </div>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type} fixed bottom-4 right-4 w-auto z-50 shadow-lg`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
