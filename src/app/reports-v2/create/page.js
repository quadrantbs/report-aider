"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateReportV2Page() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [selectedSchemaId, setSelectedSchemaId] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const res = await fetch("/api/v2/schemas");
      if (res.ok) {
        const data = await res.json();
        setSchemas(data);
        if (data.length > 0) setSelectedSchemaId(data[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedSchemaId) return alert("Please select a format first");

    const schema = schemas.find((s) => s._id === selectedSchemaId);

    const parts = schema.structure.map((def) => ({
      partKey: def.key,
      content: "",
      overridePrompt: def.defaultPrompt || "",
      sourceIds: [],
    }));

    const variables = {};
    (schema.defaultVariables || []).forEach((v) => {
      variables[v.key] = v.defaultValue || "";
    });

    try {
      const res = await fetch("/api/v2/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          schemaId: selectedSchemaId,
          parts,
          data: {},
          variables,
        }),
      });

      if (res.ok) {
        const report = await res.json();
        router.push(`/reports-v2/${report._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner"></span></div>;

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Create New Report</h1>

      {schemas.length === 0 ? (
        <div className="alert alert-warning">
          <span>Create a <Link href="/reports-v2/schemas/new" className="link font-bold">Report Format</Link> first.</span>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="card bg-base-100 shadow-xl border border-base-content/20">
          <div className="card-body">
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Report Title</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Daily Social Update - May 23"
              />
            </div>

            <div className="form-control mt-4">
              <label className="label"><span className="label-text font-bold">Select Format</span></label>
              <select 
                className="select select-bordered" 
                value={selectedSchemaId} 
                onChange={(e) => setSelectedSchemaId(e.target.value)}
              >
                {schemas.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="card-actions justify-end mt-6">
              <button type="submit" className="btn btn-primary">Create Report</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
