import type { Circuit } from "../circuit.ts";
import type { Class, Context } from "../types.ts";

type InitializerFn = (inputs: unknown[], context: Context) => unknown;

export class WireDefinition {
  static readonly symbol = Symbol.for("wirebox.definition");

  #async: boolean = false;
  #singleton: Circuit | null = null;
  #inputs: () => Class[] = () => [];
  #initializer: InitializerFn | null = null;

  async(): boolean;
  async(enabled: boolean): WireDefinition;
  async(enabled?: boolean): WireDefinition | boolean {
    if (enabled === undefined) return this.#async;

    this.#async = enabled;
    return this;
  }

  singleton(): Circuit | null;
  singleton(circuit: Circuit | null): WireDefinition;
  singleton(circuit?: Circuit | null): WireDefinition | Circuit | null {
    if (circuit === undefined) return this.#singleton;

    this.#singleton = circuit;
    return this;
  }

  inputs(): () => Class[];
  inputs(inputFn: () => Class[]): WireDefinition;
  inputs(inputFn?: () => Class[]): WireDefinition | (() => Class[]) {
    if (inputFn === undefined) return this.#inputs;

    this.#inputs = inputFn;
    return this;
  }

  initializer(): InitializerFn | null;
  initializer(initializerFn: InitializerFn | null): WireDefinition;
  initializer(
    initializerFn?: InitializerFn | null,
  ): WireDefinition | InitializerFn | null {
    if (initializerFn === undefined) return this.#initializer;

    this.#initializer = initializerFn;
    return this;
  }

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
}
