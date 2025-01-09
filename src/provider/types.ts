import type { Context } from "../types.ts";
import {
  AbstractAsyncValueProvider,
  AbstractValueProvider,
} from "./provider.ts";

/**
 * A value provider is the instance type of the {@link AbstractValueProvider} class.
 */
export type ValueProvider<T> = new (...args: any[]) => {
  _async: false;
  getValue(ctx: Context): T;
};

/**
 * A async value provider is the instance type of the {@link AbstractAsyncValueProvider} class.
 */
export type AsyncValueProvider<T> = new (...args: any[]) => {
  _async: true;
  getValue(ctx: Context): Promise<T>;
};

/**
 * A helper type which returns the value type of a value provider or async value provider.
 */
export type ProvidedValue<T> = T extends
  | AbstractAsyncValueProvider<infer TAsync>
  | AsyncValueProvider<infer TAsync>
  ? Awaited<TAsync>
  : T extends AbstractValueProvider<infer TSync> | ValueProvider<infer TSync>
    ? TSync
    : never;
