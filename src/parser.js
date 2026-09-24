import luaparse from "luaparse";

export function parseLua(source) {
  return luaparse.parse(source, {
    locations: true,
    ranges: true,
    comments: true,
    scope: true,
    wait: false
  });
}
