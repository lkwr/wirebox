import { describe, expect, test } from "bun:test";
import {
  BasicValueProvider,
  Circuit,
  createAsyncDynamicProvider,
  createAsyncProvider,
  createAsyncStaticProvider,
  createDynamicProvider,
  createProvider,
  createStaticProvider,
  type Providable,
  provide,
  setStandalone,
} from "wirebox";

describe("Provider", () => {
  test("raw sync providable", () => {
    class Provider implements Providable<string> {
      [provide] = {
        getValue: () => "provided-value",
      };
    }

    setStandalone(Provider);

    const circuit = new Circuit();
    const instance = circuit.tap(Provider);
    expect(instance).not.toBeInstanceOf(Provider);
    expect(instance).toBe("provided-value");
  });

  test("raw async providable", async () => {
    class AsyncProvider implements Providable<number> {
      [provide] = {
        async: true as const,
        getValue: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 42;
        },
      };
    }

    setStandalone(AsyncProvider);

    const circuit = new Circuit();
    const instance = await circuit.tapAsync(AsyncProvider);
    expect(instance).not.toBeInstanceOf(AsyncProvider);
    expect(instance).toBe(42);
  });

  test("BasicValueProvider", () => {
    class Provider extends BasicValueProvider<number> {
      constructor() {
        super(123);
      }
    }

    setStandalone(Provider);

    const circuit = new Circuit();
    const instance = circuit.tap(Provider);
    expect(instance).not.toBeInstanceOf(Provider);
    expect(instance).not.toBeInstanceOf(BasicValueProvider);
    expect(instance).toBe(123);
  });

  test("createProvider", () => {
    const Provider = createProvider(() => new Date());

    const circuit1 = new Circuit();
    const instance10 = circuit1.tap(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = circuit1.tap(Provider);
    expect(instance11).toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = circuit2.tap(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).not.toBe(instance10);
  });

  test("createAsyncProvider", async () => {
    const Provider = createAsyncProvider(async () =>
      Bun.sleep(10).then(() => new Date()),
    );

    const circuit1 = new Circuit();
    const instance10 = await circuit1.tapAsync(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = await circuit1.tapAsync(Provider);
    expect(instance11).toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = await circuit2.tapAsync(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).not.toBe(instance10);
  });

  test("createDynamicProvider", () => {
    const Provider = createDynamicProvider(() => new Date());

    const circuit1 = new Circuit();
    const instance10 = circuit1.tap(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = circuit1.tap(Provider);
    expect(instance11).toBeInstanceOf(Date);
    expect(instance11).not.toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = circuit2.tap(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).not.toBe(instance10);
  });

  test("createAsyncDynamicProvider", async () => {
    const Provider = createAsyncDynamicProvider(async () =>
      Bun.sleep(10).then(() => new Date()),
    );

    const circuit1 = new Circuit();
    const instance10 = await circuit1.tapAsync(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = await circuit1.tapAsync(Provider);
    expect(instance11).toBeInstanceOf(Date);
    expect(instance11).not.toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = await circuit2.tapAsync(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).not.toBe(instance10);
  });

  test("createStaticProvider", () => {
    const Provider = createStaticProvider(new Date());

    const circuit1 = new Circuit();
    const instance10 = circuit1.tap(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = circuit1.tap(Provider);
    expect(instance11).toBeInstanceOf(Date);
    expect(instance11).toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = circuit2.tap(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).toBe(instance10);
    expect(instance20).toBe(instance11);
  });

  test("createAsyncStaticProvider", async () => {
    const Provider = createAsyncStaticProvider(
      Bun.sleep(10).then(() => new Date()),
    );

    const circuit1 = new Circuit();
    const instance10 = await circuit1.tapAsync(Provider);
    expect(instance10).not.toBeInstanceOf(Provider);
    expect(instance10).toBeInstanceOf(Date);

    const instance11 = await circuit1.tapAsync(Provider);
    expect(instance11).toBeInstanceOf(Date);
    expect(instance11).toBe(instance10);

    const circuit2 = new Circuit();
    const instance20 = await circuit2.tapAsync(Provider);
    expect(instance20).toBeInstanceOf(Date);
    expect(instance20).toBe(instance10);
    expect(instance20).toBe(instance11);
  });
});
