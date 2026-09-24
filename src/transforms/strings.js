import crypto from "node:crypto";

export function encodeString(value) {
  const key1 = crypto.randomBytes(1)[0] || 0x5b;
  const key2 = crypto.randomBytes(1)[0] || 0xa7;
  const salt = crypto.randomBytes(1)[0] || 0x31;
  const bytes = Buffer.from(value, "utf8");
  const encoded = bytes.map((b, i) => {
    const rotated = ((b << (i % 5)) | (b >>> (8 - (i % 5)))) & 255;
    return (((rotated ^ key1) + salt + i * 13) ^ key2) & 255;
  });
  return { encoded: [...encoded], key1, key2, salt };
}

export function makeDecoderLua() {
  return [
    "local function _0x67s(t,a,b,c)",
    "local r={}",
    "for i=1,#t do",
    "local x=((t[i]~b)-c-(i-1)*13)%256",
    "local n=i%5",
    "x=((x>>n)|((x<<(8-n))&255))&255",
    "r[i]=string.char(x~a)",
    "end",
    "return table.concat(r)",
    "end"
  ].join("");
}
