"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const remove = async (id) => {
    if (!confirm("Delete this format?")) return;
    try {
      const res = await fetch(`/api/v3/templates/${id}`, { method: "DELETE" });
      if (res.ok) setTemplates(templates.filter((t) => t._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reports-v3" className="btn btn-ghost btn-sm mb-1">← Reports V3</Link>
          <h1 className="text-3xl font-bold">Report Formats</h1>
        </div>
        <Link href="/reports-v3/templates/new" className="btn btn-primary">New Format</Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
      ) : templates.length === 0 ? (
        <div className="text-center p-10 bg-base-100 rounded-lg border border-base-content/20">
          <p className="text-xl">No custom formats yet.</p>
          <p className="text-base-content/60">Create a format to reuse across many reports. The built-in (LMG) format is always available when creating a report.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div key={t._id} className="card bg-base-100 shadow-md border border-base-content/20">
              <div className="card-body p-4 flex-row justify-between items-center">
                <div>
                  <h2 className="card-title">{t.name}</h2>
                  <div className="flex gap-2 items-center mt-1">
                    {t.isPublic && <span className="badge badge-sm badge-success badge-outline">Public</span>}
                    <span className="text-xs text-base-content/50">{(t.blocks || []).length} blocks</span>
                    {t.description && <span className="text-xs text-base-content/50">· {t.description}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/reports-v3/templates/${t._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                  <button onClick={() => remove(t._id)} className="btn btn-ghost btn-sm text-error">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
