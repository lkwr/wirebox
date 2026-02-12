import {
  setPreconstruct,
  setPreconstructAsync,
} from "../definition/decorators.ts";
import type { ProvidableClass } from "../provider/provider.ts";
import type { Class, Context, ResolvedInstances } from "../types.ts";

/**
 * A target that a conditional decorator can resolve to, either a class
 * extending `T` or a providable class providing an instance of `T`.
 */
type ConditionalTarget<T extends Class> =
  | Class<any[], InstanceType<T>>
  | ProvidableClass<InstanceType<T>>;

/**
 * @category Utility: Conditional
 */
export const conditional =
  <T extends Class, const TDeps extends readonly Class[] = readonly []>(
    resolve: (
      dependencies: ResolvedInstances<TDeps>,
      context: Context,
    ) => ConditionalTarget<NoInfer<T>>,
    dependencies?: () => TDeps,
  ) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    setConditional(target, resolve, dependencies);
  };

/**
 * @category Utility: Conditional
 */
export const setConditional = <
  T extends Class,
  const TDeps extends readonly Class[] = readonly [],
>(
  target: T,
  resolve: (
    dependencies: ResolvedInstances<TDeps>,
    context: Context,
  ) => ConditionalTarget<NoInfer<T>>,
  dependencies?: () => TDeps,
) => {
  setPreconstruct(
    target,
    (dependencies, context) => {
      const target = resolve(dependencies, context);
      const instance = context.circuit.tap(target);

      return instance as InstanceType<T>;
    },
    dependencies,
  );
};

/**
 * @category Utility: Conditional
 */
export const conditionalAsync =
  <T extends Class, const TDeps extends readonly Class[] = readonly []>(
    resolveAsync: (
      dependencies: ResolvedInstances<TDeps>,
      context: Context,
    ) => Promise<ConditionalTarget<NoInfer<T>>> | ConditionalTarget<NoInfer<T>>,
    dependencies?: () => TDeps,
  ) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    setConditionalAsync(target, resolveAsync, dependencies);
  };

/**
 * @category Utility: Conditional
 */
export const setConditionalAsync = <
  T extends Class,
  const TDeps extends readonly Class[] = readonly [],
>(
  target: T,
  resolveAsync: (
    dependencies: ResolvedInstances<TDeps>,
    context: Context,
  ) => Promise<ConditionalTarget<NoInfer<T>>> | ConditionalTarget<NoInfer<T>>,
  dependencies?: () => TDeps,
) => {
  setPreconstructAsync(
    target,
    async (dependencies, context) => {
      const target = await resolveAsync(dependencies, context);
      const instance = await context.circuit.tapAsync(target);

      return () => instance as InstanceType<T>;
    },

    dependencies,
  );
};
