"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FiguresPage() {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editJabatan, setEditJabatan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFigures();
  }, []);

  const fetchFigures = async () => {
    try {
      const res = await fetch("/api/v2/tokoh");
      if (res.ok) setFigures(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (t) => {
    setEditing(t._id);
    setEditName(t.name);
    setEditJabatan(t.jabatan || "");
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v2/tokoh/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, jabatan: editJabatan }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFigures(figures.map((t) => (t._id === id ? updated : t)));
        setEditing(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteFigure = async (id) => {
    if (!confirm("Delete this figure?")) return;
    try {
      const res = await fetch(`/api/v2/tokoh/${id}`, { method: "DELETE" });
      if (res.ok) setFigures(figures.filter((t) => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner"></span>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reports-v2" className="btn btn-ghost btn-xs mb-1">
            {"<-"} Reports
          </Link>
          <h1 className="text-3xl font-bold">Figures</h1>
        </div>
        <Link href="/reports-v2/tokoh/new" className="btn btn-primary">
          + Add Figure
        </Link>
      </div>

      {figures.length === 0 ? (
        <div className="text-center py-12 text-base-content/40">
          <p className="text-lg">No figures yet.</p>
          <Link href="/reports-v2/tokoh/new" className="btn btn-primary mt-4">
            Add your first figure
          </Link>
        </div>
      ) : (
        <div className="bg-base-300 rounded-xl p-3 space-y-2">
          {figures.map((t) => (
            <div key={t._id} className="card bg-base-100 shadow-md border border-base-content/20 border-l-4 border-l-primary">
              <div className="card-body p-4">
                {editing === t._id ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      className="input input-sm input-bordered flex-1 min-w-32"
                      value={editName}
                      placeholder="Full Name"
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      className="input input-sm input-bordered flex-1 min-w-32"
                      value={editJabatan}
                      placeholder="Position / Role"
                      onChange={(e) => setEditJabatan(e.target.value)}
                    />
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => saveEdit(t._id)}
                      disabled={saving || !editName.trim()}
                    >
                      Save
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      {t.jabatan && (
                        <p className="text-sm text-base-content/50">{t.jabatan}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-ghost border border-base-content/20"
                        onClick={() => startEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-error btn-outline"
                        onClick={() => deleteFigure(t._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
