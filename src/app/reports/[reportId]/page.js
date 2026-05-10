"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatReport, FormattedReport } from "@/components/FormattedReport";
import Link from "next/link";

const ReportDetails = () => {
  const { data: session } = useSession();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // useEffect(() => {
  //   if (!session) {
  //     router.push("/login");
  //   }
  // }, []);

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this report?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete report");
      }
      alert("Report deleted successfully!");
      router.push("/reports");
    } catch (err) {
      alert(`Error deleting report: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch report details");
        }
        const data = await response.json();
        setReport(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (loading)
    return (
      <main className="p-6 bg-base-100 text-base-content text-center">
        <h1 className="text-4xl font-bold">Loading Report...</h1>
      </main>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!report) return <div className="text-center">No report found.</div>;

  const handleCopy = () => {
    const formattedText = formatReport(report);
    navigator.clipboard
      .writeText(formattedText)
      .catch((err) => alert("Failed to copy report: " + err.message));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 text-base-content">
      <h1 className="text-3xl font-bold mb-4 text-center">Report Details</h1>
      <div className="mb-4 gap-2 flex justify-center">
        <button onClick={handleCopy} className="btn btn-primary truncate">
          Copy Report
        </button>
        <Link href={`/reports/${report._id}/edit`}>
          <button className="w-full btn btn-accent hover:btn-secondary transition-all">
            Edit
          </button>
        </Link>
        <button onClick={handleDelete} className="btn btn-error truncate">
          Delete Report
        </button>
      </div>
      <div className="space-y-4">
        <FormattedReport report={report} inDetails={true} />
      </div>
    </div>
  );
};

export default ReportDetails;
