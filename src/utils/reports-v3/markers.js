// Produces the list marker for a given per-level descriptor and zero-based index.
//
// A level descriptor is either a legacy string kind ("number" | "letter" |
// "roman" | "dash" | "bullet") or an object { kind, delim } where delim styles
// the counter: "dot" -> "1.", "paren" -> "1)", "bracket" -> "(1)", "plain" -> "1".
// dash/bullet ignore delim and render a fixed symbol.

const ROMAN = [
  [1000, "m"], [900, "cm"], [500, "d"], [400, "cd"],
  [100, "c"], [90, "xc"], [50, "l"], [40, "xl"],
  [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
];

function toRoman(n) {
  let out = "";
  for (const [val, sym] of ROMAN) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
}

function toLetter(i) {
  // a..z, then aa, ab, ... (spreadsheet-style)
  let n = i + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(97 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function normalize(descriptor) {
  if (typeof descriptor === "string") return { kind: descriptor, delim: "dot" };
  return { kind: descriptor?.kind || "number", delim: descriptor?.delim || "dot" };
}

function applyDelim(counter, delim) {
  switch (delim) {
    case "paren":
      return `${counter})`;
    case "bracket":
      return `(${counter})`;
    case "plain":
      return `${counter}`;
    case "dot":
    default:
      return `${counter}.`;
  }
}

/** Returns the marker string for one level descriptor at the given index. */
export function markerFor(descriptor, index) {
  const { kind, delim } = normalize(descriptor);
  switch (kind) {
    case "dash":
      return "-";
    case "bullet":
      return "•";
    case "letter":
      return applyDelim(toLetter(index), delim);
    case "upper-letter":
      return applyDelim(toLetter(index).toUpperCase(), delim);
    case "roman":
      return applyDelim(toRoman(index + 1), delim);
    case "upper-roman":
      return applyDelim(toRoman(index + 1).toUpperCase(), delim);
    case "number":
    default:
      return applyDelim(index + 1, delim);
  }
}

/** Picks the level descriptor for a given depth, cycling when nesting runs deeper. */
export function markerForDepth(markers, depth) {
  const list = markers && markers.length ? markers : ["number", "letter", "roman"];
  return list[depth % list.length];
}

/** Convenience: marker string for a depth + index in one call. */
export function markerAt(markers, depth, index) {
  return markerFor(markerForDepth(markers, depth), index);
}
