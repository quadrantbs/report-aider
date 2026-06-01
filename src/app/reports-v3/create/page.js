"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Built-in preset is always offered; user templates are fetched from the API.
const BUILTIN = { id: "builtin:v1", name: "Activity Report (LMG)", description: "Built-in format: header, narrative, nested point body, and notes.", builtin: true };

export default function CreateReportV3Page() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [choice, setChoice] = useState(BUILTIN.id);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v3/templates");
        if (res.ok) setTemplates(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const options = [BUILTIN, ...templates.map((t) => ({ id: t._id, name: t.name, description: t.description, builtin: false, template: t }))];

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    const selected = options.find((o) => o.id === choice);
    let payload = { title };

    if (!selected || selected.builtin) {
      payload.presetKey = "v1";
    } else {
      const t = selected.template;
      const variables = {};
      (t.defaultVariables || []).forEach((v) => {
        if (v.key) variables[v.key] = v.defaultValue || "";
      });
      payload = { ...payload, presetKey: t.name, blocks: t.blocks, variables };
    }

    try {
      const res = await fetch("/api/v3/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const report = await res.json();
        router.push(`/reports-v3/${report._id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to create report");
        setCreating(false);
      }
    } catch (error) {
      console.error(error);
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Report</h1>
        <Link href="/reports-v3/templates" className="btn btn-ghost btn-sm">Manage Formats</Link>
      </div>

      <form onSubmit={handleCreate} className="card bg-base-100 shadow-xl border border-base-content/20">
        <div className="card-body">
          <div className="form-control">
            <label className="label"><span className="label-text font-bold">Report Title</span></label>
            <input type="text" className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Daily Report — June 1" />
          </div>

          <div className="form-control mt-4">
            <label className="label"><span className="label-text font-bold">Choose Format</span></label>
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <div className="space-y-2">
                {options.map((o) => (
                  <label key={o.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${choice === o.id ? "border-primary bg-primary/5" : "border-base-content/20"}`}>
                    <input type="radio" name="format" className="radio radio-primary mt-1" checked={choice === o.id} onChange={() => setChoice(o.id)} />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {o.name}
                        {o.builtin && <span className="badge badge-xs badge-neutral">built-in</span>}
                      </div>
                      {o.description && <div className="text-xs text-base-content/60">{o.description}</div>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card-actions justify-end mt-6">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Report"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
