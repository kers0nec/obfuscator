export { lex, Lexer, type LexResult } from "./lexer/Lexer.js";
export { parse, parseWithErrors, Parser, type ParseResult } from "./parser/Parser.js";
export { obfuscate, printChunk, printExpression, type ObfuscatorOptions } from "./obfuscator/index.js";
export type { Token, SourceLocation } from "./tokens.js";
export type { Chunk, Statement, Expression } from "./ast/types.js";

