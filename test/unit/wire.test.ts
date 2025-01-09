import { beforeEach, describe, expect, test } from "bun:test";

import { Circuit, isWired, unwire, wire } from "../../src";
import type { Class, ClassMeta } from "../../src/types";
import { Meta } from "../../src/utils/meta";

const defaultCircuit = Circuit.getDefault();

class TestClass {
  foo = "bar";
}

beforeEach(() => {
  unwire(TestClass);
});

const expectMeta = (target: Class, expected?: ClassMeta) => {
  const source = Meta.get<ClassMeta>(target);

  expect(!!source).toBe(!!expected);

  if (!source || !expected) return;

  expect(source.inputs(defaultCircuit)).toEqual(
    expected.inputs(defaultCircuit),
  );

  expect(!!source.init).toBe(!!expected.init);
};

describe("wire", () => {
  test("wire and unwire", () => {
    expect(TestClass).not.toContainKey(Meta.metaSymbol);
    expect(isWired(TestClass)).toBe(false);

    wire(TestClass);

    expect(TestClass).toContainKey(Meta.metaSymbol);
    expect(isWired(TestClass)).toBe(true);

    unwire(TestClass);

    expect(TestClass).not.toContainKey(Meta.metaSymbol);
    expect(isWired(TestClass)).toBe(false);
  });

  test("wire empty", () => {
    wire(TestClass);

    expectMeta(TestClass, {
      inputs: () => [],
    });
  });

  test("wire with inputs as params", () => {
    wire(TestClass, () => [Circuit]);

    expectMeta(TestClass, {
      inputs: () => [Circuit],
    });
  });

  test("wire with inputs and init as params", () => {
    wire(
      TestClass,
      () => [Circuit],
      () => new TestClass(),
    );

    expectMeta(TestClass, {
      inputs: () => [Circuit],
      init: () => new TestClass(),
    });
  });

  test("wire with inputs object", () => {
    wire(TestClass, {
      inputs: () => [Circuit],
    });

    expectMeta(TestClass, {
      inputs: () => [Circuit],
    });
  });

  test("wire with init object", () => {
    wire(TestClass, {
      init: () => new TestClass(),
    });

    expectMeta(TestClass, {
      inputs: () => [],
      init: () => new TestClass(),
    });
  });

  test("wire with inputs and init object", () => {
    wire(TestClass, {
      inputs: () => [Circuit],
      init: () => new TestClass(),
    });

    expectMeta(TestClass, {
      inputs: () => [Circuit],
      init: () => new TestClass(),
    });
  });
});
