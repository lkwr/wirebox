import type { Class, Context, MaybePromise } from "../types.ts";

export const provide: unique symbol = Symbol.for("wirebox.provide");

export type Providable<TValue = unknown, TAsync extends boolean = boolean> = {
  [provide]: ProviderInfo<TValue, TAsync>;
};

export type ProviderInfo<TValue = unknown, TAsync extends boolean = boolean> = {
  async: TAsync;
  getValue: (
    ctx: Context,
  ) => TAsync extends true ? MaybePromise<TValue> : TValue;
};

export type ProvidedValue<T extends Class> = T extends ProvidableClass<
  infer TValue
>
  ? TValue
  : never;

export type ProvidableClass<
  TValue,
  TAsync extends boolean = boolean,
  TClass extends Class | undefined = undefined,
> = TClass extends Class<infer TArgs, infer TInstance>
  ? Class<
      TArgs,
      object extends TInstance
        ? Providable<TValue, TAsync>
        : TInstance & Providable<TValue, TAsync>
    >
  : Class<[], Providable<TValue, TAsync>>;
