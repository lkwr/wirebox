import { Circuit } from "../index.ts";
import type {
  Class,
  InitializerFn,
  InputsFn,
  ResolvedInstances,
} from "../types.ts";
import { WireDefinition } from "./definition.ts";

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
  if (!options) {
    setMeta(target);
    return;
  }

  if (typeof options === "function") {
    setMeta(target, { inputs: options });
    return;
  }

  setMeta(target, options);
}) as WireFn;

export const unwire = (target: Class): void => {
  WireDefinition.from(target).disable();
};

export const isWired = (target: Class): boolean => {
  return WireDefinition.from(target).isEnabled();
};

const setMeta = (target: Class, options: WireOptions = {}): void => {
  const meta = WireDefinition.from(target);

  meta.enable();

  if (options.inputs) meta.inputs = options.inputs;
  if (options.init) meta.initializer = options.init;
  if (options.async) meta.async = options.async;
  if (options.singleton)
    meta.singleton =
      options.singleton === true ? Circuit.getDefault() : options.singleton;
};
