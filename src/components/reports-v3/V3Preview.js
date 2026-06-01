"use client";

import { useState } from "react";
import { compileReport } from "@/utils/reports-v3/compiler";
import { renderToWhatsApp } from "@/utils/reports-v3/renderers/whatsapp";
import { renderToMarkdown } from "@/utils/reports-v3/renderers/markdown";
import { renderToHTML } from "@/utils/reports-v3/renderers/html";

export default function V3Preview({ blocks, variables }) {
  const [format, setFormat] = useState("whatsapp");
  const [copied, setCopied] = useState(false);

  const compiled = compileReport({ blocks: blocks || [], variables: variables || {} });

  let content = "";
  if (format === "markdown") content = renderToMarkdown(compiled);
  else if (format === "html") content = renderToHTML(compiled);
  else content = renderToWhatsApp(compiled);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card bg-base-100 shadow-inner border border-base-content/20 h-full">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Preview</h3>
          <div className="flex gap-2">
            <div className="join">
              {[
                { v: "whatsapp", label: "WA" },
                { v: "markdown", label: "MD" },
                { v: "html", label: "HTML" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  className={`btn btn-xs join-item ${format === v ? "btn-primary" : ""}`}
                  onClick={() => setFormat(v)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="btn btn-xs btn-outline" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="bg-base-100 p-4 rounded-lg overflow-auto h-[600px] font-mono text-sm whitespace-pre-wrap border border-base-content/20">
          {format === "html" ? (
            <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-sm max-w-none" />
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
