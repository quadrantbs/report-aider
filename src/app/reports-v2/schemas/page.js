"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SchemasPage() {
  const { data: session } = useSession();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      const res = await fetch("/api/v2/schemas");
      if (res.ok) {
        const data = await res.json();
        setSchemas(data);
      }
    } catch (error) {
      console.error("Failed to fetch schemas", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchema = async (id) => {
    if (!confirm("Delete this format?")) return;
    try {
      const res = await fetch(`/api/v2/schemas/${id}`, { method: "DELETE" });
      if (res.ok) setSchemas(schemas.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete schema", error);
    }
  };

  const togglePublic = async (schema) => {
    try {
      const res = await fetch(`/api/v2/schemas/${schema._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !schema.isPublic }),
      });
      if (res.ok) {
        setSchemas(schemas.map((s) =>
          s._id === schema._id ? { ...s, isPublic: !s.isPublic } : s
        ));
      }
    } catch (error) {
      console.error("Failed to toggle visibility", error);
    }
  };

  const currentUserId = session?.user?.id || session?.user?.sub;
  const mySchemas = schemas.filter((s) => s.userId === currentUserId || s.userId?._id === currentUserId);
  const publicSchemas = schemas.filter((s) => s.userId !== currentUserId && s.userId?._id !== currentUserId && s.isPublic);

  const SchemaCard = ({ schema, isOwner }) => (
    <div className="card bg-base-100 shadow-md border border-base-content/20">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="card-title">{schema.name}</h2>
              <span className={`badge badge-sm ${schema.isPublic ? "badge-success" : "badge-ghost"}`}>
                {schema.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <p className="text-sm text-base-content/60 mt-1">{schema.description}</p>
            <div className="flex gap-2 mt-2">
              <span className="badge badge-sm">{schema.structure.length} parts</span>
              <span className="text-xs text-base-content/50">
                v{schema.version} • {new Date(schema.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-1 ml-2 shrink-0">
              <button
                onClick={() => togglePublic(schema)}
                className={`btn btn-xs ${schema.isPublic ? "btn-warning" : "btn-success"}`}
                title={schema.isPublic ? "Make private" : "Make public"}
              >
                {schema.isPublic ? "Private" : "Public"}
              </button>
              <Link
                href={`/reports-v2/schemas/${schema._id}/edit`}
                className="btn btn-xs btn-outline"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteSchema(schema._id)}
                className="btn btn-square btn-ghost btn-sm text-error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Report Formats</h1>
        <Link href="/reports-v2/schemas/new" className="btn btn-primary">
          Create New Format
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-base-content/70">My Formats</h2>
            {mySchemas.length === 0 ? (
              <div className="text-center p-8 bg-base-100 rounded-lg border border-base-content/20">
                <p className="text-base-content/60">No formats yet. <Link href="/reports-v2/schemas/new" className="link">Create one</Link></p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mySchemas.map((s) => <SchemaCard key={s._id} schema={s} isOwner={true} />)}
              </div>
            )}
          </section>

          {publicSchemas.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-base-content/70">Public Formats from Other Users</h2>
              <div className="grid gap-4">
                {publicSchemas.map((s) => <SchemaCard key={s._id} schema={s} isOwner={false} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
