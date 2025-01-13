import { beforeEach, describe, expect, test } from "bun:test";

import { Circuit, isWired, unwire, wire } from "../../src";
import type { Class } from "../../src/types";
import {
  type MetaAsync,
  type MetaInit,
  type MetaSingleton,
  WiredMeta,
} from "../../src/wire/meta";

const defaultCircuit = Circuit.getDefault();

class TestClass {
  foo = "bar";
}

beforeEach(() => {
  unwire(TestClass);
});

const expectMeta = (
  target: Class,
  expected?: {
    async?: MetaAsync;
    singleton?: MetaSingleton;
    inputs?: Class[];
    init?: MetaInit;
  },
) => {
  const meta = WiredMeta.from(target);

  if (expected?.async) expect(meta.async).toBe(expected.async);
  if (expected?.singleton) expect(meta.singleton).toBe(expected.singleton);
  if (expected?.inputs) expect(meta.inputs()).toEqual(expected.inputs);
  if (expected?.init) expect(meta.init).toBe(expected.init);
};

describe("wire", () => {
  test("wire and unwire", () => {
    expect(TestClass).not.toContainKey(WiredMeta.symbol);
    expect(isWired(TestClass)).toBe(false);

    wire(TestClass);

    expect(TestClass).toContainKey(WiredMeta.symbol);
    expect(isWired(TestClass)).toBe(true);

    unwire(TestClass);

    expect(TestClass).not.toContainKey(WiredMeta.symbol);
    expect(isWired(TestClass)).toBe(false);
  });

  test("wire empty", () => {
    wire(TestClass);

    expectMeta(TestClass, {
      inputs: [],
    });
  });

  test("wire with inputs function", () => {
    wire(TestClass, () => [Circuit]);

    expectMeta(TestClass, {
      inputs: [Circuit],
    });
  });

  test("wire with inputs", () => {
    wire(TestClass, {
      inputs: () => [Circuit],
    });

    expectMeta(TestClass, {
      inputs: [Circuit],
    });
  });

  test("wire with init", () => {
    const initFn = () => new TestClass();

    wire(TestClass, {
      init: initFn,
    });

    expectMeta(TestClass, {
      inputs: [],
      init: initFn,
    });
  });

  test("wire with inputs and init", () => {
    const initFn = () => new TestClass();

    wire(TestClass, {
      inputs: () => [Circuit],
      init: initFn,
    });

    expectMeta(TestClass, {
      inputs: [Circuit],
      init: initFn,
    });
  });

  test("wire with default singleton", () => {
    wire(TestClass, {
      singleton: true,
    });

    expectMeta(TestClass, {
      inputs: [],
      singleton: Circuit.getDefault(),
    });
  });

  test("wire with custom singleton", () => {
    const mySingleton = new Circuit();

    wire(TestClass, {
      singleton: mySingleton,
    });

    expectMeta(TestClass, {
      inputs: [],
      singleton: mySingleton,
    });
  });
});
