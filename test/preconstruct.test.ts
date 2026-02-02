import { describe, expect, mock, test } from "bun:test";
import { Circuit, setPreconstruct, setStandalone, tap } from "wirebox";

describe("Preconstruct", () => {
  test("basic preconstruct", () => {
    class MyPreconstructedClass {
      name = "Preconstructed";
    }

    const preconstructFn = mock(() => new MyPreconstructedClass());

    setPreconstruct(MyPreconstructedClass, preconstructFn);

    const instance1 = tap(MyPreconstructedClass);
    expect(instance1).toBeInstanceOf(MyPreconstructedClass);
    expect(instance1.name).toBe("Preconstructed");
    expect(preconstructFn).toHaveBeenCalledTimes(1);

    const instance2 = tap(MyPreconstructedClass);
    expect(instance2).toBeInstanceOf(MyPreconstructedClass);
    expect(instance2).toBe(instance1);
    expect(instance2.name).toBe("Preconstructed");
    expect(preconstructFn).toHaveBeenCalledTimes(1);

    const otherCircuit = new Circuit();

    const instance3 = otherCircuit.tap(MyPreconstructedClass);
    expect(instance3).toBeInstanceOf(MyPreconstructedClass);
    expect(instance3).not.toBe(instance1);
    expect(instance3.name).toBe("Preconstructed");
    expect(preconstructFn).toHaveBeenCalledTimes(2);
  });

  test("conditional preconstruct", () => {
    abstract class Logger {
      abstract type: string;
    }

    class ConsoleLogger extends Logger {
      type = "console";
    }

    class FileLogger extends Logger {
      type = "file";
    }

    // some external condition
    let selectedLoggerType: "console" | "file" = "console";

    const preconstructFn = mock(() =>
      selectedLoggerType === "console" ? new ConsoleLogger() : new FileLogger(),
    );

    setPreconstruct(Logger, preconstructFn);

    const instance1 = tap(Logger);
    expect(instance1).toBeInstanceOf(ConsoleLogger);
    expect(instance1.type).toBe("console");
    expect(preconstructFn).toHaveBeenCalledTimes(1);

    selectedLoggerType = "file";

    const instance2 = tap(Logger);
    expect(instance2).toBeInstanceOf(ConsoleLogger);
    expect(instance2).toBe(instance1);
    expect(instance2.type).toBe("console");
    expect(preconstructFn).toHaveBeenCalledTimes(1);

    const otherCircuit = new Circuit();

    const instance3 = otherCircuit.tap(Logger);
    expect(instance3).toBeInstanceOf(FileLogger);
    expect(instance3).not.toBe(instance1);
    expect(instance3.type).toBe("file");
    expect(preconstructFn).toHaveBeenCalledTimes(2);
  });

  test("with dependencies", () => {
    class Dep1 {
      name = "Dep1";
    }

    class Dep2 {
      name = "Dep2";
    }

    class MyClass {
      name = "MyClass";

      constructor(
        public dep2: Dep2,
        public dep1: Dep1,
      ) {}
    }

    setStandalone(Dep1);
    setStandalone(Dep2);

    const preconstructFn = mock(
      ([dep1, dep2]: readonly [Dep1, Dep2]) => new MyClass(dep2, dep1),
    );

    setPreconstruct(MyClass, preconstructFn, () => [Dep1, Dep2]);

    // pre-tap one dependency to test caching
    const dep2 = tap(Dep2);

    const instance1 = tap(MyClass);

    expect(instance1).toBeInstanceOf(MyClass);
    expect(instance1.name).toBe("MyClass");
    expect(instance1.dep1).toBeInstanceOf(Dep1);
    expect(instance1.dep1.name).toBe("Dep1");
    expect(instance1.dep2).toBeInstanceOf(Dep2);
    expect(instance1.dep2.name).toBe("Dep2");
    expect(instance1.dep2).toBe(dep2);
    expect(preconstructFn).toHaveBeenCalledTimes(1);
    expect(preconstructFn).toHaveBeenCalledWith(
      [instance1.dep1, dep2],
      expect.any(Object),
    );

    const instance2 = tap(MyClass);
    expect(instance2).toBeInstanceOf(MyClass);
    expect(instance2).toBe(instance1);
    expect(instance2.name).toBe("MyClass");
    expect(preconstructFn).toHaveBeenCalledTimes(1);

    const otherCircuit = new Circuit();

    const instance3 = otherCircuit.tap(MyClass);
    expect(instance3).toBeInstanceOf(MyClass);
    expect(instance3).not.toBe(instance1);
    expect(instance3.name).toBe("MyClass");
    expect(instance3.dep1).toBeInstanceOf(Dep1);
    expect(instance3.dep1.name).toBe("Dep1");
    expect(instance3.dep2).toBeInstanceOf(Dep2);
    expect(instance3.dep2.name).toBe("Dep2");
    expect(preconstructFn).toHaveBeenCalledTimes(2);
    expect(preconstructFn).toHaveBeenCalledWith(
      [instance3.dep1, instance3.dep2],
      expect.any(Object),
    );
  });
});
