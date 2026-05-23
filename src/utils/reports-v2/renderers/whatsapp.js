function renderList(content, list) {
  const prefix = (list.prefix || "").replace(/\\n/g, "\n");
  const suffix = (list.suffix || "").replace(/\\n/g, "\n");

  let mainCounter = 0;
  let subCounter = 0;

  const applyStyle = (marker, content) => {
    if (list.itemStyle === "bold") return `*${marker} ${content}*`;
    if (list.itemStyle === "italic") return `_${marker} ${content}_`;
    if (list.itemStyle === "bold-italic") return `_*${marker} ${content}*_`;
    return `${marker} ${content}`;
  };

  const items = content
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const isNested = list.nested && /^[ \t]{2,}/.test(line);
      const text = line.trim();

      if (isNested) {
        subCounter++;
        const marker = `   ${String.fromCharCode(96 + subCounter)}.`;
        return { line: applyStyle(marker, text), isNested: true };
      } else {
        mainCounter++;
        subCounter = 0;
        const marker =
          list.type === "letter"
            ? `${String.fromCharCode(96 + mainCounter)}.`
            : `${mainCounter}.`;
        return { line: applyStyle(marker, text), isNested: false };
      }
    });

  const lines = [];
  for (let i = 0; i < items.length; i++) {
    // blank line before each non-nested item, except the very first
    if (!items[i].isNested && i > 0) {
      lines.push("");
    }
    lines.push(items[i].line);
  }

  return `${prefix}${lines.join("\n")}${suffix}`;
}

export function renderToWhatsApp(ast) {
  if (!ast) return "";

  let text = "";

  ast.parts.forEach((part) => {
    const wa = part.renderConfig?.wa || {};
    const showLabel = wa.showLabel !== false;
    const list = wa.list || {};

    if (showLabel && part.label) text += `*${part.label}*\n`;

    if (list.enabled) {
      text += `${renderList(part.content, list)}\n\n`;
    } else {
      const fmt = (wa.format || "{isi}").replace(/\\n/g, "\n");
      const [pre, suf] = fmt.split("{isi}");
      text += `${pre ?? ""}${part.content}${suf ?? ""}\n\n`;
    }
  });

  return text.trim();
}
