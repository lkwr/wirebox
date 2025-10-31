import type { TypeDocOptions } from "typedoc";

export default {
  entryPoints: ["src/index.ts"],
  out: "docs",
  plugin: ["typedoc-github-theme"],
} satisfies TypeDocOptions;
