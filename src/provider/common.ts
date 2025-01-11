import { Circuit } from "../circuit.ts";
import type {
  Class,
  Context,
  MaybePromise,
  ResolvedInstance,
} from "../types.ts";
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
  getValue: (ctx: Context) => T,
): ValueProvider<T> => {
  class Provider extends AbstractValueProvider<T> {
    private _value: T;

    constructor(ctx: Context) {
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
  getValue: (ctx: Context) => Promise<T>,
): AsyncValueProvider<T> => {
  class Provider extends AbstractAsyncValueProvider<T> {
    private _value: Promise<T>;

    constructor(ctx: Context) {
      super();
      this._value = getValue(ctx);
    }

    override getValue(): Promise<T> {
      return this._value;
    }
  }

  wire(Provider, {
    inputs: () => [],
    init: (_, ctx) => new Provider(ctx),
  });

  return Provider;
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
  class Provider extends AbstractAsyncValueProvider<T> {
    override getValue(): Promise<T> {
      return value;
    }
  }

  wire(Provider);

  return Provider;
};

export const createDynamicProvider = <T>(
  getValue: (ctx: Context) => T,
): ValueProvider<T> => {
  class Provider extends AbstractValueProvider<T> {
    override getValue(ctx: Context): T {
      return getValue(ctx);
    }
  }

  wire(Provider);

  return Provider;
};

export const createAsyncDynamicProvider = <T>(
  getValue: (ctx: Context) => Promise<T>,
): AsyncValueProvider<T> => {
  class Provider extends AbstractAsyncValueProvider<T> {
    override getValue(ctx: Context): Promise<T> {
      return getValue(ctx);
    }
  }

  wire(Provider);

  return Provider;
};

export const withCircuit = <TTarget extends Class>(
  circuit: Circuit,
  target: TTarget,
): ValueProvider<MaybePromise<ResolvedInstance<TTarget>>> =>
  createProvider(() => circuit.tap(target));

export const withCircuitAsync = <TTarget extends Class>(
  circuit: Circuit,
  target: TTarget,
): AsyncValueProvider<MaybePromise<ResolvedInstance<TTarget>>> =>
  createAsyncProvider(() => circuit.tapAsync(target));
