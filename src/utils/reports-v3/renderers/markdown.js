import { markerAt } from "../markers.js";

function styleWrap(text, style) {
  if (!text) return text || "";
  switch (style) {
    case "bold":
      return `**${text}**`;
    case "italic":
      return `*${text}*`;
    case "bold-italic":
      return `***${text}***`;
    default:
      return text;
  }
}

function renderItems(items, block, depth, lines) {
  items.forEach((item, index) => {
    const marker = markerAt(block.markers, depth, index);
    const indent = "  ".repeat(depth);
    lines.push(`${indent}${marker} ${styleWrap(item.text, block.itemStyle)}`.trimEnd());
    if (Array.isArray(item.children) && item.children.length) {
      renderItems(item.children, block, depth + 1, lines);
    }
  });
}

function renderBlock(block) {
  switch (block.type) {
    case "divider":
      return "---";
    case "paragraph": {
      const body = styleWrap(block.text, block.style);
      if (block.label) {
        return `${styleWrap(`${block.label} :`, block.labelStyle)}\n${body}`;
      }
      return body;
    }
    case "keyvalue":
      return (block.rows || [])
        .map((r) => styleWrap(`${r.label} : ${r.value}`, block.style))
        .join("  \n");
    case "list": {
      const lines = [];
      if (block.label) lines.push(styleWrap(`${block.label} :`, block.labelStyle));
      renderItems(block.items || [], block, 0, lines);
      return lines.join("\n");
    }
    default:
      return "";
  }
}

/** Renders a compiled block tree to Markdown. */
export function renderToMarkdown(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map(renderBlock).filter((s) => s !== "").join("\n\n").trim();
}
