export class Symbol {
  constructor(name, kind, scope) {
    this.original = name;
    this.kind = kind;
    this.scope = scope;
    this.obfuscated = null;
  }
}

export class Scope {
  constructor(parent = null) {
    this.parent = parent;
    this.symbols = new Map();
    this.children = [];
  }
  define(symbol) {
    this.symbols.set(symbol.original, symbol);
  }
  resolve(name) {
    return this.symbols.get(name) ?? this.parent?.resolve(name) ?? null;
  }
}

const isId = n => n && n.type === "Identifier";

export function analyzeScopes(ast) {
  const root = new Scope();
  const symbols = [];

  function define(scope, node, kind) {
    if (!isId(node)) return;
    const s = new Symbol(node.name, kind, scope);
    scope.define(s); symbols.push(s);
  }

  function walk(node, scope) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { for (const x of node) walk(x, scope); return; }

    if (node.type === "LocalStatement") {
      for (const v of node.variables || []) define(scope, v, "local");
    }
    if (node.type === "FunctionDeclaration") {
      for (const p of node.parameters || []) define(scope, p, "parameter");
      const child = new Scope(scope); scope.children.push(child);
      for (const p of node.parameters || []) {
        const s = scope.resolve(p.name); if (s) child.define(s);
      }
      for (const [k,v] of Object.entries(node)) {
        if (k !== "parameters" && k !== "identifier") walk(v, child);
      }
      return;
    }
    for (const [k,v] of Object.entries(node)) {
      if (k === "loc" || k === "range" || k === "raw") continue;
      walk(v, scope);
    }
  }

  walk(ast, root);
  return { root, symbols };
}
