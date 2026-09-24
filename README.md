# LuaLune

A stronger Lua source-protection pipeline focused on making static inspection harder while preserving normal Lua semantics.

## Strong mode

The default CLI now enables:
- scope-aware local/parameter renaming with fresh random identifiers
- runtime string encoding with per-string random keys/salts
- integer constant encoding using Lua 5.3 bitwise XOR
- comment stripping
- AST-range based source rewriting

Usage:

```bash
npm install
node src/cli.js input.lua -o protected.lua
```

Options:

```text
--no-rename
--no-strings
--no-constants
--keep-comments
```

> Obfuscation increases reverse-engineering cost; it cannot make code secret from an observer who controls the runtime.

LuaLune intentionally avoids debugger-killing, security-tool detection, or other environment-evasion behavior.
