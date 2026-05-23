"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSourcePage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "article",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v2/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/reports-v2/sources");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save source");
      }
    } catch (error) {
      console.error("Error creating source", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/reports-v2/sources" className="btn btn-ghost btn-sm mb-2">
          ← Text Sources
        </Link>
        <h1 className="text-3xl font-bold">New Text Source</h1>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl border border-base-content/20">
        <div className="card-body">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Title</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Interview transcript with the Mayor"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text font-bold">Type</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="article">Article</option>
              <option value="transcript">Transcript</option>
              <option value="meeting-notes">Meeting Notes</option>
              <option value="copied-text">Copied Text</option>
              <option value="markdown">Markdown</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text font-bold">Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-64 font-mono text-sm"
              placeholder="Paste text content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              Save Source
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
