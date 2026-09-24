export function encodeString(value, key) {
  const bytes = Buffer.from(value, "utf8");
  return [...bytes].map(b => b ^ key);
}

export function makeDecoderLua() {
  return "local function _0xdec(t,k) local s={} for i=1,#t do s[i]=string.char(t[i] ~ k) end return table.concat(s) end";
}
