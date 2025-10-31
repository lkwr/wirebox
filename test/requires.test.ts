import { describe, expect, test } from "bun:test";
import { Circuit, requires, standalone, tap } from "wirebox";

@standalone()
class DependencyClass {
  name = "Dependency";
}

@requires(() => [DependencyClass])
class WithDependencyClass {
  name = "WithDependency";

  constructor(public dependency: DependencyClass) {}
}

describe("Requires", () => {
  test("tap 'requires'", () => {
    const instance = tap(WithDependencyClass);
    expect(instance).toBeInstanceOf(WithDependencyClass);
    expect(instance.name).toBe("WithDependency");
    expect(instance.dependency).toBeInstanceOf(DependencyClass);
    expect(instance.dependency.name).toBe("Dependency");
  });

  test("tap 'requires' equality", () => {
    const instance1 = tap(WithDependencyClass);
    const instance2 = tap(WithDependencyClass);
    expect(instance1).toBe(instance2);
    expect(instance1.dependency).toBe(instance2.dependency);
  });

  test("tapAsync 'requires'", async () => {
    const instance = await tap(WithDependencyClass);
    expect(instance).toBeInstanceOf(WithDependencyClass);
    expect(instance.name).toBe("WithDependency");
    expect(instance.dependency).toBeInstanceOf(DependencyClass);
    expect(instance.dependency.name).toBe("Dependency");
  });

  test("tap 'requires' different circuits", () => {
    const instance1 = tap(WithDependencyClass); // uses default circuit
    const instance2 = tap(WithDependencyClass, new Circuit());
    expect(instance1).not.toBe(instance2);
    expect(instance1.dependency).not.toBe(instance2.dependency);
  });
});
