function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderToHTML(ast) {
  if (!ast) return "";

  let html = "";

  ast.parts.forEach((part) => {
    if (part.label) {
      html += `<p><strong>${escapeHtml(part.label)}</strong></p>`;
    }
    html += `<p>${escapeHtml(part.content).replace(/\n/g, "<br>")}</p>`;
  });

  return html;
}
