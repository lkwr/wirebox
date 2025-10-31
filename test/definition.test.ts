import { beforeAll, describe, expect, test } from "bun:test";
import { WireDefinition } from "wirebox";

class ToBeDecorated {}

beforeAll(() => {
  WireDefinition.unbind(ToBeDecorated);
});

describe("Wire Definition", () => {
  test("binding", () => {
    const definition = new WireDefinition();

    expect(WireDefinition.from(ToBeDecorated)).toBeUndefined();

    definition.bind(ToBeDecorated);

    expect(WireDefinition.from(ToBeDecorated)).toBeInstanceOf(WireDefinition);
    expect(WireDefinition.from(ToBeDecorated)).toBe(definition);
  });
});
