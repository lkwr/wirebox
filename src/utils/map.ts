import { Circuit } from "../circuit";
import {
  type Providable,
  type ProviderInfo,
  type ValueProvider,
  provide,
} from "../provider";
import type { Class, ResolvedInstance } from "../types";
import { wire } from "../wire/wire";

export type ResolvedMap<TTargets extends Record<string, Class>> = {
  [Key in keyof TTargets]: ResolvedInstance<TTargets[Key]>;
};

export const map = <TTargets extends Record<string, Class>>(
  targets: TTargets,
): ValueProvider<ResolvedMap<TTargets>> => {
  class MapProvider implements Providable<ResolvedMap<TTargets>> {
    [provide]: ProviderInfo<ResolvedMap<TTargets>>;

    constructor(circuit: Circuit) {
      const async = Object.values(targets).some((target) =>
        circuit.isAsync(target),
      );

      console.log("use async", async);

      this[provide] = {
        async,
        getValue: () =>
          async ? this.#resolveAsync(circuit) : this.#resolve(circuit),
      };
    }

    #resolve(circuit: Circuit): ResolvedMap<TTargets> {
      const resolvedEntries = Object.entries(targets).map<[string, unknown]>(
        ([key, value]) => [key, circuit.tap(value)],
      );
      const mappedEntries = Object.fromEntries(resolvedEntries);
      return mappedEntries as ResolvedMap<TTargets>;
    }

    async #resolveAsync(circuit: Circuit): Promise<ResolvedMap<TTargets>> {
      const entries = Object.entries(targets).map<Promise<[string, unknown]>>(
        async ([key, value]) => [key, await circuit.tapAsync(value)],
      );
      const resolvedEntries = await Promise.all(entries);
      const mappedEntries = Object.fromEntries(resolvedEntries);
      return mappedEntries as ResolvedMap<TTargets>;
    }
  }

  wire(MapProvider, () => [Circuit]);

  return MapProvider as ValueProvider<ResolvedMap<TTargets>>;
};
