#!/usr/bin/env node
import fs from "node:fs";
import { compile } from "./compiler.js";

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith("-"));
const oi = args.indexOf("-o");
const output = oi >= 0 ? args[oi + 1] : null;

if (!input) {
  console.error("Usage: lualune input.lua -o protected.lua [--rename]");
  process.exit(1);
}

try {
  const source = fs.readFileSync(input, "utf8");
  const result = compile(source, { rename: !args.includes("--no-rename") });
  fs.writeFileSync(output || input.replace(/\.lua$/, ".obf.lua"), result.source);
  console.log("LuaLune processed:", output || input.replace(/\.lua$/, ".obf.lua"));
} catch (err) {
  console.error("LuaLune error:", err.message);
  process.exit(1);
}
