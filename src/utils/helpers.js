export function removeTrailingDot(str) {
  str = str.trim();

  if (str.endsWith(".")) {
    return str.slice(0, -1);
  }
  return str;
}

export function addTrailingDot(str) {
  str = str.trim();

  if (!str.endsWith(".")) {
    return str + ".";
  }
  return str;
}

export function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isDetailsEmpty(details) {
  return details.every(
    (row) => Array.isArray(row) && row.every((cell) => cell.trim() === "")
  );
}
