import { beforeEach, describe, expect, test } from "bun:test";
import { WireDefinition } from "wirebox";

class ToBeDecorated {}

beforeEach(() => {
  WireDefinition.from(ToBeDecorated)?.remove();
});

describe("Wire Definition", () => {
  test("binding", () => {
    expect(WireDefinition.from(ToBeDecorated)).toBeUndefined();

    let definition = WireDefinition.from(ToBeDecorated);

    expect(definition).toBeUndefined();

    definition = WireDefinition.from(ToBeDecorated, true);

    expect(WireDefinition.from(ToBeDecorated)).toBe(definition);
    expect(definition).toBeInstanceOf(WireDefinition);
    expect(definition.target).toBe(ToBeDecorated);
  });
});
