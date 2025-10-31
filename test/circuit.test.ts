import { describe, expect, test } from "bun:test";
import { Circuit, setStandalone } from "wirebox";

describe("Circuit", () => {
  test("default circuit", () => {
    expect(Circuit.getDefault()).toBeInstanceOf(Circuit);
    expect(Circuit.getDefault()).toBe(Circuit.getDefault());
    expect(Circuit.getDefault()).not.toBe(new Circuit());
  });

  test("tap", () => {
    class MyClass {
      name = "MyClass";
    }
    setStandalone(MyClass);

    const circuit1 = new Circuit();
    const instance1 = circuit1.tap(MyClass);

    expect(instance1).toBeInstanceOf(MyClass);

    const instance2 = circuit1.tap(MyClass);

    expect(instance2).toBeInstanceOf(MyClass);
    expect(instance1).toBe(instance2);

    const circuit2 = new Circuit();
    const instance3 = circuit2.tap(MyClass);

    expect(instance3).toBeInstanceOf(MyClass);
    expect(instance3).not.toBe(instance1);
  });

  test("manual install", () => {
    class NonDecoratedClass {
      name = "NonDecoratedClass";
    }

    const circuit = new Circuit();

    expect(() => circuit.tap(NonDecoratedClass)).toThrow();
    expect(circuit.isInstalled(NonDecoratedClass)).toBe(false);

    const manuallyCreatedInstance = new NonDecoratedClass();

    expect(circuit.isInstalled(NonDecoratedClass)).toBe(false);

    circuit.install(NonDecoratedClass, manuallyCreatedInstance);

    expect(circuit.isInstalled(NonDecoratedClass)).toBe(true);

    const tappedInstance = circuit.tap(NonDecoratedClass);

    expect(tappedInstance).toBeInstanceOf(NonDecoratedClass);
    expect(tappedInstance).toBe(manuallyCreatedInstance);

    expect(() =>
      circuit.install(NonDecoratedClass, new NonDecoratedClass()),
    ).toThrow();

    circuit.uninstall(NonDecoratedClass);

    expect(circuit.isInstalled(NonDecoratedClass)).toBe(false);
    expect(() => circuit.tap(NonDecoratedClass)).toThrow();
  });
});
