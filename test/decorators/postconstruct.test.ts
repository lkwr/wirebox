import { describe, expect, mock, test } from "bun:test";
import {
  Circuit,
  definePostconstructAsync,
  defineStandalone,
  tap,
  tapAsync,
} from "wirebox";

describe("Postconstruct", () => {
  test("basic postconstruct", async () => {
    class MyPostconstructClass {
      name = "Postconstruct";
    }

    const setupFn = mock(function (this: MyPostconstructClass) {
      expect(this).toBeInstanceOf(MyPostconstructClass);
    });

    defineStandalone(MyPostconstructClass);
    definePostconstructAsync(MyPostconstructClass, setupFn);

    const instance1 = await tapAsync(MyPostconstructClass);
    expect(instance1).toBeInstanceOf(MyPostconstructClass);
    expect(instance1.name).toBe("Postconstruct");
    expect(setupFn).toHaveBeenCalledTimes(1);

    const instance2 = tap(MyPostconstructClass);
    expect(instance2).toBeInstanceOf(MyPostconstructClass);
    expect(instance2).toBe(instance1);
    expect(instance2.name).toBe("Postconstruct");
    expect(setupFn).toHaveBeenCalledTimes(1);

    const otherCircuit = new Circuit();
    const instance3 = await otherCircuit.tapAsync(MyPostconstructClass);
    expect(instance3).toBeInstanceOf(MyPostconstructClass);
    expect(instance3).not.toBe(instance1);
    expect(instance3.name).toBe("Postconstruct");
    expect(setupFn).toHaveBeenCalledTimes(2);
  });

  test("async accessor setup", async () => {
    class MyAsyncPostconstructClass {
      initialized = false;

      async inlineSetup() {
        expect(this).toBeInstanceOf(MyAsyncPostconstructClass);
        await new Promise((resolve) => setTimeout(resolve, 10));
        this.initialized = true;
      }
    }

    defineStandalone(MyAsyncPostconstructClass);
    definePostconstructAsync(
      MyAsyncPostconstructClass,
      () => MyAsyncPostconstructClass.prototype.inlineSetup,
    );

    const instance1 = await tapAsync(MyAsyncPostconstructClass);
    expect(instance1).toBeInstanceOf(MyAsyncPostconstructClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncPostconstructClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });

  test("async inline setup", async () => {
    class MyAsyncPostconstructClass {
      initialized = false;
    }

    defineStandalone(MyAsyncPostconstructClass);
    definePostconstructAsync(MyAsyncPostconstructClass, async function () {
      expect(this).toBeInstanceOf(MyAsyncPostconstructClass);
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.initialized = true;
    });

    const instance1 = await tapAsync(MyAsyncPostconstructClass);
    expect(instance1).toBeInstanceOf(MyAsyncPostconstructClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncPostconstructClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });

  test("async method name setup", async () => {
    class MyAsyncPostconstructClass {
      initialized = false;

      async inlineSetup() {
        expect(this).toBeInstanceOf(MyAsyncPostconstructClass);
        await new Promise((resolve) => setTimeout(resolve, 10));
        this.initialized = true;
      }
    }

    defineStandalone(MyAsyncPostconstructClass);
    definePostconstructAsync(MyAsyncPostconstructClass, "inlineSetup");

    const instance1 = await tapAsync(MyAsyncPostconstructClass);
    expect(instance1).toBeInstanceOf(MyAsyncPostconstructClass);
    expect(instance1.initialized).toBe(true);

    const instance2 = tap(MyAsyncPostconstructClass);
    expect(instance2).toBe(instance1);
    expect(instance2.initialized).toBe(true);
  });
});
