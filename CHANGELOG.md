# wirebox

## 0.4.2

### Patch Changes

- [`bfe5c25`](https://github.com/lkwr/wirebox/commit/bfe5c2584f94a3961780207412d10f56e12e56a9) Thanks [@lkwr](https://github.com/lkwr)! - build: minify output to reduce bundle size

## 0.4.1

### Patch Changes

- [`1103a0f`](https://github.com/lkwr/wirebox/commit/1103a0fb1d301ac3c686cc172318f7b5c73de338) Thanks [@lkwr](https://github.com/lkwr)! - BREAKING! fix: use a function input for "combine" to prevent issues with circular dependencies

## 0.4.0

### Minor Changes

- [#5](https://github.com/lkwr/wirebox/pull/5) [`65e70c6`](https://github.com/lkwr/wirebox/commit/65e70c64f9927343f5a9ee8d244d5cb17c555967) Thanks [@lkwr](https://github.com/lkwr)! - feat: added "combine" util

- [#5](https://github.com/lkwr/wirebox/pull/5) [`65e70c6`](https://github.com/lkwr/wirebox/commit/65e70c64f9927343f5a9ee8d244d5cb17c555967) Thanks [@lkwr](https://github.com/lkwr)! - BREAKING! feat: Rework provider handling

## 0.3.1

### Patch Changes

- [`125d231`](https://github.com/lkwr/wirebox/commit/125d231f2bdbe040880037fb345056011dca9517) Thanks [@lkwr](https://github.com/lkwr)! - export WiredMeta

## 0.3.0

### Minor Changes

- [`448ccf9`](https://github.com/lkwr/wirebox/commit/448ccf9b9639676e6452fbaef7f05a57e81f2046) Thanks [@lkwr](https://github.com/lkwr)! - feat: explicit async declaration. You need to specify if the class is has an async initializer. Now we know before initializing the class if it is async or not.

- [`650bf77`](https://github.com/lkwr/wirebox/commit/650bf77fa8b61501491be7c0e32cc890bdb45613) Thanks [@lkwr](https://github.com/lkwr)! - feat: seperate providers into its own package entry

- [`448ccf9`](https://github.com/lkwr/wirebox/commit/448ccf9b9639676e6452fbaef7f05a57e81f2046) Thanks [@lkwr](https://github.com/lkwr)! - feat: allow defining custom data to circuits

### Patch Changes

- [`89fe995`](https://github.com/lkwr/wirebox/commit/89fe9950b46e380ecb1dda192e4542fcd790de81) Thanks [@lkwr](https://github.com/lkwr)! - fix: not infer the inputs in the init function

- [`27a8e55`](https://github.com/lkwr/wirebox/commit/27a8e5520baa2ff19c2753f2656df06e21bb09d3) Thanks [@lkwr](https://github.com/lkwr)! - fix wrong types at "withCircuit" and "withCircuitAsync"

## 0.2.0

### Minor Changes

- [`48b7535`](https://github.com/lkwr/wirebox/commit/48b75353e56adcdcb30589a8f635c1b356f113ff) Thanks [@lkwr](https://github.com/lkwr)! - BREAKING: removed "init" parameter in wire function and wired decorator. Use the object syntax instead.

- [`48b7535`](https://github.com/lkwr/wirebox/commit/48b75353e56adcdcb30589a8f635c1b356f113ff) Thanks [@lkwr](https://github.com/lkwr)! - Feature: Mark classes as singletons. So the class instance will always comes from the given circuit.

## 0.1.0

### Minor Changes

- [`94f0d90`](https://github.com/lkwr/wirebox/commit/94f0d907960e54be8a591220267d3551251e7f79) Thanks [@lkwr](https://github.com/lkwr)! - Initial release
