import { markerAt } from "../markers.js";

const DIVIDER = "_____________________";

function styleWrap(text, style) {
  if (!text) return text || "";
  switch (style) {
    case "bold":
      return `*${text}*`;
    case "italic":
      return `_${text}_`;
    case "bold-italic":
      return `_*${text}*_`;
    default:
      return text;
  }
}

function renderItems(items, block, depth, lines) {
  items.forEach((item, index) => {
    const marker = markerAt(block.markers, depth, index);
    const indent = "\t".repeat(depth);
    lines.push(`${indent}${marker} ${styleWrap(item.text, block.itemStyle)}`.trimEnd());

    if (Array.isArray(item.children) && item.children.length) {
      renderItems(item.children, block, depth + 1, lines);
    }

    // Blank line between top-level items (after the whole subtree), matching v1.
    if (block.spacing && depth === 0 && index < items.length - 1) {
      lines.push("");
    }
  });
}

function renderBlock(block) {
  switch (block.type) {
    case "divider":
      return DIVIDER;

    case "paragraph": {
      const body = styleWrap(block.text, block.style);
      if (block.label) {
        return `${styleWrap(`${block.label} :`, block.labelStyle)}\n${body}`;
      }
      return body;
    }

    case "keyvalue":
      return (block.rows || [])
        .map((r) => styleWrap(`${r.label} : ${r.value}`.trimEnd(), block.style))
        .join("\n");

    case "list": {
      const lines = [];
      if (block.label) {
        lines.push(styleWrap(`${block.label} :`, block.labelStyle));
        lines.push("");
      }
      renderItems(block.items || [], block, 0, lines);
      return lines.join("\n");
    }

    default:
      return "";
  }
}

/** Renders a compiled block tree to WhatsApp-formatted text. */
export function renderToWhatsApp(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map(renderBlock)
    .filter((s) => s !== "")
    .join("\n\n")
    .trim();
}
