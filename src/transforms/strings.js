import crypto from "node:crypto";

export function encodeString(value) {
  const key = crypto.randomBytes(1)[0] || 173;
  const salt = crypto.randomBytes(1)[0] || 91;
  const bytes = Buffer.from(value, "utf8");
  const encoded = [...bytes].map((b, i) => ((b ^ key) + salt + i) & 255);
  return { encoded, key, salt };
}

export function makeDecoderLua() {
  return `local function _0xD(t,k,s)local r={} for i=1,#t do r[i]=string.char(((t[i]-s-i+1)%256)~k) end return table.concat(r) end`;
}
