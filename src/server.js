import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile as legacyCompile } from "./compiler.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8" };

let clyde;
async function getClyde() {
  if (!clyde) clyde = await import("../clyde/src/index.ts");
  return clyde;
}

const send = (res, status, type, body) => {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
};

async function obfuscateWithClyde(source, options) {
  const [{ lex }, { parseWithErrors }, { obfuscate }, { encodeStrings }, { scrambleControlFlow }, { printChunk }] = await Promise.all([
    import("../clyde/src/lexer/Lexer.ts"),
    import("../clyde/src/parser/Parser.ts"),
    import("../clyde/src/obfuscator/Obfuscator.ts"),
    import("../clyde/src/obfuscator/StringEncoder.ts"),
    import("../clyde/src/obfuscator/ControlFlowScrambler.ts"),
    import("../clyde/src/obfuscator/Printer.ts")
  ]);
  const lexed = lex(source);
  if (lexed.errors?.length) throw new Error(lexed.errors[0].message);
  const parsed = parseWithErrors(lexed.tokens);
  if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
  let ast = parsed.ast;
  if (options.rename !== false) ast = obfuscate(ast, { renameLocals: true, preserveGlobals: true });
  if (options.strings !== false) ast = encodeStrings(ast, { enabled: true });
  if (options.controlflow !== false) ast = scrambleControlFlow(ast, { enabled: true });
  return printChunk(ast);
}

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/obfuscate") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10_000_000) req.destroy();
    });
    req.on("end", async () => {
      try {
        const x = JSON.parse(body);
        if (typeof x.source !== "string") throw new Error("source is required");
        const output = x.engine === "legacy"
          ? legacyCompile(x.source, {
              rename: x.rename !== false,
              strings: x.strings !== false,
              constants: x.constants !== false,
              stripComments: x.stripComments !== false
            }).output
          : await obfuscateWithClyde(x.source, x);
        send(res, 200, "application/json; charset=utf-8", JSON.stringify({ output, engine: x.engine === "legacy" ? "legacy" : "clyde" }));
      } catch (e) {
        send(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: e?.message || "Obfuscation failed" }));
      }
    });
    return;
  }

  const requested = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const file = path.resolve(root, "." + path.normalize(requested));
  if (!file.startsWith(root + path.sep) && file !== root) return send(res, 403, "text/plain", "Forbidden");
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, "text/plain", "Not found");
  send(res, 200, types[path.extname(file)] || "text/plain; charset=utf-8", fs.readFileSync(file));
}).listen(process.env.PORT || 3000, () => {
  console.log("67 Obfuscator running on port " + (process.env.PORT || 3000));
});
