import type { Circuit } from "../circuit.ts";
import type { Class, Context } from "../types.ts";

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
    Reflect.defineProperty(target, WireDefinition.symbol, {
      enumerable: false,
      configurable: true,
      value: this,
    });

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
    let definition = Reflect.get(target, WireDefinition.symbol);
    if (!createIfNotExists) return definition;

    if (!definition) {
      definition = new WireDefinition();
      definition.bind(target);
    }

    return definition;
  }

  static unbind(target: Class): WireDefinition | undefined {
    const definition = Reflect.get(target, WireDefinition.symbol);
    if (!definition) return undefined;

    Reflect.deleteProperty(target, WireDefinition.symbol);
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
}
