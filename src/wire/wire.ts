import { Circuit } from "../circuit.ts";
import type { Class, ClassMeta, InitFn, InputFn } from "../types.ts";
import { Meta } from "../utils/meta.ts";
import type { WireFn } from "./types.ts";

const setMeta = (target: Class, options: WireOption = {}) => {
  Meta.set<ClassMeta>(target, {
    init: options.init,
    inputs: options.inputs ?? (() => []),
    singleton: options.singleton
      ? options.singleton === true
        ? Circuit.getDefault()
        : options.singleton
      : undefined,
  });
};

type WireOption = {
  inputs?: InputFn<Class[]>;
  init?: InitFn<Class, Class[]>;
  singleton?: Circuit | boolean;
};

export const wire = ((
  target: Class,
  options?: InputFn<Class[]> | WireOption,
): void => {
  if (!options) return setMeta(target);

  if (typeof options === "function")
    return setMeta(target, { inputs: options });

  return setMeta(target, options);
}) as WireFn;

export const unwire = (target: Class): void => {
  Meta.of(target).delete();
};

export const isWired = (target: Class): boolean => {
  return Meta.of(target).value !== undefined;
};
