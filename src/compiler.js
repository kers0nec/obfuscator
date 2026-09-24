import { parseLua } from "./parser.js";
import { analyzeScopes } from "./analysis/scopes.js";
import { renameSymbols } from "./transforms/rename.js";

export function compile(source, options = {}) {
  const ast = parseLua(source);
  const analysis = analyzeScopes(ast);
  if (options.rename !== false) renameSymbols(analysis.symbols);

  return {
    ast,
    analysis,
    source,
    options
  };
}
