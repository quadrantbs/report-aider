/**
 * Built-in report presets. A preset is just a starter block tree (plus default
 * variables) used to seed a new ReportV3. Reports are self-contained after
 * creation, so editing a preset never affects existing reports.
 */

// Mirrors the real LMG field-report layout (LK LMG 01): a 6-row header, a
// divider, an opening narrative, a deeply-nestable body list (A. > 1. > a. >
// 1) > -), and a free-text Catatan. Every fixed-count section is now variable.
export const V1_PRESET = {
  key: "v1",
  name: "Activity Report (LMG)",
  description: "Field report format: header, opening narrative, nested point body, and notes.",
  defaultVariables: [
    { key: "tanggal", label: "Date", defaultValue: "" },
    { key: "perihal", label: "Subject", defaultValue: "" },
    { key: "nilai", label: "Grade", defaultValue: "A-1" },
  ],
  blocks: [
    {
      type: "keyvalue",
      style: "none",
      rows: [
        { label: "Kepada Yth.", value: "KM 01." },
        { label: "Tembusan Yth.", value: "KM 02 & KM 03." },
        { label: "Dari", value: "LMG 01" },
        { label: "Tanggal", value: "{{tanggal}}" },
        { label: "Perihal", value: "{{perihal}}" },
        { label: "Nilai", value: "{{nilai}}" },
      ],
    },
    { type: "divider" },
    {
      type: "paragraph",
      style: "none",
      label: "",
      labelStyle: "none",
      text: "Pada {{tanggal}}, di Kab. Lamongan, telah dilaksanakan kegiatan ... Selengkapnya dilaporkan sbb :",
    },
    {
      type: "list",
      label: "",
      labelStyle: "bold",
      // A. > 1. > a. > 1) > -  (matches the richest LMG report)
      markers: [
        { kind: "upper-letter", delim: "dot" },
        { kind: "number", delim: "dot" },
        { kind: "letter", delim: "dot" },
        { kind: "number", delim: "paren" },
        { kind: "dash" },
      ],
      itemStyle: "none",
      spacing: false,
      items: [
        {
          id: "body_1",
          text: "",
          children: [{ id: "body_1_1", text: "", children: [] }],
        },
      ],
    },
    {
      type: "list",
      label: "Catatan",
      labelStyle: "none",
      markers: [{ kind: "number", delim: "dot" }, { kind: "letter", delim: "dot" }],
      itemStyle: "none",
      spacing: false,
      items: [{ id: "note_1", text: "", children: [] }],
    },
  ],
};

export const PRESETS = {
  v1: V1_PRESET,
};

export function getPreset(key) {
  return PRESETS[key] || V1_PRESET;
}
