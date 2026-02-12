import { Circuit } from "../circuit.ts";
import { setRequires } from "../definition/decorators.ts";
import {
  type Providable,
  type ProvidableClass,
  type ProviderInfo,
  provide,
} from "../provider/provider.ts";
import type { Class, ResolvedInstance } from "../types.ts";

/**
 * Converts a record of classes to a record of resolved instances.
 *
 * @category Utility: Combine
 */
export type ResolvedCombine<TTargets extends Record<string, Class>> = {
  [Key in keyof TTargets]: ResolvedInstance<TTargets[Key]>;
};

/**
 * Combines multiple classes into a single value by resolving a record
 * of classes to a record of resolved instances.
 *
 * @param getTargets A function which returns the record of classes to resolve.
 * @returns A value provider which returns with a record of resolved instances.
 * @category Utility: Combine
 */
export const combine = <const TTargets extends Record<string, Class>>(
  getTargets: () => TTargets,
): ProvidableClass<ResolvedCombine<TTargets>, [circuit: Circuit]> => {
  class CombineProvider implements Providable<ResolvedCombine<TTargets>> {
    [provide]: ProviderInfo<ResolvedCombine<TTargets>>;

    constructor(circuit: Circuit) {
      const targets = getTargets();

      const async = Object.values(targets).some((target) =>
        circuit.isAsync(target),
      );

      this[provide] = {
        async,
        getValue: () =>
          async
            ? this.#resolveAsync(circuit, targets)
            : this.#resolve(circuit, targets),
      } as ProviderInfo<ResolvedCombine<TTargets>>;
    }

    #resolve(circuit: Circuit, targets: TTargets): ResolvedCombine<TTargets> {
      const resolvedEntries = Object.entries(targets).map<[string, unknown]>(
        ([key, value]) => [key, circuit.tap(value)],
      );
      const mappedEntries = Object.fromEntries(resolvedEntries);
      return mappedEntries as ResolvedCombine<TTargets>;
    }

    async #resolveAsync(
      circuit: Circuit,
      targets: TTargets,
    ): Promise<ResolvedCombine<TTargets>> {
      const entries = Object.entries(targets).map<Promise<[string, unknown]>>(
        async ([key, value]) => [key, await circuit.tapAsync(value)],
      );
      const resolvedEntries = await Promise.all(entries);
      const mappedEntries = Object.fromEntries(resolvedEntries);
      return mappedEntries as ResolvedCombine<TTargets>;
    }
  }

  setRequires(CombineProvider, () => [Circuit]);

  return CombineProvider;
};
