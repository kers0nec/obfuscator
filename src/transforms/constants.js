import crypto from "node:crypto";

export function encodeNumber(n) {
  if (!Number.isInteger(n) || n < -2147483648 || n > 2147483647) return String(n);
  const key = crypto.randomBytes(4).readInt32LE(0);
  return `((${n ^ key})~(${key}))`;
}
