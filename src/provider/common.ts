import { Circuit } from "../circuit.ts";
import type { Class, Context, ResolvedInstance } from "../types.ts";
import { WiredMeta } from "../wire/meta.ts";
import { wire } from "../wire/wire.ts";
import {
  type Providable,
  type ProviderInfo,
  type ValueProvider,
  provide,
} from "./provider.ts";

export class BasicValueProvider<T> implements Providable<T, false> {
  constructor(public value: T) {}

  [provide](): ProviderInfo<T, false> {
    return {
      async: false as const,
      getValue: () => this.value,
    };
  }
}

export const createProvider = <T>(
  getValue: (ctx: Context) => T,
): ValueProvider<T, false> => {
  class Provider implements Providable<T, false> {
    private _value: T;

    constructor(ctx: Context) {
      this._value = getValue(ctx);
    }

    [provide]() {
      return {
        async: false as const,
        getValue: () => this._value,
      };
    }
  }

  wire(Provider, {
    init: (_, ctx) => new Provider(ctx),
  });

  return Provider as ValueProvider<T, false>;
};

export const createAsyncProvider = <T>(
  getValue: (ctx: Context) => Promise<T>,
): ValueProvider<T, true> => {
  class AsyncProvider implements Providable<T, true> {
    private _value: Promise<T>;

    constructor(ctx: Context<typeof AsyncProvider>) {
      this._value = getValue(ctx);
    }

    [provide](): ProviderInfo {
      return {
        async: true as const,
        getValue: () => this._value,
      };
    }
  }

  wire(AsyncProvider, {
    init: (_, ctx) => new AsyncProvider(ctx),
  });

  return AsyncProvider as ValueProvider<T, true>;
};

export const createStaticProvider = <T>(value: T): ValueProvider<T, false> => {
  class Provider implements Providable<T, false> {
    [provide](): ProviderInfo<T, false> {
      return {
        async: false as const,
        getValue: () => value,
      };
    }
  }

  wire(Provider);

  return Provider;
};

export const createAsyncStaticProvider = <T>(
  value: Promise<T>,
): ValueProvider<T, true> => {
  class AsyncProvider implements Providable<T, true> {
    [provide](): ProviderInfo {
      return {
        async: true as const,
        getValue: () => value,
      };
    }
  }

  wire(AsyncProvider);

  return AsyncProvider;
};

export const createDynamicProvider = <T>(
  getValue: (ctx: Context) => T,
): ValueProvider<T, false> => {
  class Provider implements Providable<T, false> {
    [provide](): ProviderInfo<T> {
      return {
        async: false as const,
        getValue: (ctx) => getValue(ctx),
      };
    }
  }

  wire(Provider);

  return Provider;
};

export const createAsyncDynamicProvider = <T>(
  getValue: (ctx: Context) => Promise<T>,
): ValueProvider<T, true> => {
  class AsyncProvider implements Providable<T, true> {
    [provide](): ProviderInfo<T> {
      return {
        async: true as const,
        getValue: (ctx) => getValue(ctx),
      };
    }
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
export const withCircuit = <TTarget extends Class>(
  curcuit: Circuit,
  getTarget: () => TTarget,
): ValueProvider<ResolvedInstance<TTarget>> => {
  return class WithCircuit implements Providable<ResolvedInstance<TTarget>> {
    [provide](): ProviderInfo<ResolvedInstance<TTarget>> {
      const target = getTarget();
      const isAsync = WiredMeta.from(target).async;

      return isAsync
        ? { async: true, getValue: () => curcuit.tapAsync(target) }
        : { async: false, getValue: () => curcuit.tap(target) };
    }
  };
};
