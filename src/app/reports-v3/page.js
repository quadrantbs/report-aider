"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ReportsV3Page() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/v3/reports");
      if (res.ok) setReports(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;
    try {
      const res = await fetch(`/api/v3/reports/${id}`, { method: "DELETE" });
      if (res.ok) setReports(reports.filter((r) => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports V3</h1>
        <div className="flex gap-2">
          <Link href="/reports-v3/templates" className="btn btn-ghost btn-outline">
            Formats
          </Link>
          <Link href="/reports-v3/create" className="btn btn-primary">
            New Report
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center p-10 bg-base-100 rounded-lg border border-base-content/20">
          <p className="text-xl">No reports yet.</p>
          <p className="text-base-content/60">Create a new report to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report._id} className="card bg-base-100 shadow-md border border-base-content/20">
              <div className="card-body p-4 flex-row justify-between items-center">
                <div>
                  <h2 className="card-title">
                    <Link href={`/reports-v3/${report._id}`} className="hover:text-primary">
                      {report.title}
                    </Link>
                  </h2>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="badge badge-sm badge-outline">{report.presetKey}</span>
                    <span className="badge badge-sm badge-primary badge-outline">{report.status}</span>
                    <span className="text-xs text-base-content/50">
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/reports-v3/${report._id}`} className="btn btn-ghost btn-sm">Open</Link>
                  <button onClick={() => deleteReport(report._id)} className="btn btn-ghost btn-sm text-error">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
