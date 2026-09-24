# 67 Obfuscator

**67 Obfuscator** is a Lua/Luau source-protection project inspired by modern AST/VM obfuscator architecture.

Clyde's public documentation describes a lexer → parser → AST → transform → VM pipeline with identifier renaming, string encoding, control-flow scrambling and stack/register VM modes. 67 Obfuscator follows the same broad architectural direction while implementing its own modules and output format.

## Strong protection pipeline

```
Lua/Luau
   ↓
AST parsing + scope analysis
   ↓
Randomized identifier renaming
   ↓
Two-stage string encoding
   ↓
Integer constant masking
   ↓
Comment stripping
   ↓
AST-range emission
   ↓
Protected Lua/Luau
```

### Current strong mode

- Scope-aware local/function/parameter renaming
- Fresh random identifiers every build
- Two-stage per-string byte transformation
- Random per-string keys and salts
- Integer constant masking
- Comment stripping
- AST-range based rewriting
- Randomized transformation helper
- Separate randomized control-flow planning module

### CLI

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

67 Obfuscator intentionally avoids debugger-killing, security-tool detection, and environment-evasion behavior. Obfuscation increases reverse-engineering cost; it cannot make runtime code secret from an observer controlling the runtime.
