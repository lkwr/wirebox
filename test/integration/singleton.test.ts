import { beforeEach, describe, expect, test } from "bun:test";

import { Circuit, unwire, wire } from "../../src";

class SingletonClass {}

beforeEach(() => {
  unwire(SingletonClass);
});

describe("singleton", () => {
  test("default singleton", () => {
    wire(SingletonClass, { singleton: true });

    const circut1 = new Circuit();
    const circut2 = new Circuit();

    const instance1 = circut1.tap(SingletonClass);
    const instance2 = circut2.tap(SingletonClass);

    expect(instance1).toBeInstanceOf(SingletonClass);
    expect(instance2).toBeInstanceOf(SingletonClass);

    expect(instance1).toBe(instance2);
  });

  test("custom singleton", () => {
    const mySingletonCircuit = new Circuit();

    wire(SingletonClass, { singleton: mySingletonCircuit });

    const circut1 = new Circuit();
    const circut2 = new Circuit();

    const instance1 = circut1.tap(SingletonClass);
    const instance2 = circut2.tap(SingletonClass);

    expect(instance1).toBeInstanceOf(SingletonClass);
    expect(instance2).toBeInstanceOf(SingletonClass);

    expect(instance1).toBe(instance2);
  });
});
