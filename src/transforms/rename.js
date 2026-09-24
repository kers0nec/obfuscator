const RESERVED = new Set([
  "and","break","do","else","elseif","end","false","for","function","goto",
  "if","in","local","nil","not","or","repeat","return","then","true","until","while"
]);

export function renameSymbols(symbols) {
  let counter = 0;
  for (const symbol of symbols) {
    if (!["local","parameter"].includes(symbol.kind)) continue;
    let name;
    do { name = "_0x" + (counter++).toString(16).padStart(6, "0"); }
    while (RESERVED.has(name));
    symbol.obfuscated = name;
  }
  return symbols;
}
