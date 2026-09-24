export class Symbol {
  constructor(name, kind, scope, node) {
    this.original = name;
    this.kind = kind;
    this.scope = scope;
    this.node = node;
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

const isNode = n => n && typeof n === "object" && !Array.isArray(n);
const isId = n => isNode(n) && n.type === "Identifier";

export function analyzeScopes(ast) {
  const root = new Scope();
  const symbols = [];
  const refs = [];

  function define(scope, node, kind) {
    if (!isId(node)) return null;
    const s = new Symbol(node.name, kind, scope, node);
    scope.define(s);
    symbols.push(s);
    return s;
  }

  function walkList(list, scope) {
    for (const node of list || []) walk(node, scope);
  }

  function walk(node, scope) {
    if (!node) return;
    if (Array.isArray(node)) return walkList(node, scope);
    if (!isNode(node)) return;

    switch (node.type) {
      case "LocalStatement": {
        // Lua locals become visible after their initializer.
        walkList(node.init, scope);
        for (const v of node.variables || []) define(scope, v, "local");
        return;
      }
      case "LocalFunctionStatement": {
        define(scope, node.name, "local-function");
        const child = new Scope(scope);
        scope.children.push(child);
        for (const p of node.parameters || []) define(child, p, "parameter");
        walkList(node.body, child);
        return;
      }
      case "FunctionDeclaration": {
        // The declaration name itself is only renamed when it is a local binding.
        if (node.isLocal && node.identifier) define(scope, node.identifier, "local-function");
        const child = new Scope(scope);
        scope.children.push(child);
        for (const p of node.parameters || []) define(child, p, "parameter");
        walkList(node.body, child);
        return;
      }
      case "ForNumericStatement":
        walk(node.start, scope); walk(node.end, scope); walk(node.step, scope);
        for (const v of node.variables || []) define(scope, v, "local");
        walk(node.body, scope);
        return;
      case "ForGenericStatement":
        walkList(node.iterators, scope);
        for (const v of node.variables || []) define(scope, v, "local");
        walk(node.body, scope);
        return;
      case "Identifier": {
        // Declarations are handled by their parent nodes.
        if (!node.__declaration) {
          const s = scope.resolve(node.name);
          if (s) refs.push({ node, symbol: s });
        }
        return;
      }
    }

    for (const [k, v] of Object.entries(node)) {
      if (k === "loc" || k === "range" || k === "raw" || k === "comments") continue;
      if (node.type === "MemberExpression" && k === "index" && !node.computed) continue;
      walk(v, scope);
    }
  }

  // Mark declaration identifiers before the reference walk.
  function markDeclarations(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(markDeclarations); return; }
    if (node.type === "LocalStatement") (node.variables || []).forEach(x => x.__declaration = true);
    if (node.type === "LocalFunctionStatement" && node.name) node.name.__declaration = true;
    if (node.type === "FunctionDeclaration" && node.isLocal && node.identifier) node.identifier.__declaration = true;
    if (node.type === "FunctionDeclaration") (node.parameters || []).forEach(x => x.__declaration = true);
    if (node.type === "ForNumericStatement" || node.type === "ForGenericStatement")
      (node.variables || []).forEach(x => x.__declaration = true);
    for (const [k,v] of Object.entries(node)) if (!["loc","range","raw","comments"].includes(k)) markDeclarations(v);
  }

  markDeclarations(ast);
  walk(ast, root);

  return { root, symbols, refs };
}
