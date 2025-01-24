import type { Class, Context } from "../types.ts";

export const provide: unique symbol = Symbol.for("wirebox.provide");

export type Providable<
  TValue = unknown,
  TAsync extends boolean = boolean,
  TClass extends Class = Class,
> = {
  [provide](): ProviderInfo;
};

export type ProviderInfo<
  TValue = unknown,
  TAsync extends boolean = boolean,
  TClass extends Class = Class,
> = {
  async: TAsync;
  getValue: (
    ctx: Context<Class<ConstructorParameters<TClass>, InstanceType<TClass>>>,
  ) => TAsync extends true ? Promise<TValue> : TValue;
};

export type ValueProvider<
  TValue = unknown,
  TAsync extends boolean = boolean,
  TClass extends Class = Class,
> = Class<
  ConstructorParameters<TClass>,
  // TODO problem here -> InstanceType<TClass> is not working as it can be any
  unknown & Providable<TValue, TAsync, TClass>
>;

export type ProvidedValue<T> = T extends
  | ValueProvider<infer TValue, any, any>
  | Providable<infer TValue, any, any>
  ? TValue
  : never;
