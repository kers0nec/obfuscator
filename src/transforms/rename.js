import crypto from "node:crypto";

const RESERVED = new Set([
  "and","break","do","else","elseif","end","false","for","function","goto",
  "if","in","local","nil","not","or","repeat","return","then","true","until","while"
]);

function randomName(used) {
  while (true) {
    const n = crypto.randomBytes(5).toString("hex");
    const name = "_0x" + n;
    if (!RESERVED.has(name) && !used.has(name)) {
      used.add(name);
      return name;
    }
  }
}

export function renameSymbols(symbols) {
  const used = new Set();
  for (const symbol of symbols) {
    if (!["local", "local-function", "parameter"].includes(symbol.kind)) continue;
    symbol.obfuscated = randomName(used);
  }
  return symbols;
}
