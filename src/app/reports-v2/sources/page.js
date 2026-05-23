"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TextSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/v2/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Failed to fetch sources", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSource = async (id) => {
    if (!confirm("Delete this source?")) return;

    try {
      const res = await fetch(`/api/v2/sources/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSources(sources.filter((s) => s._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete source", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Text Sources</h1>
        <Link href="/reports-v2/sources/new" className="btn btn-primary">
          Add Source
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center p-10 bg-base-100 rounded-lg border border-base-content/20">
          <p className="text-xl">No text sources yet.</p>
          <p className="text-base-content/60">Upload transcripts, articles, or notes as AI context.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <div key={source._id} className="card bg-base-100 shadow-md border border-base-content/20">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="card-title">{source.title}</h2>
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-sm badge-outline">{source.type}</span>
                      <span className="text-xs text-base-content/50">
                        {new Date(source.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteSource(source._id)}
                      className="btn btn-square btn-ghost btn-sm text-error"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm line-clamp-2 mt-2 text-base-content/70">
                  {source.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
