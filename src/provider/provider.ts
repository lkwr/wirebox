import type { Class, Context } from "../types.ts";

/**
 * Abstract base class for value providers.
 *
 * Every class thats extends from this class is treated as a value provider.
 * This means its value gets unwrapped and returned on tapping the class.
 */
export abstract class AbstractValueProvider<T> {
  _async: false = false;

  abstract getValue(ctx: Context<typeof AbstractValueProvider<T>>): T;
}

/**
 * Abstract base class for async value providers.
 *
 * Every class thats extends from this class is treated as an async value provider.
 * This means its value gets unwrapped, awaited and returned on tapping the class.
 */
export abstract class AbstractAsyncValueProvider<T> {
  _async: true = true;

  abstract getValue(
    ctx: Context<typeof AbstractAsyncValueProvider<T>>,
  ): Promise<T>;
}
