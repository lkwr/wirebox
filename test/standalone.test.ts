import { describe, expect, test } from "bun:test";
import { Circuit, standalone, tap } from "wirebox";

@standalone()
class StandaloneClass {
  name = "Standalone";
}

describe("Standalone", () => {
  test("tap 'standalone'", () => {
    const instance = tap(StandaloneClass);
    expect(instance).toBeInstanceOf(StandaloneClass);
    expect(instance.name).toBe("Standalone");
  });

  test("tap 'standalone' equality", () => {
    const instance1 = tap(StandaloneClass);
    const instance2 = tap(StandaloneClass);
    expect(instance1).toBe(instance2);
  });

  test("tapAsync 'standalone'", async () => {
    const instance = await tap(StandaloneClass);
    expect(instance).toBeInstanceOf(StandaloneClass);
    expect(instance.name).toBe("Standalone");
  });

  test("tap 'standalone' different circuits", () => {
    const instance1 = tap(StandaloneClass); // uses default circuit
    const instance2 = tap(StandaloneClass, new Circuit());
    expect(instance1).not.toBe(instance2);
  });
});
