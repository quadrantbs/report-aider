"use client";

export const newItem = () => ({ id: crypto.randomUUID(), text: "", children: [] });

export const DEFAULT_BLOCKS = {
  keyvalue: () => ({ type: "keyvalue", style: "none", rows: [{ label: "", value: "" }] }),
  paragraph: () => ({ type: "paragraph", style: "none", label: "", labelStyle: "none", text: "" }),
  list: () => ({
    type: "list",
    label: "",
    labelStyle: "bold",
    markers: [{ kind: "number", delim: "dot" }, { kind: "letter", delim: "dot" }],
    itemStyle: "none",
    spacing: false,
    items: [newItem()],
  }),
  divider: () => ({ type: "divider" }),
};

export function AddBlockBar({ onAdd }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-3 border border-dashed border-base-content/20 rounded-lg">
      <span className="text-xs text-base-content/50 self-center">Add block:</span>
      <button type="button" className="btn btn-xs btn-outline" onClick={() => onAdd("keyvalue")}>Header</button>
      <button type="button" className="btn btn-xs btn-outline" onClick={() => onAdd("paragraph")}>Paragraph</button>
      <button type="button" className="btn btn-xs btn-outline" onClick={() => onAdd("list")}>List</button>
      <button type="button" className="btn btn-xs btn-outline" onClick={() => onAdd("divider")}>Divider</button>
    </div>
  );
}
