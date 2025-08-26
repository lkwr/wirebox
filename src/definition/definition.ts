// biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: biome bug
import type { Circuit } from "../circuit.ts";
import type { Class, Context } from "../types.ts";

type InitializerFn = (inputs: unknown[], context: Context) => unknown;

export class WireDefinition {
  static readonly symbol = Symbol.for("wirebox.definition");

  constructor(private target: Class) {}

  // --- async ---

  get async(): boolean {
    return this.#get("async", false);
  }

  set async(value: boolean) {
    this.#set("async", value);
  }

  // --- singleton ---

  get singleton(): Circuit | undefined {
    return this.#get("singleton", undefined);
  }

  set singleton(value: Circuit | undefined) {
    this.#set("singleton", value);
  }

  // --- inputs ---

  get inputs(): () => Class[] {
    return this.#get("inputs", () => []);
  }

  set inputs(inputFn: () => Class[]) {
    this.#set("inputs", inputFn);
  }

  // --- initializer ---

  get initializer(): InitializerFn | undefined {
    return this.#get("init", undefined);
  }

  set initializer(initializerFn: InitializerFn) {
    this.#set("init", initializerFn);
  }

  // --- helpers ---

  enable() {
    Reflect.defineProperty(this.target, WireDefinition.symbol, {
      enumerable: false,
      configurable: true,
      value: {},
    });
  }

  disable() {
    Reflect.deleteProperty(this.target, WireDefinition.symbol);
  }

  isEnabled(): boolean {
    return Reflect.has(this.target, WireDefinition.symbol);
  }

  #get<T>(key: string): T | undefined;
  #get<T>(key: string, fallback: NoInfer<T>): T;
  #get<T>(
    key: string,
    fallback: NoInfer<T> | undefined = undefined,
  ): T | undefined {
    const meta = Reflect.get(this.target, WireDefinition.symbol);
    if (!meta) return fallback;
    return Reflect.get(meta, key) ?? fallback;
  }

  #set(key: string, value: unknown): void {
    const meta = Reflect.get(this.target, WireDefinition.symbol);
    if (!meta) throw new Error("Wire definitions are disabled");
    Reflect.set(meta, key, value);
  }

  static from(target: Class): WireDefinition {
    return new WireDefinition(target);
  }
}
