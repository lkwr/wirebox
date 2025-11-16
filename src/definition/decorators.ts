import { Circuit } from "../circuit.ts";
import type { Class, Context, ResolvedInstances } from "../types.ts";
import { WireDefinition } from "./definition.ts";

/**
 * @category Definition
 */
export const unwire = (target: Class): void => {
  WireDefinition.unbind(target);
};

/**
 * @category Definition
 */
export const isWired = (target: Class): boolean => {
  return WireDefinition.from(target) !== undefined;
};

// singleton

/**
 * @category Definition Decorator
 */
export const singleton =
  (circuit?: Circuit) =>
  <T extends Class>(target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).singleton =
      circuit || Circuit.getDefault();
  };

/**
 * @category Definition Setter
 */
export const setSingleton = <T extends Class>(target: T, circuit?: Circuit) => {
  WireDefinition.from(target, true).singleton = circuit || Circuit.getDefault();
};

// requires

/**
 * @category Definition Decorator
 */
export const requires =
  <
    TTarget extends Class<ResolvedInstances<TDeps>>,
    const TDeps extends readonly Class[],
  >(
    deps: () => TDeps,
  ) =>
  (target: TTarget, _context: ClassDecoratorContext<TTarget>) => {
    WireDefinition.from(target, true).dependencies = deps;
  };

/**
 * @category Definition Setter
 */
export const setRequires = <
  TTarget extends Class<ResolvedInstances<TDeps>>,
  const TDeps extends readonly Class[],
>(
  target: TTarget,
  deps: () => TDeps,
) => {
  WireDefinition.from(target, true).dependencies = deps;
};

// standalone

/**
 * @category Definition Decorator
 */
export const standalone =
  <T extends Class<readonly []>>() =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).dependencies = () => [];
  };

/**
 * @category Definition Setter
 */
export const setStandalone = <T extends Class<readonly []>>(target: T) => {
  WireDefinition.from(target, true).dependencies = () => [];
};

// preconstruct

/**
 * @category Definition Decorator
 */
export const preconstruct =
  <T extends Class, const TDeps extends readonly Class[] = readonly []>(
    preconstruct: (
      dependencies: ResolvedInstances<TDeps>,
      context: Context,
    ) => InstanceType<T>,
    dependencies?: () => TDeps,
  ) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    const definition = WireDefinition.from(target, true);

    definition.async = false;
    definition.preconstruct = preconstruct as WireDefinition["preconstruct"];
    definition.dependencies = dependencies;
  };

/**
 * @category Definition Setter
 */
export const setPreconstruct = <
  T extends Class,
  const TDeps extends readonly Class[] = readonly [],
>(
  target: T,
  preconstruct: (
    dependencies: ResolvedInstances<TDeps>,
    context: Context,
  ) => InstanceType<T>,
  dependencies?: () => TDeps,
) => {
  const definition = WireDefinition.from(target, true);

  definition.async = false;
  definition.preconstruct = preconstruct as WireDefinition["preconstruct"];
  definition.dependencies = dependencies;
};

// preconstruct async

/**
 * @category Definition Decorator
 */
export const preconstructAsync =
  <T extends Class, const TDeps extends readonly Class[] = readonly []>(
    preconstruct: (
      dependencies: ResolvedInstances<TDeps>,
      context: Context,
    ) => Promise<() => InstanceType<T>>,
    dependencies?: () => TDeps,
  ) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    const definition = WireDefinition.from(target, true);

    definition.async = true;
    definition.preconstruct = preconstruct as WireDefinition["preconstruct"];
    definition.dependencies = dependencies;
  };

/**
 * @category Definition Setter
 */
export const setPreconstructAsync = <
  T extends Class<TDeps>,
  const TDeps extends readonly Class[] = readonly [],
>(
  target: T,
  preconstruct: (
    dependencies: ResolvedInstances<TDeps>,
    context: Context,
  ) => Promise<() => InstanceType<T>>,
  dependencies?: () => TDeps,
) => {
  const definition = WireDefinition.from(target, true);

  definition.async = true;
  definition.preconstruct = preconstruct as WireDefinition["preconstruct"];
  definition.dependencies = dependencies;
};

// preloads

/**
 * @category Definition Decorator
 */
export const preloads =
  <T extends Class>(preloads: () => readonly Class[]) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).preloads = preloads;
  };

/**
 * @category Definition Setter
 */
export const setPreloads = <T extends Class>(
  target: T,
  preloads: () => readonly Class[],
) => {
  WireDefinition.from(target, true).preloads = preloads;
};
