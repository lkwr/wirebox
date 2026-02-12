import type { TypeDocOptions } from "typedoc";

export default {
  entryPoints: ["src/index.ts"],
  out: "docs",
  plugin: ["typedoc-github-theme"],
  githubPages: false,
  externalSymbolLinkMappings: {
    typescript: {
      InstanceType:
        "https://www.typescriptlang.org/docs/handbook/utility-types.html#instancetypetype",
    },
  },
} satisfies TypeDocOptions;
