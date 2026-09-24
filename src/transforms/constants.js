export function encodeNumber(n) {
  if (!Number.isFinite(n)) return String(n);
  return "(" + String(n) + ")";
}
