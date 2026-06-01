/**
 * Validates and sanitizes a ReportV3 `blocks` tree before persisting it.
 *
 * The tree is user-authored and arbitrarily deep, so we:
 *  - whitelist block/field shapes (drops unknown keys, addressing the
 *    "Mixed blob with no validation" smell),
 *  - cap nesting depth and total node count to keep payloads bounded.
 *
 * Returns { ok: true, blocks } or { ok: false, error }.
 */

const MAX_DEPTH = 12;
const MAX_NODES = 5000;
const VALID_BLOCK_TYPES = ["keyvalue", "paragraph", "divider", "list"];
const VALID_STYLES = ["none", "bold", "italic", "bold-italic"];
const VALID_MARKERS = [
  "number",
  "letter",
  "upper-letter",
  "roman",
  "upper-roman",
  "dash",
  "bullet",
];
const VALID_DELIMS = ["dot", "paren", "bracket", "plain"];

// A marker level is a string kind (legacy) or { kind, delim }. Returns the
// sanitized descriptor, or null if the kind is invalid.
function sanitizeMarker(m) {
  if (typeof m === "string") {
    return VALID_MARKERS.includes(m) ? m : null;
  }
  if (m && typeof m === "object" && VALID_MARKERS.includes(m.kind)) {
    return {
      kind: m.kind,
      delim: VALID_DELIMS.includes(m.delim) ? m.delim : "dot",
    };
  }
  return null;
}

const str = (v) => (typeof v === "string" ? v : "");
const style = (v) => (VALID_STYLES.includes(v) ? v : "none");

export function validateBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return { ok: false, error: "blocks must be an array" };
  }

  let nodeCount = 0;
  const fail = (msg) => {
    throw new Error(msg);
  };

  const sanitizeItem = (item, depth) => {
    if (depth > MAX_DEPTH) fail(`List nesting exceeds max depth (${MAX_DEPTH})`);
    if (++nodeCount > MAX_NODES) fail(`Report exceeds max node count (${MAX_NODES})`);
    if (!item || typeof item !== "object") fail("List item must be an object");

    const children = Array.isArray(item.children)
      ? item.children.map((c) => sanitizeItem(c, depth + 1))
      : [];

    const out = {
      id: str(item.id) || `n_${nodeCount}`,
      text: str(item.text),
      children,
    };
    if (item.prompt !== undefined) out.prompt = str(item.prompt);
    if (Array.isArray(item.sourceIds)) out.sourceIds = item.sourceIds.map(str).filter(Boolean);
    return out;
  };

  const sanitizeBlock = (block) => {
    if (++nodeCount > MAX_NODES) fail(`Report exceeds max node count (${MAX_NODES})`);
    if (!block || typeof block !== "object") fail("Block must be an object");
    if (!VALID_BLOCK_TYPES.includes(block.type)) fail(`Unknown block type: ${block.type}`);

    switch (block.type) {
      case "divider":
        return { type: "divider" };

      case "paragraph": {
        const out = {
          type: "paragraph",
          style: style(block.style),
          label: str(block.label),
          labelStyle: style(block.labelStyle),
          text: str(block.text),
        };
        if (block.prompt !== undefined) out.prompt = str(block.prompt);
        if (Array.isArray(block.sourceIds)) out.sourceIds = block.sourceIds.map(str).filter(Boolean);
        return out;
      }

      case "keyvalue": {
        const rows = Array.isArray(block.rows) ? block.rows : [];
        return {
          type: "keyvalue",
          style: style(block.style),
          rows: rows.map((r) => ({ label: str(r?.label), value: str(r?.value) })),
        };
      }

      case "list": {
        const markers = Array.isArray(block.markers)
          ? block.markers.map(sanitizeMarker).filter(Boolean)
          : [];
        const out = {
          type: "list",
          label: str(block.label),
          labelStyle: style(block.labelStyle),
          markers: markers.length ? markers : ["number", "letter", "roman"],
          itemStyle: style(block.itemStyle),
          spacing: block.spacing !== false,
          items: (Array.isArray(block.items) ? block.items : []).map((i) => sanitizeItem(i, 1)),
        };
        if (block.prompt !== undefined) out.prompt = str(block.prompt);
        return out;
      }

      default:
        fail(`Unknown block type: ${block.type}`);
    }
  };

  try {
    const sanitized = blocks.map(sanitizeBlock);
    return { ok: true, blocks: sanitized };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
