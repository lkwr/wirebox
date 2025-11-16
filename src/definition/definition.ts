import type { Circuit } from "../circuit.ts";
import type { Class, Context } from "../types.ts";

/**
 * @category Definition
 */
export class WireDefinition {
  static readonly symbol = Symbol.for("wirebox.definition");

  // biome-ignore lint/complexity/useLiteralKeys: formatter cannot handle this
  ["async"]: boolean = false;
  singleton?: Circuit;
  dependencies?: () => readonly Class[];
  preloads?: () => readonly Class[];
  preconstruct?: (
    dependencies: readonly unknown[],
    context: Context,
  ) => unknown | Promise<() => unknown>;

  bind(target: Class): WireDefinition {
    const map = WireDefinition.#getTargetMap(target, true);
    map.set(target, this);
    return this;
  }

  static from(
    target: Class,
    createIfNotExists?: false,
  ): WireDefinition | undefined;
  static from(target: Class, createIfNotExists: true): WireDefinition;

  static from(
    target: Class,
    createIfNotExists = false,
  ): WireDefinition | undefined {
    const map = WireDefinition.#getTargetMap(target, false);

    let definition = map?.get(target);

    if (!definition && createIfNotExists) {
      definition = new WireDefinition();
      definition.bind(target);
    }

    return definition;
  }

  static unbind(target: Class): WireDefinition | undefined {
    const map = WireDefinition.#getTargetMap(target, false);
    if (!map) return undefined;

    const definition = map?.get(target);
    if (!definition) return undefined;

    // remove from map
    map.delete(target);

    // cleanup map if empty
    if (map.size === 0) WireDefinition.#removeTargetMap(target);

    return definition;
  }

  static set(target: Class, options: Partial<WireDefinition> = {}): void {
    const definition = new WireDefinition();

    definition.bind(target);

    if (options.dependencies) definition.dependencies = options.dependencies;
    if (options.preloads) definition.preloads = options.preloads;
    if (options.preconstruct) definition.preconstruct = options.preconstruct;
    if (options.async) definition.async = options.async;
    if (options.singleton) definition.singleton = options.singleton;
  }

  static #getTargetMap(
    target: Class,
    createIfNotExists?: false,
  ): Map<Class, WireDefinition> | undefined;
  static #getTargetMap(
    target: Class,
    createIfNotExists: true,
  ): Map<Class, WireDefinition>;

  static #getTargetMap(
    target: Class,
    createIfNotExists = false,
  ): Map<Class, WireDefinition> | undefined {
    const root = getRootPrototype(target);

    let map: Map<Class, WireDefinition> | undefined = Reflect.get(
      root,
      WireDefinition.symbol,
    );

    if (!map && createIfNotExists) {
      map = new Map();
      Reflect.defineProperty(root, WireDefinition.symbol, {
        enumerable: false,
        configurable: true,
        writable: false,
        value: map,
      });
    }

    return map;
  }

  static #removeTargetMap(target: Class): void {
    const root = getRootPrototype(target);
    Reflect.deleteProperty(root, WireDefinition.symbol);
  }
}

const getRootPrototype = (current: object): object => {
  const prototype = Reflect.getPrototypeOf(current);
  if (prototype === Function.prototype || prototype === null) return current;
  return getRootPrototype(prototype);
};
