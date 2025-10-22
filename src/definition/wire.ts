import { Circuit } from "../index.ts";
import type {
  Class,
  InitializerFn,
  InputsFn,
  ResolvedInstances,
} from "../types.ts";
import { linksSymbol, WireDefinition } from "./definition.ts";

export type WireFn = {
  // empty

  (target: Class<[]>): void;

  // only inputs

  <
    const TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    target: TTarget,
    inputs: InputsFn<TInputs>,
  ): void;

  // options without initializer

  <
    const TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    target: TTarget,
    options: {
      async?: false;
      singleton?: Circuit | boolean;
      init?: undefined;
      inputs?: InputsFn<TInputs>;
    },
  ): void;

  // options with initializer

  <const TTarget extends Class, const TInputs extends readonly Class[]>(
    target: TTarget,
    options: {
      async?: false;
      singleton?: Circuit | boolean;
      init: InitializerFn<TTarget, NoInfer<TInputs>, false>;
      inputs?: InputsFn<TInputs>;
    },
  ): void;

  <const TTarget extends Class, const TInputs extends Class[]>(
    target: TTarget,
    options: {
      async: true;
      singleton?: Circuit | boolean;
      init: InitializerFn<TTarget, NoInfer<TInputs>, true>;
      inputs?: InputsFn<TInputs>;
    },
  ): void;
};

type WireOptions = {
  inputs?: InputsFn<Class[]>;
  init?: InitializerFn<Class, Class[], boolean>;
  async?: boolean;
  singleton?: Circuit | boolean;
};

export const wire = ((
  target: Class,
  options?: InputsFn<Class[]> | WireOptions,
): void => {
  const links = target[Symbol.metadata]?.[linksSymbol] as
    | (() => Class)[]
    | undefined;

  if (!options) {
    WireDefinition.set(target, { links });
    return;
  }

  if (typeof options === "function") {
    WireDefinition.set(target, { inputs: options, links });
    return;
  }

  WireDefinition.set(target, {
    links,
    inputs: options.inputs,
    initializer: options.init,
    async: options.async,
    singleton:
      options.singleton === true
        ? Circuit.getDefault()
        : options.singleton || null,
  });
}) as WireFn;

export const unwire = (target: Class): void => {
  WireDefinition.unbind(target);
};

export const isWired = (target: Class): boolean => {
  return WireDefinition.from(target) !== undefined;
};
