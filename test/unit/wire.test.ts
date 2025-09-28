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

const expectDefinition = (
  target: Class,
  expected?: {
    inputs?: Class[];
    initializer?: (inputs: unknown[]) => unknown;
    async?: boolean;
    singleton?: Circuit | null;
  },
) => {
  const definition = WireDefinition.from(target);

  if (expected?.async) expect(definition?.async()).toBe(expected.async);
  if (expected?.singleton)
    expect(definition?.singleton()).toBe(expected.singleton);
  if (expected?.inputs) expect(definition?.inputs()()).toEqual(expected.inputs);
  if (expected?.initializer)
    expect(definition?.initializer()).toBe(expected.initializer);
};

describe("wire", () => {
  test("wire and unwire", () => {
    expect(TestClass).not.toContainKey<any>(WireDefinition.symbol);
    expect(isWired(TestClass)).toBe(false);

    wire(TestClass);

    expect(TestClass).toContainKey<any>(WireDefinition.symbol);
    expect(isWired(TestClass)).toBe(true);

    unwire(TestClass);

    expect(TestClass).not.toContainKey<any>(WireDefinition.symbol);
    expect(isWired(TestClass)).toBe(false);
  });

  test("wire empty", () => {
    wire(TestClass);

    expectDefinition(TestClass, {
      inputs: [],
    });
  });

  test("wire with inputs function", () => {
    wire(TestClass, () => [Circuit]);

    expectDefinition(TestClass, {
      inputs: [Circuit],
    });
  });

  test("wire with inputs", () => {
    wire(TestClass, {
      inputs: () => [Circuit],
    });

    expectDefinition(TestClass, {
      inputs: [Circuit],
    });
  });

  test("wire with init", () => {
    const initializerFn = () => new TestClass();

    wire(TestClass, {
      init: initializerFn,
    });

    expectDefinition(TestClass, {
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

    expectDefinition(TestClass, {
      inputs: [Circuit],
      initializer: initFn,
    });
  });

  test("wire with default singleton", () => {
    wire(TestClass, {
      singleton: true,
    });

    expectDefinition(TestClass, {
      inputs: [],
      singleton: Circuit.getDefault(),
    });
  });

  test("wire with custom singleton", () => {
    const mySingleton = new Circuit();

    wire(TestClass, {
      singleton: mySingleton,
    });

    expectDefinition(TestClass, {
      inputs: [],
      singleton: mySingleton,
    });
  });
});
