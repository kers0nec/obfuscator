# LuaLune

A modular Lua source obfuscator.

## Pipeline

Lua source -> parser -> scope analysis -> identifier mangling -> string encoding -> constant transforms -> emitter.

## Install

```bash
npm install
```

## Usage

```bash
node src/cli.js input.lua -o protected.lua --rename --strings
```

The project is intentionally modular so additional CFG and VM backends can be added without changing the parser/analysis layer.

> Obfuscation raises reverse-engineering cost; it cannot make code secret from an observer who controls the runtime.
