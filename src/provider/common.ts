import { Circuit } from "../circuit.ts";
import type { Class, Context, ResolvedInstance } from "../types.ts";
import { WiredMeta } from "../wire/meta.ts";
import { wire } from "../wire/wire.ts";
import {
  AbstractAsyncValueProvider,
  AbstractValueProvider,
} from "./provider.ts";
import type { AsyncValueProvider, ValueProvider } from "./types.ts";

export class BasicValueProvider<T> extends AbstractValueProvider<T> {
  constructor(public value: T) {
    super();
  }

  override getValue(): T {
    return this.value;
  }
}

export const createProvider = <T>(
  getValue: (ctx: Context<ValueProvider<T>>) => T,
): ValueProvider<T> => {
  class Provider extends AbstractValueProvider<T> {
    private _value: T;

    constructor(ctx: Context<typeof Provider>) {
      super();
      this._value = getValue(ctx);
    }

    override getValue(): T {
      return this._value;
    }
  }

  wire(Provider, {
    inputs: () => [],
    init: (_, ctx) => new Provider(ctx),
  });

  return Provider;
};

export const createAsyncProvider = <T>(
  getValue: (ctx: Context<AsyncValueProvider<T>>) => Promise<T>,
): AsyncValueProvider<T> => {
  class AsyncProvider extends AbstractAsyncValueProvider<T> {
    private _value: Promise<T>;

    constructor(ctx: Context<typeof AsyncProvider>) {
      super();
      this._value = getValue(ctx);
    }

    override getValue(): Promise<T> {
      return this._value;
    }
  }

  wire(AsyncProvider, {
    inputs: () => [],
    init: (_, ctx) => new AsyncProvider(ctx),
  });

  return AsyncProvider;
};

export const createStaticProvider = <T>(value: T): ValueProvider<T> => {
  class Provider extends AbstractValueProvider<T> {
    override getValue(): T {
      return value;
    }
  }

  wire(Provider);

  return Provider;
};

export const createAsyncStaticProvider = <T>(
  value: Promise<T>,
): AsyncValueProvider<T> => {
  class AsyncProvider extends AbstractAsyncValueProvider<T> {
    override getValue(): Promise<T> {
      return value;
    }
  }

  wire(AsyncProvider);

  return AsyncProvider;
};

export const createDynamicProvider = <T>(
  getValue: (ctx: Context<ValueProvider<T>>) => T,
): ValueProvider<T> => {
  class Provider extends AbstractValueProvider<T> {
    override getValue(ctx: Context<typeof Provider>): T {
      return getValue(ctx);
    }
  }

  wire(Provider);

  return Provider;
};

export const createAsyncDynamicProvider = <T>(
  getValue: (ctx: Context<AsyncValueProvider<T>>) => Promise<T>,
): AsyncValueProvider<T> => {
  class AsyncProvider extends AbstractAsyncValueProvider<T> {
    override getValue(ctx: Context<typeof AsyncProvider>): Promise<T> {
      return getValue(ctx);
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
  circuit: Circuit,
  target: TTarget,
):
  | ValueProvider<ResolvedInstance<TTarget>>
  | AsyncValueProvider<ResolvedInstance<TTarget>> => {
  const meta = WiredMeta.from(target);

  if (!meta.isEnabled()) throw new Error(`Class(${target.name}) is not wired.`);

  return meta.async
    ? createAsyncProvider(() => circuit.tapAsync(target))
    : createProvider(() => circuit.tap(target));
};
