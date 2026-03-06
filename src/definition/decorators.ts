import { Circuit } from "../circuit.ts";
import type {
  Class,
  Context,
  Postcontructable,
  ResolvedInstances,
} from "../types.ts";
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
    defineSingleton(target, circuit);
  };

/**
 * @category Definition Function
 */
export const defineSingleton = <T extends Class>(
  target: T,
  circuit?: Circuit,
) => {
  WireDefinition.define(target, {
    singleton: circuit || Circuit.getDefault(),
  });
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
    dependencies: () => TDeps,
  ) =>
  (target: TTarget, _context: ClassDecoratorContext<TTarget>) => {
    defineRequires(target, dependencies);
  };

/**
 * @category Definition Function
 */
export const defineRequires = <
  TTarget extends Class<ResolvedInstances<TDeps>>,
  const TDeps extends readonly Class[],
>(
  target: TTarget,
  dependencies: () => TDeps,
) => {
  WireDefinition.define(target, {
    dependencies,
  });
};

// standalone

/**
 * @category Definition Decorator
 */
export const standalone =
  <T extends Class<readonly []>>() =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    defineStandalone(target);
  };

/**
 * @category Definition Function
 */
export const defineStandalone = <T extends Class<readonly []>>(target: T) => {
  WireDefinition.define(target, {
    dependencies: () => [],
  });
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
    definePreconstruct(target, preconstruct, dependencies);
  };

/**
 * @category Definition Function
 */
export const definePreconstruct = <
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
  WireDefinition.define(target, {
    dependencies: dependencies ?? (() => []),
    preconstruct: preconstruct as WireDefinition["preconstruct"],
  });
};

// preconstruct async

/**
 * @category Definition Decorator
 */
export const preconstructAsync =
  <T extends Class, const TDeps extends readonly Class[] = readonly []>(
    preconstructAsync: (
      dependencies: ResolvedInstances<TDeps>,
      context: Context,
    ) => Promise<() => InstanceType<T>>,
    dependencies?: () => TDeps,
  ) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    definePreconstructAsync(target, preconstructAsync, dependencies);
  };

/**
 * @category Definition Function
 */
export const definePreconstructAsync = <
  T extends Class<TDeps>,
  const TDeps extends readonly Class[] = readonly [],
>(
  target: T,
  preconstructAsync: (
    dependencies: ResolvedInstances<TDeps>,
    context: Context,
  ) => Promise<() => InstanceType<T>>,
  dependencies?: () => TDeps,
) => {
  WireDefinition.define(target, {
    dependencies: dependencies ?? (() => []),
    preconstructAsync: preconstructAsync as WireDefinition["preconstructAsync"],
  });
};

// setup

/**
 * @category Definition Decorator
 */
export const postconstructAsync =
  <T extends Class, TSetup extends Postcontructable<T>>(setup: TSetup) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    definePostconstructAsync(target, setup);
  };

/**
 * @category Definition Function
 */
export const definePostconstructAsync = <
  T extends Class,
  TSetup extends Postcontructable<T>,
>(
  target: T,
  setup: TSetup,
) => {
  let setupFn: WireDefinition["postconstructAsync"] | PropertyKey = setup;

  if (
    typeof setupFn === "string" ||
    typeof setupFn === "symbol" ||
    typeof setupFn === "number"
  )
    setupFn = target.prototype[setupFn];

  WireDefinition.define(target, {
    postconstructAsync: setupFn as WireDefinition["postconstructAsync"],
  });
};

// preloads

/**
 * @category Definition Decorator
 */
export const preloads =
  <T extends Class>(preloads: () => readonly Class[]) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    definePreloads(target, preloads);
  };

/**
 * @category Definition Function
 */
export const definePreloads = <T extends Class>(
  target: T,
  preloads: () => readonly Class[],
) => {
  WireDefinition.define(target, { preloads });
};
