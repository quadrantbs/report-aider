/**
 * Interpolates {{key}} placeholders throughout a ReportV3 block tree, returning
 * a new tree with values substituted. Renderers consume the compiled tree and
 * stay free of variable logic.
 */

function interpolate(text, vars) {
  if (typeof text !== "string" || !text) return text || "";
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (Array.isArray(val)) return val.filter(Boolean).join(", ") || `{{${key}}}`;
    return val ?? `{{${key}}}`;
  });
}

function compileItem(item, vars) {
  return {
    ...item,
    text: interpolate(item.text, vars),
    children: Array.isArray(item.children)
      ? item.children.map((c) => compileItem(c, vars))
      : [],
  };
}

function compileBlock(block, vars) {
  switch (block.type) {
    case "paragraph":
      return {
        ...block,
        label: interpolate(block.label, vars),
        text: interpolate(block.text, vars),
      };
    case "keyvalue":
      return {
        ...block,
        rows: (block.rows || []).map((r) => ({
          label: interpolate(r.label, vars),
          value: interpolate(r.value, vars),
        })),
      };
    case "list":
      return {
        ...block,
        label: interpolate(block.label, vars),
        items: (block.items || []).map((i) => compileItem(i, vars)),
      };
    default:
      return block;
  }
}

/** Compiles a report (blocks + variables) into an interpolated block tree. */
export function compileReport(report) {
  if (!report || !Array.isArray(report.blocks)) return [];
  const raw = report.variables;
  const vars =
    raw && typeof raw.get === "function" ? Object.fromEntries(raw) : raw || {};
  return report.blocks.map((b) => compileBlock(b, vars));
}
