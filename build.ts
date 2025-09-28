import { copyFile } from "node:fs/promises";
import { build } from "tsdown";
import packageJson from "./package.json" with { type: "json" };

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

const distPackage = {
  ...packageJson,

  scripts: undefined,
  devDependencies: undefined,

  module: "./index.js",
  exports: {
    ".": {
      import: "./index.js",
      types: "./index.d.ts",
    },
    "./plugin/combine": {
      import: "./plugin/combine.js",
      types: "./plugin/combine.d.ts",
    },
    "./package.json": "./package.json",
  },
};

await Promise.all([
  Bun.file(`${import.meta.dirname}/dist/package.json`).write(
    JSON.stringify(distPackage, null, 2),
  ),
  copyFile(
    `${import.meta.dirname}/LICENSE`,
    `${import.meta.dirname}/dist/LICENSE`,
  ),
  copyFile(
    `${import.meta.dirname}/README.md`,
    `${import.meta.dirname}/dist/README.md`,
  ),
  copyFile(
    `${import.meta.dirname}/CHANGELOG.md`,
    `${import.meta.dirname}/dist/CHANGELOG.md`,
  ),
]);
