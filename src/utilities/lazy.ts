import { createAsyncProvider } from "../provider/common";
import type { ProvidableClass } from "../provider/provider";
import type { Class, ResolvedInstance } from "../types";

/**
 * Creates a lazy loaded class provider for a named export.
 *
 * @param loadModule The function which loads the module (most likely via dynamic import)
 * @param exportName The optional name of the export to load (defaults to default export ["default"])
 * @category Utility: Lazy
 */
export const lazy = <
  TMod extends Record<TExport, Class>,
  TExport extends string = "default",
>(
  loadModule: () => Promise<TMod>,
  exportName: TExport = "default" as TExport,
): ProvidableClass<ResolvedInstance<TMod[TExport]>> => {
  return createAsyncProvider(async ({ circuit }) =>
    loadModule().then(({ [exportName]: target }) => circuit.tapAsync(target)),
  );
};
