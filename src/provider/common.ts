import type { Circuit } from "../circuit.ts";
import { wire } from "../definition/wire.ts";
import type { Class, Context, ResolvedInstance } from "../types.ts";
import {
  type Providable,
  type ProvidableClass,
  type ProviderInfo,
  provide,
} from "./provider.ts";

export class BasicValueProvider<T> implements Providable<T> {
  constructor(public value: T) {}

  [provide] = {
    async: false as const,
    getValue: () => this.value,
  };
}

export const createProvider = <const T>(
  getValue: (ctx: Context) => T,
): ProvidableClass<T, false, Class<[ctx: Context]>> => {
  class Provider implements Providable<T> {
    private _value: T;

    constructor(ctx: Context) {
      this._value = getValue(ctx);
    }

    [provide] = {
      async: false as const,
      getValue: () => this._value,
    };
  }

  wire(Provider, {
    init: (_, ctx) => new Provider(ctx),
  });

  return Provider;
};

export const createAsyncProvider = <const T>(
  getValue: (ctx: Context) => Promise<T>,
): ProvidableClass<T, true, Class<[ctx: Context]>> => {
  class AsyncProvider implements Providable<T> {
    private _value: Promise<T>;

    constructor(ctx: Context<typeof AsyncProvider>) {
      this._value = getValue(ctx);
    }

    [provide] = {
      async: true as const,
      getValue: () => this._value,
    };
  }

  wire(AsyncProvider, {
    init: (_, ctx) => new AsyncProvider(ctx),
  });

  return AsyncProvider;
};

export const createStaticProvider = <const T>(
  value: T,
): ProvidableClass<T, false> => {
  class Provider implements Providable<T, false> {
    [provide] = {
      async: false as const,
      getValue: () => value,
    };
  }

  wire(Provider);

  return Provider;
};

export const createAsyncStaticProvider = <const T>(
  value: Promise<T>,
): ProvidableClass<T, true> => {
  class AsyncProvider implements Providable<T, true> {
    [provide] = {
      async: true as const,
      getValue: () => value,
    };
  }

  wire(AsyncProvider);

  return AsyncProvider;
};

export const createDynamicProvider = <const T>(
  getValue: (ctx: Context) => T,
): ProvidableClass<T, false> => {
  class Provider implements Providable<T, false> {
    [provide] = {
      async: false as const,
      getValue: (ctx: Context) => getValue(ctx),
    };
  }

  wire(Provider);

  return Provider;
};

export const createAsyncDynamicProvider = <const T>(
  getValue: (ctx: Context) => Promise<T>,
): ProvidableClass<T, true> => {
  class AsyncProvider implements Providable<T, true> {
    [provide] = {
      async: true as const,
      getValue: (ctx: Context) => getValue(ctx),
    };
  }

  wire(AsyncProvider);

  return AsyncProvider;
};

/**
 * Convert a class to an (async) value provider which provides the class instance from the given circuit.
 *
 * If the value provider is async depends on the given class.
 *
 * @param circuit The circuit to instantiate the class from.
 * @param target The class you want with an other circuit.
 * @returns An (async) value provider which provides the class instance from the given circuit.
 */
export const withCircuit = <const TTarget extends Class>(
  circuit: Circuit,
  getTarget: () => TTarget,
): ProvidableClass<ResolvedInstance<TTarget>> => {
  class WithCircuit implements Providable<ResolvedInstance<TTarget>> {
    [provide]: ProviderInfo<ResolvedInstance<TTarget>>;

    constructor() {
      const target = getTarget();
      const async = circuit.isAsync(target);

      this[provide] = {
        async,
        getValue: () =>
          async ? circuit.tapAsync(target) : circuit.tap(target),
      };
    }
  }

  wire(WithCircuit);

  return WithCircuit;
};
