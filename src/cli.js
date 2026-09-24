#!/usr/bin/env node
import fs from "node:fs";
import { compile } from "./compiler.js";

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith("-"));
const oi = args.indexOf("-o");
const output = oi >= 0 ? args[oi + 1] : null;

if (!input) {
  console.error("Usage: 67obfuscator input.lua -o protected.lua [--no-rename] [--no-strings] [--no-constants]");
  process.exit(1);
}

try {
  const source = fs.readFileSync(input, "utf8");
  const result = compile(source, {
    rename: !args.includes("--no-rename"),
    strings: !args.includes("--no-strings"),
    constants: !args.includes("--no-constants"),
    stripComments: !args.includes("--keep-comments")
  });
  const target = output || input.replace(/\.lua$/, ".obf.lua");
  fs.writeFileSync(target, result.output);
  console.log("67obfuscator protected:", target);
} catch (err) {
  console.error("67obfuscator error:", err.stack || err.message);
  process.exit(1);
}
