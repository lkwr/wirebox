import { afterEach, describe, expect, test } from "bun:test";
import {
  Circuit,
  setConditional,
  setConditionalAsync,
  setStandalone,
  unwire,
  withCircuit,
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
  unwire(PubSub);
  unwire(InMemoryPubSub);
  unwire(RedisPubSub);
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

  test("conditional sync providable", () => {
    const circuit1 = new Circuit();
    const circuit2 = new Circuit();

    setConditional(PubSub, () => withCircuit(circuit2, () => InMemoryPubSub));
    setStandalone(InMemoryPubSub);

    const instance1 = circuit1.tap(PubSub);

    expect(instance1).toBeInstanceOf(InMemoryPubSub);
    expect(instance1.type).toBe("in-memory");

    const instance2 = circuit2.get(InMemoryPubSub);

    expect(instance2).toBe(instance1);
  });

  test("conditional async", async () => {
    const circuit = new Circuit();
    let isInMemory = true;

    const getIsInMemory = async () => Bun.sleep(10).then(() => isInMemory);

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

  test("conditional async providable", async () => {
    const circuit1 = new Circuit();
    const circuit2 = new Circuit();

    setConditionalAsync(PubSub, () =>
      Bun.sleep(10).then(() => withCircuit(circuit2, () => InMemoryPubSub)),
    );
    setStandalone(InMemoryPubSub);

    const instance1 = await circuit1.tapAsync(PubSub);

    expect(instance1).toBeInstanceOf(InMemoryPubSub);
    expect(instance1.type).toBe("in-memory");

    const instance2 = circuit2.get(InMemoryPubSub);

    expect(instance2).toBe(instance1);
  });
});
