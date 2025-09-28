import type { Class, Context, MaybePromise } from "../types.ts";

export const provide: unique symbol = Symbol.for("wirebox.provide");

export type Providable<TValue = unknown> = {
  readonly [provide]: ProviderInfo<TValue>;
};

export type ProviderInfo<TValue = unknown> =
  | {
      readonly async?: undefined | false;
      getValue: (ctx: Context) => TValue;
    }
  | {
      readonly async: true;
      getValue: (ctx: Context) => MaybePromise<TValue>;
    };

export type ProvidedValue<T extends Class> = T extends ProvidableClass<
  infer TValue
>
  ? TValue
  : never;

export type ProvidableClass<
  TValue,
  TArgs extends readonly any[] = any[],
> = Class<TArgs, Providable<TValue>>;
