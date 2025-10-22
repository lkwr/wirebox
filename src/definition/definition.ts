import type { Circuit } from "../circuit.ts";
import type { Class, Context, MaybePromise } from "../types.ts";

export const linksSymbol = Symbol.for("wirebox.definition.links");

type InitializerFn = (
  inputs: unknown[],
  context: Context,
) => MaybePromise<unknown[]>;

export class WireDefinition {
  static readonly symbol = Symbol.for("wirebox.definition");

  // biome-ignore lint/complexity/useLiteralKeys: formatter cannot handle this
  ["async"]: boolean = false;
  singleton: Circuit | null = null;
  inputs: () => Class[] = () => [];
  links: (() => Class)[] = [];
  initializer: InitializerFn | null = null;

  bind(target: Class): WireDefinition {
    Reflect.defineProperty(target, WireDefinition.symbol, {
      enumerable: false,
      configurable: true,
      value: this,
    });

    return this;
  }

  static from(target: Class): WireDefinition | undefined {
    return Reflect.get(target, WireDefinition.symbol);
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

    if (options.inputs) definition.inputs = options.inputs;
    if (options.links) definition.links = options.links;
    if (options.initializer) definition.initializer = options.initializer;
    if (options.async) definition.async = options.async;
    if (options.singleton) definition.singleton = options.singleton;
  }
}
