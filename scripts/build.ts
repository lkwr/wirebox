import { build } from "tsup";

import packageJson from "../package.json" with { type: "json" };

await build({
  entry: [
    `${import.meta.dirname}/../src/index.ts`,
    `${import.meta.dirname}/../src/provider/index.ts`,
    `${import.meta.dirname}/../src/utils/index.ts`,
  ],
  outDir: `${import.meta.dirname}/../dist`,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,

  minifySyntax: true,
  minifyWhitespace: true,
  minifyIdentifiers: false,
});

const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,

  type: "module",
  module: "index.js",
  main: "index.cjs",

  description: packageJson.description,
  keywords: packageJson.keywords,
  homepage: packageJson.homepage,
  bugs: packageJson.bugs,
  repository: packageJson.repository,
  license: packageJson.license,
  author: packageJson.author,

  exports: {
    "./package.json": "./package.json",
    ".": {
      import: "./index.js",
      require: "./index.cjs",
      types: "./index.d.ts",
    },
    "./provider": {
      import: "./provider/index.js",
      require: "./provider/index.cjs",
      types: "./provider/index.d.ts",
    },
    "./utils": {
      import: "./utils/index.js",
      require: "./utils/index.cjs",
      types: "./utils/index.d.ts",
    },
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
