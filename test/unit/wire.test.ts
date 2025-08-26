import { beforeEach, describe, expect, test } from "bun:test";

import { Circuit, isWired, unwire, wire } from "../../src";
import { WireDefinition } from "../../src/definition/definition";
import type { Class } from "../../src/types";

class TestClass {
  foo = "bar";
}

beforeEach(() => {
  unwire(TestClass);
});

const expectMeta = (
  target: Class,
  expected?: {
    inputs?: Class[];
    initializer?: WireDefinition["initializer"];

    async?: WireDefinition["async"];
    singleton?: WireDefinition["singleton"];
  },
) => {
  const meta = WireDefinition.from(target);

  if (expected?.async) expect(meta.async).toBe(expected.async);
  if (expected?.singleton) expect(meta.singleton).toBe(expected.singleton);
  if (expected?.inputs) expect(meta.inputs()).toEqual(expected.inputs);
  if (expected?.initializer)
    expect(meta.initializer).toBe(expected.initializer);
};

describe("wire", () => {
  test("wire and unwire", () => {
    expect(TestClass).not.toContainKey(WireDefinition.symbol);
    expect(isWired(TestClass)).toBe(false);

    wire(TestClass);

    expect(TestClass).toContainKey(WireDefinition.symbol);
    expect(isWired(TestClass)).toBe(true);

    unwire(TestClass);

    expect(TestClass).not.toContainKey(WireDefinition.symbol);
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
    const initializerFn = () => new TestClass();

    wire(TestClass, {
      init: initializerFn,
    });

    expectMeta(TestClass, {
      inputs: [],
      initializer: initializerFn,
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
      initializer: initFn,
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
