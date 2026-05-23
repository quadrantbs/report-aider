"use client";

import { useState } from "react";

const sections = [
  {
    title: "Variables",
    content: [
      {
        heading: "Define variables in a format",
        body: "Go to Formats → edit a format → Template Variables section → click + Add. Set a key (no spaces) and a label. Example: key = date, label = Event Date.",
      },
      {
        heading: "Use variables in prompts / WA format",
        body: "Write {{key}} anywhere in an AI Prompt or WA Format string. Example: \"On {{date}}, in {{city}}, {isi}\". Click a {{key}} chip below the field to insert it at the cursor.",
      },
      {
        heading: "Fill variable values in a report",
        body: "In the report editor, use the Variables panel at the top. Each variable has a text input, a figure picker, and a part picker. You can add multiple values — press Enter or pick from a dropdown; each value becomes a chip. When rendered, values are joined with commas.",
      },
      {
        heading: "Ad-hoc variables (not from format)",
        body: "Click + Add in the Variables panel to create a new variable. The key is editable inline. Useful for one-off data specific to a single report.",
      },
    ],
  },
  {
    title: "WA Format",
    content: [
      {
        heading: "Content placeholder",
        body: "{isi} is the placeholder for the section's content. Example: \"*To: {isi}*\" renders as \"*To: Bupati Lamongan*\".",
      },
      {
        heading: "Newline",
        body: "Use \\n inside the format string for a line break. Example: \"*Title*\\n{isi}\" renders the title on one line and the content below it.",
      },
      {
        heading: "Bold / italic style",
        body: "Wrap the entire format with *...* (bold), _..._ (italic), or _*...*_ (bold-italic). Use the preset buttons in the schema editor to apply quickly.",
      },
    ],
  },
  {
    title: "WA List",
    content: [
      {
        heading: "Enable List mode",
        body: "In the schema editor → WA Format section → toggle List on. Each non-empty line in the content will be auto-numbered or lettered.",
      },
      {
        heading: "Writing list content",
        body: "Write one item per line in the content textarea. Empty lines are ignored. Example:\nAttend coordination meeting\nPrepare weekly report\nSend to supervisor",
      },
      {
        heading: "Nested list",
        body: "Check 'Nested items' in the schema editor. Lines starting with 2 or more spaces become sub-items with letter numbering. Example:\nMain item\n  sub-item a\n  sub-item b\nNext main item",
      },
      {
        heading: "Item style",
        body: "Choose Bold, Italic, or Bold-Italic — the marker and text are both wrapped. Example with bold: *1. First item*",
      },
    ],
  },
  {
    title: "Figures",
    content: [
      {
        heading: "What are Figures",
        body: "A reusable directory of people frequently mentioned in reports. Each figure has a Full Name and Position/Role. Access from Reports V2 → Figures in the nav menu.",
      },
      {
        heading: "Use figures in variables",
        body: "In the report's Variables panel, each variable has a 'figure...' dropdown. Select a figure and it's added as a chip. Format: \"Name (Position)\" or just \"Name\" if no position is set.",
      },
    ],
  },
  {
    title: "Part Picker",
    content: [
      {
        heading: "Pull value from another section",
        body: "In the Variables panel, the 'part...' dropdown lists all report sections that already have content. Select one and its content is added as a variable value. Useful for filling variables from sections like To, From, or Subject.",
      },
    ],
  },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-circle btn-ghost btn-sm border border-base-content/20"
        title="Cara penggunaan"
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-base-100 border border-base-content/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-base-content/10">
              <h2 className="font-bold text-lg">How to Use</h2>
              <button onClick={() => setOpen(false)} className="btn btn-circle btn-ghost btn-sm">✕</button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Sidebar */}
              <div className="w-40 shrink-0 border-r border-base-content/10 py-2">
                {sections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`w-full text-left px-4 py-2 text-sm ${active === i ? "bg-primary/10 text-primary font-semibold" : "text-base-content/60 hover:text-base-content"}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {sections[active].content.map((item, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm text-base-content/80 mb-1">{item.heading}</p>
                    <p className="text-sm text-base-content/60 whitespace-pre-line">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
