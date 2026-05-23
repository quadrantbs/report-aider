/**
 * Replaces {{key}} placeholders in a string using the variables map.
 */
export function interpolateVariables(text, variables) {
  if (!text || !variables) return text;
  const vars = typeof variables.get === "function"
    ? Object.fromEntries(variables)
    : variables;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (Array.isArray(val)) return val.filter(Boolean).join(", ") || `{{${key}}}`;
    return val ?? `{{${key}}}`;
  });
}

/**
 * Compiles a ReportV2 and its Schema into a neutral AST.
 * Mapping is strictly done using the 'key' defined in Schema to the 'data' Map in Report.
 */
export function compileReportToAST(report, schema) {
  if (!report || !schema) return null;

  const variables = report.variables || {};

  const ast = {
    title: report.title,
    parts: [],
    metadata: {
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    },
  };

  // Helper to get value from report.data (Map or Object)
  const getDataValue = (key) => {
    if (!report.data) return "";
    if (typeof report.data.get === "function") return report.data.get(key) || "";
    return report.data[key] || "";
  };

  schema.structure.forEach((def) => {
    const raw = getDataValue(def.key);
    const content = interpolateVariables(raw, variables);

    const rc = def.renderConfig || {};
    const waFormat = rc.wa?.format;
    const interpolatedRc = waFormat
      ? { ...rc, wa: { ...rc.wa, format: interpolateVariables(waFormat, variables) } }
      : rc;

    ast.parts.push({
      key: def.key,
      label: def.label,
      content: content || "",
      renderConfig: interpolatedRc,
    });
  });

  return ast;
}
