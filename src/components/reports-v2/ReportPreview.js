"use client";

import { compileReportToAST } from "@/utils/reports-v2/compiler";
import { renderToMarkdown } from "@/utils/reports-v2/renderers/markdown";
import { renderToWhatsApp } from "@/utils/reports-v2/renderers/whatsapp";
import { renderToHTML } from "@/utils/reports-v2/renderers/html";
import { useState } from "react";

export default function ReportPreview({ report, schema }) {
  const [format, setFormat] = useState("whatsapp");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ast = compileReportToAST(report, schema);
  if (!ast) return null;

  let content = "";
  if (format === "markdown") content = renderToMarkdown(ast);
  else if (format === "whatsapp") content = renderToWhatsApp(ast);
  else if (format === "html") content = renderToHTML(ast);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    showToast("Copied!", "success");
  };

  return (
    <div className="card bg-base-100 shadow-inner border border-base-content/20 h-full">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Preview</h3>
          <div className="flex gap-2">
            <div className="join">
              <button 
                className={`btn btn-xs join-item ${format === "markdown" ? "btn-primary" : ""}`}
                onClick={() => setFormat("markdown")}
              >MD</button>
              <button 
                className={`btn btn-xs join-item ${format === "whatsapp" ? "btn-primary" : ""}`}
                onClick={() => setFormat("whatsapp")}
              >WA</button>
              <button 
                className={`btn btn-xs join-item ${format === "html" ? "btn-primary" : ""}`}
                onClick={() => setFormat("html")}
              >HTML</button>
            </div>
            <button className="btn btn-xs btn-outline" onClick={copyToClipboard}>Copy</button>
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

      {toast && (
        <div className={`alert alert-${toast.type} fixed bottom-4 right-4 w-auto z-50 shadow-lg`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
