import { build } from "tsup";

import packageJson from "../package.json" with { type: "json" };

await build({
  entry: [`${import.meta.dirname}/../src/index.ts`],
  outDir: `${import.meta.dirname}/../dist`,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});

const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,

  type: "module",

  module: "index.js",
  main: "index.cjs",

  exports: {
    ".": {
      import: "./index.js",
      require: "./index.cjs",
      types: "./index.d.ts",
    },
    "./package.json": "./package.json",
  },
};

await Promise.all([
  Bun.file(`${import.meta.dirname}/../dist/package.json`).write(
    JSON.stringify(distPackageJson, null, 2),
  ),
  Bun.write(
    `${import.meta.dirname}/../dist/CHANGELOG.md`,
    Bun.file(`${import.meta.dirname}/../CHANGELOG.md`),
  ).catch(() => void 0),
  Bun.write(
    `${import.meta.dirname}/../dist/LICENSE`,
    Bun.file(`${import.meta.dirname}/../LICENSE`),
  ),
  Bun.write(
    `${import.meta.dirname}/../dist/README.md`,
    Bun.file(`${import.meta.dirname}/../README.md`),
  ),
]);
