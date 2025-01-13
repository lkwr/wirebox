import type { Circuit } from "../circuit";
import type { Class, Context } from "../types";

export type MetaAsync = boolean;
export type MetaInputs = () => Class[];
export type MetaInit =
  | ((inputs: unknown[], context: Context<Class>) => unknown)
  | undefined;
export type MetaSingleton = Circuit | undefined;

export class WiredMeta {
  static readonly symbol = Symbol.for("WiredMeta.symbol");

  constructor(private target: Class) {}

  // --- async ---

  get async(): MetaAsync {
    return this.#get("async", false) as MetaAsync;
  }

  set async(value: MetaAsync) {
    this.#set("async", value);
  }

  // --- singleton ---

  get singleton(): MetaSingleton {
    return this.#get("singleton", undefined) as MetaSingleton;
  }

  set singleton(value: MetaSingleton) {
    this.#set("singleton", value);
  }

  // --- inputs ---

  get inputs(): MetaInputs {
    return this.#get("inputs", () => []) as MetaInputs;
  }

  set inputs(value: MetaInputs) {
    this.#set("inputs", value);
  }

  // --- init ---

  get init(): MetaInit {
    return this.#get("init", undefined) as MetaInit;
  }

  set init(value: MetaInit) {
    this.#set("init", value);
  }

  // --- helpers ---

  enable() {
    Reflect.defineProperty(this.target, WiredMeta.symbol, {
      enumerable: false,
      configurable: true,
      value: {},
    });
  }

  disable() {
    Reflect.deleteProperty(this.target, WiredMeta.symbol);
  }

  isEnabled(): boolean {
    return Reflect.has(this.target, WiredMeta.symbol);
  }

  #get(key: PropertyKey, fallback: unknown = undefined): unknown {
    const meta = Reflect.get(this.target, WiredMeta.symbol);
    if (!meta) return fallback;
    return Reflect.get(meta, key) ?? fallback;
  }

  #set(key: PropertyKey, value: unknown): void {
    let meta = Reflect.get(this.target, WiredMeta.symbol);
    if (!meta) throw new Error("Meta is disabled");
    Reflect.set(meta, key, value);
  }

  static from(target: Class): WiredMeta {
    return new WiredMeta(target);
  }
}
