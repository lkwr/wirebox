import { createAsyncProvider } from "../provider/common";
import type { ProvidableClass } from "../provider/provider";
import type { Class, ResolvedInstance } from "../types";

export const lazy = <T extends Class>(
  lazy: () => Promise<{ default: T }>,
): ProvidableClass<ResolvedInstance<T>> => {
  return createAsyncProvider<ResolvedInstance<T>>(async ({ circuit }) =>
    lazy().then(({ default: target }) => circuit.tapAsync(target)),
  );
};
