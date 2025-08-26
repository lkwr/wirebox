import { build } from "tsdown";

await build({
  entry: [
    `${import.meta.dirname}/src/index.ts`,
    // plugins
    `${import.meta.dirname}/src/plugin/combine.ts`,
  ],
  outDir: `${import.meta.dirname}/dist`,
  format: "esm",
  dts: true,
  clean: true,
  minify: {
    mangle: false,
  },
});
