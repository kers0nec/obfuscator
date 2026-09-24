import { parseLua } from "./parser.js";
import { analyzeScopes } from "./analysis/scopes.js";
import { renameSymbols } from "./transforms/rename.js";
import { emit } from "./emitter.js";

export function compile(source, options = {}) {
  const ast = parseLua(source);
  const analysis = analyzeScopes(ast);
  if (options.rename !== false) renameSymbols(analysis.symbols);
  const output = emit(source, ast, analysis, {
    rename: options.rename !== false,
    strings: options.strings !== false,
    constants: options.constants !== false,
    stripComments: options.stripComments !== false
  });
  return { ast, analysis, source: output, output, options };
}
