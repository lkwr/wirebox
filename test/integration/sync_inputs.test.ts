import { beforeEach, describe, expect, test } from "bun:test";

import { tap, unwire, wire } from "../../src";

class StaticHi {
  sayHi() {
    return "Hello from Static";
  }
}

class DynamicHi {
  constructor(public name: string) {}

  sayHi() {
    return `Hello from ${this.name}`;
  }
}

beforeEach(() => {
  unwire(StaticHi);
  unwire(DynamicHi);
});

describe("sync inputs", () => {
  test("basic input", () => {
    class MyClass {
      constructor(public hi: StaticHi) {}
    }

    wire(StaticHi);
    wire(MyClass, () => [StaticHi]);

    const instance = tap(MyClass);

    expect(instance.hi.sayHi()).toBe("Hello from Static");
  });

  test("with init", () => {
    class MyClass {
      constructor(public hi: DynamicHi) {}
    }

    wire(
      DynamicHi,
      () => [],
      () => new DynamicHi("Alice"),
    );
    wire(MyClass, () => [DynamicHi]);

    const instance = tap(MyClass);

    expect(instance.hi.sayHi()).toBe("Hello from Alice");
  });
});
