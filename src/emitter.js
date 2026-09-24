import { encodeString, makeDecoderLua } from "./transforms/strings.js";
import { encodeNumber } from "./transforms/constants.js";

function literalReplacement(node, options) {
  if (node.type === "StringLiteral" && options.strings !== false) {
    const { encoded, key, salt } = encodeString(node.value);
    return `_0xD({${encoded.join(",")}},${key},${salt})`;
  }
  if (node.type === "NumericLiteral" && options.constants !== false) {
    return encodeNumber(node.value);
  }
  return null;
}

export function emit(source, ast, analysis, options = {}) {
  const replacements = [];
  const renameMap = new Map();

  for (const symbol of analysis.symbols) {
    if (symbol.obfuscated && symbol.node?.range) {
      renameMap.set(symbol.node, symbol.obfuscated);
    }
  }
  for (const ref of analysis.refs) {
    if (ref.symbol.obfuscated && ref.node?.range) {
      renameMap.set(ref.node, ref.symbol.obfuscated);
    }
  }

  function collect(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { for (const x of node) collect(x); return; }

    if (node.range && renameMap.has(node)) {
      replacements.push({ start: node.range[0], end: node.range[1], text: renameMap.get(node) });
    }

    const literal = literalReplacement(node, options);
    if (node.range && literal !== null) {
      replacements.push({ start: node.range[0], end: node.range[1], text: literal });
    }

    for (const [k, v] of Object.entries(node)) {
      if (["loc","range","raw","comments","__declaration"].includes(k)) continue;
      collect(v);
    }
  }

  collect(ast);

  if (options.stripComments !== false) {
    for (const comment of ast.comments || []) {
      if (comment.range) replacements.push({ start: comment.range[0], end: comment.range[1], text: "" });
    }
  }

  const unique = new Map();
  for (const r of replacements) unique.set(r.start + ":" + r.end, r);
  const ordered = [...unique.values()].sort((a,b) => b.start - a.start);

  let out = source;
  for (const r of ordered) out = out.slice(0, r.start) + r.text + out.slice(r.end);

  if (options.strings !== false) out = makeDecoderLua() + "\n" + out;
  return out;
}
