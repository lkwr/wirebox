import type { Class, Context } from "../types.ts";

/**
 * The symbol used to identify providable classes.
 *
 * @category Provider
 */
export const provide: unique symbol = Symbol.for("wirebox.provide");

/**
 * An object which contains provider information.
 *
 * @param TValue The value type provided by the Providable.
 * @category Provider
 */
export type Providable<TValue = unknown> = {
  readonly [provide]: ProviderInfo<TValue>;
};

/**
 * The provider information used to resolve a value.
 *
 * @param TValue The value type provided by the provider.
 * @category Provider
 */
export type ProviderInfo<TValue = unknown> =
  | {
      readonly async?: undefined | false;
      getValue: (ctx: Context) => TValue;
    }
  | {
      readonly async: true;
      getValue: (ctx: Context) => Promise<TValue> | TValue;
    };

/**
 * Infer the value type provided by a {@link ProvidableClass}.
 *
 * @param T The class to infer the value type from.
 * @category Provider
 */
export type ProvidedValue<T extends Class> = T extends ProvidableClass<
  infer TValue
>
  ? TValue
  : never;

/**
 * A class which provides a value and conforms to {@link Providable}.
 *
 * @param TValue The value type provided by the class.
 * @param TArgs The arguments of the class.
 * @category Provider
 */
export type ProvidableClass<
  TValue,
  TArgs extends readonly any[] = any[],
> = Class<TArgs, Providable<TValue>>;
