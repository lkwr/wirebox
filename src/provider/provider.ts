import type { Class, Context, NonAnyInstanceType } from "../types.ts";

export const provide: unique symbol = Symbol.for("wirebox.provide");

export type Providable<TValue = unknown, TAsync extends boolean = boolean> = {
  [provide]: ProviderInfo<TValue, TAsync>;
};

export type ProviderInfo<TValue = unknown, TAsync extends boolean = boolean> = {
  async: TAsync;
  getValue: (ctx: Context) => TAsync extends true ? Promise<TValue> : TValue;
};

export type ValueProvider<
  TValue = unknown,
  TAsync extends boolean = boolean,
  TClass extends Class = Class,
> = Class<
  ConstructorParameters<TClass>,
  NonAnyInstanceType<TClass> & Providable<TValue, TAsync>
>;

export type ProvidedValue<T extends Class> = T extends
  | ValueProvider<infer TValue>
  | Class<any[], Providable<infer TValue>>
  ? TValue
  : never;
