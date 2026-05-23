"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PartCard from "@/components/reports-v2/PartCard";
import HelpModal from "@/components/reports-v2/HelpModal";

export default function EditSchemaPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [parts, setParts] = useState([]);
  const [defaultVariables, setDefaultVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSchema();
  }, [id]);

  const fetchSchema = async () => {
    try {
      const res = await fetch(`/api/v2/schemas/${id}`);
      if (!res.ok) {
        router.push("/reports-v2/schemas");
        return;
      }
      const data = await res.json();
      setName(data.name || "");
      setDescription(data.description || "");
      setIsPublic(data.isPublic || false);
      setDefaultVariables(data.defaultVariables || []);
      setParts(data.structure || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addVariable = () =>
    setDefaultVariables([...defaultVariables, { key: `var_${Date.now()}`, label: "", defaultValue: "" }]);

  const updateVariable = (i, field, value) => {
    const next = [...defaultVariables];
    next[i] = { ...next[i], [field]: value };
    setDefaultVariables(next);
  };

  const removeVariable = (i) => setDefaultVariables(defaultVariables.filter((_, idx) => idx !== i));

  const addPart = () =>
    setParts([
      ...parts,
      {
        key: `part_${Date.now()}`,
        label: "New Part",
        defaultPrompt: "",
        inputType: "text",
        options: [],
        renderConfig: { wa: { format: "{isi}", showLabel: true } },
      },
    ]);

  const movePart = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= parts.length) return;
    const next = [...parts];
    [next[index], next[target]] = [next[target], next[index]];
    setParts(next);
  };

  const removePart = (index) => setParts(parts.filter((_, i) => i !== index));

  const updatePart = (index, updated) => {
    const next = [...parts];
    next[index] = updated;
    setParts(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v2/schemas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, structure: parts, isPublic, defaultVariables }),
      });
      if (res.ok) {
        router.push("/reports-v2/schemas");
      } else {
        alert("Failed to save format");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner"></span>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      <div className="mb-6">
        <Link href="/reports-v2/schemas" className="btn btn-ghost btn-sm mb-2">
          {"<-"} Report Formats
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Edit Format</h1>
          <HelpModal />
        </div>
      </div>

      <form id="edit-schema-form" onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body">
            <h2 className="card-title">General Info</h2>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Format Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-control w-full mt-2">
              <label className="label">
                <span className="label-text font-bold">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this format for?"
              />
            </div>
            <div className="form-control mt-3">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="label-text">
                  <span className="font-bold">{isPublic ? "Public" : "Private"}</span>
                  <span className="text-base-content/50 ml-2 text-xs">
                    {isPublic ? "All users can see and use this format" : "Only you can see this format"}
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Template Variables */}
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="card-title">Template Variables</h2>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Variables auto-added to every report. Use{" "}
                  <code className="bg-base-200 px-1 rounded">{"{{key}}"}</code>{" "}
                  in prompts or content.
                </p>
              </div>
              <button type="button" onClick={addVariable} className="btn btn-sm btn-ghost border border-base-300">
                + Add
              </button>
            </div>
            {defaultVariables.length === 0 ? (
              <p className="text-xs text-base-content/30 italic">No template variables.</p>
            ) : (
              <div className="space-y-2">
                {defaultVariables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap bg-base-200 border border-base-300 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-base-content/40 font-mono">{"{{"}</span>
                      <input
                        className="input input-xs w-24 font-mono bg-transparent border-none p-0 focus:outline-none"
                        value={v.key}
                        placeholder="key"
                        onChange={(e) => updateVariable(i, "key", e.target.value)}
                      />
                      <span className="text-xs text-base-content/40 font-mono">{"}}"}</span>
                    </div>
                    <input
                      className="input input-xs input-bordered w-32 bg-base-100"
                      value={v.label}
                      placeholder="Label"
                      onChange={(e) => updateVariable(i, "label", e.target.value)}
                    />
                    <input
                      className="input input-xs input-bordered w-32 bg-base-100"
                      value={v.defaultValue}
                      placeholder="Default value"
                      onChange={(e) => updateVariable(i, "defaultValue", e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-error opacity-50 hover:opacity-100 text-xs"
                      onClick={() => removeVariable(i)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body">
            <div className="flex justify-between items-center sticky top-0 z-10 bg-base-100 py-3 -mx-6 px-6 border-b border-base-300 mb-4">
              <h2 className="card-title">Sections</h2>
              <button type="button" onClick={addPart} className="btn btn-sm btn-secondary">
                Add Section
              </button>
            </div>
            <div className="space-y-4">
              {parts.map((part, index) => (
                <PartCard
                  key={index}
                  part={part}
                  index={index}
                  totalParts={parts.length}
                  onMove={(dir) => movePart(index, dir)}
                  onChange={(updated) => updatePart(index, updated)}
                  onRemove={() => removePart(index)}
                  availableVariables={defaultVariables}
                />
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 px-4 py-3 flex justify-end">
        <button type="submit" form="edit-schema-form" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
