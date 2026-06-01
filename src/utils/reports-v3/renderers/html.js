import { markerForDepth } from "../markers.js";

function kindAtDepth(markers, depth) {
  const d = markerForDepth(markers, depth);
  return typeof d === "string" ? d : d?.kind || "number";
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function styleWrap(text, style) {
  const safe = escapeHtml(text).replace(/\n/g, "<br>");
  if (!text) return safe;
  switch (style) {
    case "bold":
      return `<strong>${safe}</strong>`;
    case "italic":
      return `<em>${safe}</em>`;
    case "bold-italic":
      return `<strong><em>${safe}</em></strong>`;
    default:
      return safe;
  }
}

// Maps a marker kind to an <ol type>; dash/bullet render as <ul>.
function listTag(kind) {
  switch (kind) {
    case "letter":
      return { tag: "ol", attr: ' type="a"' };
    case "upper-letter":
      return { tag: "ol", attr: ' type="A"' };
    case "roman":
      return { tag: "ol", attr: ' type="i"' };
    case "upper-roman":
      return { tag: "ol", attr: ' type="I"' };
    case "dash":
    case "bullet":
      return { tag: "ul", attr: "" };
    case "number":
    default:
      return { tag: "ol", attr: "" };
  }
}

function renderItems(items, block, depth) {
  const { tag, attr } = listTag(kindAtDepth(block.markers, depth));
  const lis = items
    .map((item) => {
      const inner = styleWrap(item.text, block.itemStyle);
      const children =
        Array.isArray(item.children) && item.children.length
          ? renderItems(item.children, block, depth + 1)
          : "";
      return `<li>${inner}${children}</li>`;
    })
    .join("");
  return `<${tag}${attr}>${lis}</${tag}>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "divider":
      return "<hr>";
    case "paragraph": {
      const body = `<p>${styleWrap(block.text, block.style)}</p>`;
      if (block.label) {
        return `<p>${styleWrap(`${block.label} :`, block.labelStyle)}</p>${body}`;
      }
      return body;
    }
    case "keyvalue":
      return `<p>${(block.rows || [])
        .map((r) => styleWrap(`${r.label} : ${r.value}`, block.style))
        .join("<br>")}</p>`;
    case "list": {
      const label = block.label
        ? `<p>${styleWrap(`${block.label} :`, block.labelStyle)}</p>`
        : "";
      return label + renderItems(block.items || [], block, 0);
    }
    default:
      return "";
  }
}

/** Renders a compiled block tree to HTML. */
export function renderToHTML(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map(renderBlock).join("\n");
}
