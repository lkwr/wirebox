import { Circuit } from "../circuit.ts";
import type { Class, Context, ResolvedInstances, Setupable } from "../types.ts";
import { WireDefinition } from "./definition.ts";

/**
 * @category Definition
 */
export const unwire = (target: Class): boolean => {
  return WireDefinition.from(target)?.remove() ?? false;
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
    setSingleton(target, circuit);
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
    setRequires(target, deps);
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
    setStandalone(target);
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
    setPreconstruct(target, preconstruct, dependencies);
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
    setPreconstructAsync(target, preconstruct, dependencies);
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

  definition.preconstruct = preconstruct as WireDefinition["preconstruct"];
  definition.dependencies = dependencies;
};

// setup

/**
 * @category Definition Decorator
 */
export const setup =
  <T extends Class<readonly []>, TSetup extends Setupable<T>>(setup: TSetup) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    setSetup(target, setup);
  };

/**
 * @category Definition Setter
 */
export const setSetup = <
  T extends Class<readonly []>,
  TSetup extends Setupable<T>,
>(
  target: T,
  setup: TSetup,
) => {
  let setupFn: WireDefinition["setup"] | PropertyKey = setup;

  if (
    typeof setupFn === "string" ||
    typeof setupFn === "symbol" ||
    typeof setupFn === "number"
  )
    setupFn = target.prototype[setupFn];

  WireDefinition.from(target, true).setup = setupFn as WireDefinition["setup"];
};

// preloads

/**
 * @category Definition Decorator
 */
export const preloads =
  <T extends Class>(preloads: () => readonly Class[]) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    setPreloads(target, preloads);
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
