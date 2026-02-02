import { getContext } from "../circuit.ts";
import { setStandalone } from "../definition/decorators.ts";
import type { Context } from "../types.ts";
import { type Providable, type ProvidableClass, provide } from "./provider.ts";

/**
 * @category Common Provider
 */
export class BasicValueProvider<T> implements Providable<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  [provide] = {
    getValue: () => this.value,
  };
}

/**
 * @category Common Provider
 */
export const createProvider = <const T>(
  getValue: (ctx: Context) => T,
): ProvidableClass<T, [ctx: Context]> => {
  class Provider implements Providable<T> {
    private _value: T;

    constructor() {
      this._value = getValue(getContext());
    }

    [provide] = {
      getValue: () => this._value,
    };
  }

  setStandalone(Provider);

  return Provider;
};

/**
 * @category Common Provider
 */
export const createAsyncProvider = <const T>(
  getValue: (ctx: Context) => Promise<T>,
): ProvidableClass<T, [ctx: Context]> => {
  class AsyncProvider implements Providable<T> {
    private _value: Promise<T>;

    constructor() {
      this._value = getValue(getContext());
    }

    [provide] = {
      async: true as const,
      getValue: () => this._value,
    };
  }

  setStandalone(AsyncProvider);

  return AsyncProvider;
};

/**
 * @category Common Provider
 */
export const createStaticProvider = <const T>(
  value: T,
): ProvidableClass<T, []> => {
  class Provider implements Providable<T> {
    [provide] = {
      getValue: () => value,
    };
  }

  setStandalone(Provider);

  return Provider;
};

/**
 * @category Common Provider
 */
export const createAsyncStaticProvider = <const T>(
  value: Promise<T>,
): ProvidableClass<T, []> => {
  class AsyncProvider implements Providable<T> {
    [provide] = {
      async: true as const,
      getValue: () => value,
    };
  }

  setStandalone(AsyncProvider);

  return AsyncProvider;
};

/**
 * @category Common Provider
 */
export const createDynamicProvider = <const T>(
  getValue: (ctx: Context) => T,
): ProvidableClass<T> => {
  class Provider implements Providable<T> {
    [provide] = {
      getValue: (ctx: Context) => getValue(ctx),
    };
  }

  setStandalone(Provider);

  return Provider;
};

/**
 * @category Common Provider
 */
export const createAsyncDynamicProvider = <const T>(
  getValue: (ctx: Context) => Promise<T>,
): ProvidableClass<T> => {
  class AsyncProvider implements Providable<T> {
    [provide] = {
      async: true as const,
      getValue: (ctx: Context) => getValue(ctx),
    };
  }

  setStandalone(AsyncProvider);

  return AsyncProvider;
};
