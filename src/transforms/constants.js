import crypto from "node:crypto";

export function encodeNumber(n) {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < -2147483648 || n > 2147483647) return String(n);
  const key = crypto.randomBytes(4).readInt32LE(0);
  const masked = (n ^ key) | 0;
  return `((${masked}) ~ (${key}))`;
}
