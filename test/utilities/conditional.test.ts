import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Circuit,
  setConditional,
  setConditionalAsync,
  setStandalone,
  unwire,
} from "wirebox";

abstract class PubSub {
  abstract type: string;
  abstract publish(message: string): void;
  abstract subscribe(callback: (message: string) => void): void;
}

class InMemoryPubSub extends PubSub {
  type = "in-memory";

  publish(_message: string): void {
    // In-memory publish logic
  }

  subscribe(_callback: (message: string) => void): void {
    // In-memory subscribe logic
  }
}

class RedisPubSub extends PubSub {
  type = "redis";

  publish(_message: string): void {
    // Redis publish logic
  }

  subscribe(_callback: (message: string) => void): void {
    // Redis subscribe logic
  }
}

afterEach(() => {
  expect(unwire(PubSub)).toBe(true);
  expect(unwire(InMemoryPubSub)).toBe(true);
  expect(unwire(RedisPubSub)).toBe(true);
});

describe("Conditional", () => {
  test("conditional sync", () => {
    const circuit = new Circuit();
    let isInMemory = true;

    setConditional(PubSub, () => (isInMemory ? InMemoryPubSub : RedisPubSub));
    setStandalone(InMemoryPubSub);
    setStandalone(RedisPubSub);

    expect(isInMemory).toBe(true);

    const instance1 = circuit.tap(PubSub);
    expect(instance1).toBeInstanceOf(InMemoryPubSub);
    expect(instance1.type).toBe("in-memory");

    // Clear instance
    circuit.uninstall(PubSub);
    expect(circuit.get(PubSub)).toBeUndefined();

    isInMemory = false;
    expect(isInMemory).toBe(false);

    const instance2 = circuit.tap(PubSub);
    expect(instance2).toBeInstanceOf(RedisPubSub);
    expect(instance2.type).toBe("redis");
    expect(instance2).not.toBe(instance1);
  });

  test("conditional async", async () => {
    const circuit = new Circuit();
    let isInMemory = true;

    const getIsInMemory = async () =>
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(isInMemory), 10),
      );

    setConditionalAsync(PubSub, async () =>
      (await getIsInMemory()) ? InMemoryPubSub : RedisPubSub,
    );
    setStandalone(InMemoryPubSub);
    setStandalone(RedisPubSub);

    expect(isInMemory).toBe(true);
    expect(await getIsInMemory()).toBe(true);

    expect(() => circuit.tap(PubSub)).toThrowError();
    const instance1 = await circuit.tapAsync(PubSub);
    expect(instance1).toBeInstanceOf(InMemoryPubSub);
    expect(instance1.type).toBe("in-memory");

    // Clear instance
    circuit.uninstall(PubSub);
    expect(circuit.get(PubSub)).toBeUndefined();

    isInMemory = false;
    expect(isInMemory).toBe(false);
    expect(await getIsInMemory()).toBe(false);

    const instance2 = await circuit.tapAsync(PubSub);
    expect(instance2).toBeInstanceOf(RedisPubSub);
    expect(instance2.type).toBe("redis");
    expect(instance2).not.toBe(instance1);
  });
});
