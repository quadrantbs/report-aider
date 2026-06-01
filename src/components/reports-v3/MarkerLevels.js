"use client";

import { markerFor } from "@/utils/reports-v3/markers";

const KINDS = [
  { v: "number", label: "1 2 3" },
  { v: "upper-letter", label: "A B C" },
  { v: "letter", label: "a b c" },
  { v: "upper-roman", label: "I II III" },
  { v: "roman", label: "i ii iii" },
  { v: "dash", label: "–" },
  { v: "bullet", label: "•" },
];

const DELIMS = [
  { v: "dot", label: "1." },
  { v: "paren", label: "1)" },
  { v: "bracket", label: "(1)" },
  { v: "plain", label: "1" },
];

const norm = (m) =>
  typeof m === "string" ? { kind: m, delim: "dot" } : { kind: m?.kind || "number", delim: m?.delim || "dot" };

export default function MarkerLevels({ markers, onChange }) {
  const levels = (markers && markers.length ? markers : ["number", "letter", "roman"]).map(norm);

  const update = (i, field, value) => {
    const next = levels.map((l, idx) => (idx === i ? { ...l, [field]: value } : l));
    onChange(next);
  };
  const addLevel = () => onChange([...levels, { kind: "number", delim: "dot" }]);
  const removeLevel = (i) => onChange(levels.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-base-content/60 uppercase">Format per level</p>
      {levels.map((lvl, i) => {
        const isSymbol = lvl.kind === "dash" || lvl.kind === "bullet";
        return (
          <div key={i} className="flex items-center gap-2 flex-wrap bg-base-200 border border-base-content/20 rounded-lg px-2 py-1.5">
            <span className="text-xs text-base-content/50 w-12">Lvl {i + 1}</span>
            <select
              className="select select-xs select-bordered"
              value={lvl.kind}
              onChange={(e) => update(i, "kind", e.target.value)}
            >
              {KINDS.map((k) => (
                <option key={k.v} value={k.v}>{k.label}</option>
              ))}
            </select>
            <select
              className="select select-xs select-bordered"
              value={lvl.delim}
              onChange={(e) => update(i, "delim", e.target.value)}
              disabled={isSymbol}
            >
              {DELIMS.map((d) => (
                <option key={d.v} value={d.v}>{d.label}</option>
              ))}
            </select>
            <span className="text-xs font-mono text-base-content/40 ml-1">
              e.g. {markerFor(lvl, 0)}
            </span>
            <button
              type="button"
              className="text-error opacity-50 hover:opacity-100 text-xs ml-auto"
              onClick={() => removeLevel(i)}
              disabled={levels.length <= 1}
            >
              ✕
            </button>
          </div>
        );
      })}
      <button type="button" className="btn btn-xs btn-ghost border border-base-content/20" onClick={addLevel}>
        + Add Level
      </button>
      <p className="text-[10px] text-base-content/40">Nesting deeper than the configured levels repeats from level 1.</p>
    </div>
  );
}
