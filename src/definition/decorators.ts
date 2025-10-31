import { Circuit, getCurrentCircuit } from "../circuit";
import { NoCircuitLinkError } from "../errors";
import type {
  Class,
  Context,
  ResolvedInstance,
  ResolvedInstances,
} from "../types";
import { type PreconstructFn, WireDefinition } from "./definition";

export const unwire = (target: Class): void => {
  WireDefinition.unbind(target);
};

export const isWired = (target: Class): boolean => {
  return WireDefinition.from(target) !== undefined;
};

// singleton

export const singleton =
  (circuit?: Circuit) =>
  <T extends Class>(target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).singleton =
      circuit || Circuit.getDefault();
  };

export const setSingleton = <T extends Class>(target: T, circuit?: Circuit) => {
  WireDefinition.from(target, true).singleton = circuit || Circuit.getDefault();
};

// requires

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

export const standalone =
  <T extends Class<readonly []>>() =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).dependencies = () => [];
  };

export const setStandalone = <T extends Class<readonly []>>(target: T) => {
  WireDefinition.from(target, true).dependencies = () => [];
};

// preconstruct

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
    definition.preconstruct = preconstruct as PreconstructFn;
    definition.dependencies = dependencies;
  };

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
  definition.preconstruct = preconstruct as PreconstructFn;
  definition.dependencies = dependencies;
};

// preconstruct async

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
    definition.preconstruct = preconstruct as PreconstructFn;
    definition.dependencies = dependencies;
  };

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
  definition.preconstruct = preconstruct as PreconstructFn;
  definition.dependencies = dependencies;
};

// link

export const link = <T extends Class>(target: T): ResolvedInstance<T> => {
  const circuit = getCurrentCircuit();
  if (!circuit) throw new NoCircuitLinkError(target);
  return circuit.tap(target);
};

// preloads

export const preloads =
  <T extends Class>(preloads: () => readonly Class[]) =>
  (target: T, _context: ClassDecoratorContext<T>) => {
    WireDefinition.from(target, true).preloads = preloads;
  };

export const setPreloads = <T extends Class>(
  target: T,
  preloads: () => readonly Class[],
) => {
  WireDefinition.from(target, true).preloads = preloads;
};
