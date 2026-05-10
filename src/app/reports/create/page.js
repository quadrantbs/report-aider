"use client";

import { AIFillFormModals } from "@/components/AIFillFormModals";
import { FormattedReport } from "@/components/FormattedReport";
import { addTrailingDot, removeTrailingDot } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CreateReport = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    areaOfReport: "",
    to: "KM 01",
    cc: ["KM 02", "KM 03"],
    from: "LMG 01",
    field: "Sosbud",
    code: "🟢",
    subject: "",
    reportDate: new Date().toISOString().split("T")[0],
    source: [{ name: "", position: "" }],
    twoSentencesConclusion: "",
    details: [[""]],
    notesRecap: "",
    notesToDo: "",
    notesMonitoring: "",
    article: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSourceChange = (index, key, value) => {
    const updatedSource = [...formData.source];
    updatedSource[index][key] = value;
    setFormData((prev) => ({ ...prev, source: updatedSource }));
  };

  const addSource = () => {
    setFormData((prev) => ({
      ...prev,
      source: [...prev.source, { name: "", position: "" }],
    }));
  };

  const deleteSource = (index) => {
    const updatedSource = [...formData.source];
    updatedSource.splice(index, 1);
    setFormData((prev) => ({ ...prev, source: updatedSource }));
  };

  const handleDetailsChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = value.split("\n");
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const addDetailsRow = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, []],
    }));
  };

  const deleteDetailsRow = (index) => {
    const updatedDetails = [...formData.details];
    updatedDetails.splice(index, 1);
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedReportDate = new Date(formData.reportDate).toISOString();
      const formattedSubject = removeTrailingDot(formData.subject);
      const formattedTwoSentencesConclusion = removeTrailingDot(
        formData.twoSentencesConclusion
      );
      const formattedNotesRecap = addTrailingDot(formData.notesRecap);
      const formattedNotesToDo = addTrailingDot(formData.notesToDo);
      const formattedNotesMonitoring = removeTrailingDot(
        formData.notesMonitoring
      );
      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          reportDate: formattedReportDate,
          subject: formattedSubject,
          twoSentencesConclusion: formattedTwoSentencesConclusion,
          notesRecap: formattedNotesRecap,
          notesToDo: formattedNotesToDo,
          notesMonitoring: formattedNotesMonitoring,
        }),
      });
      const data = await response.json();
      if (data.success) {
        router.push("/reports");
      } else {
        if (data.error === "Unauthorized") {
          setError("Unauthorized, please login first");
          router.push("/login");
        } else {
          setError(data.error);
        }
      }
    } catch (error) {
      alert(error);
      setError(error);
      console.error("Error creating report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-center mb-4">Create Report</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-base-100 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-2xl mx-auto text-base-content"
      >
        {error && <h2 className="text-red-500 text-center">{error}</h2>}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Area of Report:</span>
          </label>
          <input
            type="text"
            name="areaOfReport"
            value={formData.areaOfReport}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="Enter area, e.g. Kab. Lamongan, Kota Semarang, etc."
          />
        </div>
        <div className="flex flex-row">
          <div className="form-control w-1/3">
            <label className="label">
              <span className="label-text">To:</span>
            </label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>
          <div className="form-control w-1/3">
            <label className="label">
              <span className="label-text">CC:</span>
            </label>
            <input
              type="text"
              name="cc"
              value={formData.cc.join(",")}
              onChange={(e) =>
                setFormData({ ...formData, cc: e.target.value.split(",") })
              }
              className="input input-bordered"
            />
          </div>
          <div className="form-control w-1/3">
            <label className="label">
              <span className="label-text">From:</span>
            </label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="form-control w-1/2">
            <label className="label">
              <span className="label-text">Field:</span>
            </label>
            <input
              type="text"
              name="field"
              value={formData.field}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>
          <div className="form-control w-1/2">
            <label className="label">
              <span className="label-text">Code:</span>
            </label>
            <select
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="select select-bordered"
            >
              <option value="🔴">Red (🔴)</option>
              <option value="🟡">Yellow (🟡)</option>
              <option value="🟢">Green (🟢)</option>
            </select>
          </div>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Subject:</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="Enter subject"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Report Date:</span>
          </label>
          <input
            type="date"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Source:</span>
          </label>
          {formData?.source?.map((src, index) => (
            <div key={index} className="flex mb-2 items-center">
              <input
                type="text"
                placeholder="Name"
                value={src.name}
                onChange={(e) =>
                  handleSourceChange(index, "name", e.target.value)
                }
                className="input input-bordered flex-1 w-1/2"
              />
              <input
                type="text"
                placeholder="Position"
                value={src.position}
                onChange={(e) =>
                  handleSourceChange(index, "position", e.target.value)
                }
                className="input input-bordered flex-1 w-1/2"
              />
              {formData.source.length !== 1 && (
                <button
                  type="button"
                  onClick={() => {
                    deleteSource(index);
                    deleteDetailsRow(index);
                  }}
                  className="btn btn-error btn-xs"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              addDetailsRow();
              addSource();
            }}
            className="btn btn-secondary"
          >
            Add Source
          </button>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Details:</span>{" "}
          </label>
          <button
            className="btn btn-outline min-h-6 h-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("detailsFill").showModal();
            }}
          >
            Ask AI to fill
          </button>
          {formData.details.map((detail, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <textarea
                placeholder="Enter details, separated by new line"
                value={detail.join("\n")}
                onChange={(e) => handleDetailsChange(index, e.target.value)}
                className="textarea textarea-bordered w-full  h-48"
              />
              {formData.source.length !== 1 && (
                <button
                  type="button"
                  onClick={() => {
                    deleteDetailsRow(index);
                    deleteSource(index);
                  }}
                  className="btn btn-error btn-xs"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              addDetailsRow();
              addSource();
            }}
            className="btn btn-secondary"
          >
            Add Details Row
          </button>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Two Sentences Conclusion:</span>
          </label>
          <button
            className="btn btn-outline min-h-6 h-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("twoSentencesConclusion").showModal();
            }}
          >
            Ask AI to fill
          </button>
          <textarea
            name="twoSentencesConclusion"
            value={formData.twoSentencesConclusion}
            onChange={handleChange}
            className="textarea textarea-bordered h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            placeholder="Enter two sentences conclusion"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes Recap:</span>
          </label>
          <button
            className="btn btn-outline min-h-6 h-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("notesRecap").showModal();
            }}
          >
            Ask AI to fill
          </button>
          <textarea
            name="notesRecap"
            value={formData.notesRecap}
            onChange={handleChange}
            className="textarea textarea-bordered h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            placeholder="Enter notes recap"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes To-Do:</span>
          </label>
          <button
            className="btn btn-outline min-h-6 h-6"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("notesToDo").showModal();
            }}
          >
            Ask AI to fill
          </button>
          <textarea
            name="notesToDo"
            value={formData.notesToDo}
            onChange={handleChange}
            className="textarea textarea-bordered h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            placeholder="Enter notes to-do"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes Monitoring:</span>
          </label>
          <textarea
            name="notesMonitoring"
            value={formData.notesMonitoring}
            onChange={handleChange}
            className="textarea textarea-bordered"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            placeholder="Enter notes monitoring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary w-full mt-4 ${loading ? "loading" : ""}`}
        >
          Create Report
        </button>
      </form>
      <FormattedReport report={formData} />
      <AIFillFormModals
        formData={formData}
        handleChange={handleChange}
        setFormData={setFormData}
      />
    </div>
  );
};

export default CreateReport;
