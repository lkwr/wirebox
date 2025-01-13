import { Circuit } from "../circuit.ts";
import type { Class, InitFn, InputFn } from "../types.ts";
import { WiredMeta } from "./meta.ts";
import type { WireFn } from "./types.ts";

const setMeta = (target: Class, options: WireOption = {}) => {
  const meta = WiredMeta.from(target);

  meta.enable();
  if (options.async) meta.async = options.async;
  if (options.init) meta.init = options.init;
  if (options.inputs) meta.inputs = options.inputs;
  if (options.singleton)
    meta.singleton = options.singleton
      ? options.singleton === true
        ? Circuit.getDefault()
        : options.singleton
      : undefined;
};

type WireOption = {
  async?: boolean;
  inputs?: InputFn<Class[]>;
  init?: InitFn<Class, Class[], boolean>;
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
  WiredMeta.from(target).disable();
};

export const isWired = (target: Class): boolean => {
  return WiredMeta.from(target).isEnabled();
};
