import type { Circuit } from "../circuit.ts";
import { setStandalone } from "../definition/decorators.ts";
import {
  type Providable,
  type ProvidableClass,
  type ProviderInfo,
  provide,
} from "../provider/provider.ts";
import type { Class, ResolvedInstance } from "../types.ts";

/**
 * Bind a {@link Circuit} to a given class.
 *
 * This is useful when forced to use a specific circuit but can't or don't want to use singletons.
 *
 * Internally, this creates a custom provider which uses the given circuit to resolve the class.
 *
 * @param circuit The circuit to instantiate the class from.
 * @param getTarget The class getter of the target class which should be accessed from the circuit.
 * @returns An (async) value provider which provides the class instance from the given circuit.
 * @category Utility: With Circuit
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
      } as ProviderInfo<ResolvedInstance<TTarget>>;
    }
  }

  setStandalone(WithCircuit);

  return WithCircuit;
};
