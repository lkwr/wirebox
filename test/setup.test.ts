import { describe, expect, mock, test } from "bun:test";
import { Circuit, setSetup, tap, tapAsync } from "wirebox";

describe("Setup", () => {
  test("basic setup", async () => {
    class MySetupClass {
      name = "Setup";
    }

    const setupFn = mock(function (this: MySetupClass) {
      expect(this).toBeInstanceOf(MySetupClass);
    });

    setSetup(MySetupClass, setupFn);

    const instance1 = await tapAsync(MySetupClass);
    expect(instance1).toBeInstanceOf(MySetupClass);
    expect(instance1.name).toBe("Setup");
    expect(setupFn).toHaveBeenCalledTimes(1);

    const instance2 = tap(MySetupClass);
    expect(instance2).toBeInstanceOf(MySetupClass);
    expect(instance2).toBe(instance1);
    expect(instance2.name).toBe("Setup");
    expect(setupFn).toHaveBeenCalledTimes(1);

    const otherCircuit = new Circuit();
    const instance3 = await otherCircuit.tapAsync(MySetupClass);
    expect(instance3).toBeInstanceOf(MySetupClass);
    expect(instance3).not.toBe(instance1);
    expect(instance3.name).toBe("Setup");
    expect(setupFn).toHaveBeenCalledTimes(2);
  });

  test("async accessor setup", async () => {
    class MyAsyncSetupClass {
      initialized = false;

      async inlineSetup() {
        expect(this).toBeInstanceOf(MyAsyncSetupClass);
        await new Promise((resolve) => setTimeout(resolve, 10));
        this.initialized = true;
      }
    }

    setSetup(MyAsyncSetupClass, () => MyAsyncSetupClass.prototype.inlineSetup);

    const instance1 = await tapAsync(MyAsyncSetupClass);
    expect(instance1).toBeInstanceOf(MyAsyncSetupClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncSetupClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });

  test("async inline setup", async () => {
    class MyAsyncSetupClass {
      initialized = false;
    }

    setSetup(MyAsyncSetupClass, async function () {
      expect(this).toBeInstanceOf(MyAsyncSetupClass);
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.initialized = true;
    });

    const instance1 = await tapAsync(MyAsyncSetupClass);
    expect(instance1).toBeInstanceOf(MyAsyncSetupClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncSetupClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });

  test("async method name setup", async () => {
    class MyAsyncSetupClass {
      initialized = false;

      async inlineSetup() {
        expect(this).toBeInstanceOf(MyAsyncSetupClass);
        await new Promise((resolve) => setTimeout(resolve, 10));
        this.initialized = true;
      }
    }

    setSetup(MyAsyncSetupClass, "inlineSetup");

    const instance1 = await tapAsync(MyAsyncSetupClass);
    expect(instance1).toBeInstanceOf(MyAsyncSetupClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncSetupClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });
});
