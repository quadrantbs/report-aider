"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewFigurePage() {
  const [name, setName] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v2/tokoh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, jabatan }),
      });
      if (res.ok) {
        router.push("/reports-v2/tokoh");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="mb-6">
        <Link href="/reports-v2/tokoh" className="btn btn-ghost btn-sm mb-2">
          {"<-"} Figures
        </Link>
        <h1 className="text-3xl font-bold">Add Figure</h1>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md border border-base-content/20 border-l-4 border-l-primary">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Budi Santoso"
            />
          </div>
          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text font-bold">Position / Role</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="e.g. Governor of East Java"
            />
          </div>
          <div className="card-actions justify-end mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Figure"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
