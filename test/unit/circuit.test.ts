import { beforeEach, describe, expect, test } from "bun:test";

import { Circuit, wire } from "../../src";

const defaultCircuit = Circuit.getDefault();

class TestClass {}

class AsyncTestClass {}

beforeEach(() => {
  wire(TestClass);
  wire(AsyncTestClass, {
    init: () =>
      new Promise<AsyncTestClass>((resolve) =>
        setTimeout(() => resolve(new AsyncTestClass()), 10),
      ),
  });
});

describe("Circuit", () => {
  describe("tap sync", () => {
    test("tap", () => {
      const instance = defaultCircuit.tap(TestClass);
      expect(instance).toBeInstanceOf(TestClass);
    });

    test("equality", () => {
      const instance1 = defaultCircuit.tap(TestClass);
      const instance2 = defaultCircuit.tap(TestClass);

      test("tap equal instances", () => {
        const instance1 = defaultCircuit.tap(TestClass);
        const instance2 = defaultCircuit.tap(TestClass);

        // expect(instance1).toBe(instance2);
        expect(instance1).toBe(instance2);
      });

      expect(instance1).toBe(instance2);
    });
  });

  describe("tap async", () => {
    test("tapAsync", async () => {
      const instance = await defaultCircuit.tapAsync(AsyncTestClass);
      expect(instance).toBeInstanceOf(AsyncTestClass);
    });

    test("equality", async () => {
      const [instance1, instance2] = await Promise.all([
        defaultCircuit.tapAsync(AsyncTestClass),
        defaultCircuit.tapAsync(AsyncTestClass),
      ]);

      expect(instance1).toBe(instance2);
    });
  });
});
