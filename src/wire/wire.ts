import type { Class, ClassMeta } from "../types.ts";
import { Meta } from "../utils/meta.ts";
import type { WireFn } from "./types.ts";

const setMeta = (target: Class, partialMeta: Partial<ClassMeta> = {}) => {
  Meta.set<ClassMeta>(target, {
    inputs: partialMeta.inputs ?? (() => []),
    init: partialMeta.init,
  });
};

export const wire: WireFn = (target: Class, ...args: unknown[]): void => {
  if (args.length === 0) {
    // no options
    return setMeta(target);
  } else if (args.length === 1) {
    const [param] = args;

    if (typeof param === "function") {
      // input function as parameter options
      return setMeta(target, { inputs: param as ClassMeta["inputs"] });
    } else if (typeof param === "object") {
      // any object options
      return setMeta(target, param as Partial<ClassMeta>);
    }
  } else if (args.length === 2) {
    const [inputs, init] = args;

    if (typeof inputs !== "function" || typeof init !== "function")
      throw new Error("Invalid parameters");

    // input and init function as parameters
    return setMeta(target, {
      inputs: inputs as ClassMeta["inputs"],
      init: init as ClassMeta["init"],
    });
  }
};

export const unwire = (target: Class): void => {
  Meta.of(target).delete();
};

export const isWired = (target: Class): boolean => {
  return Meta.of(target).value !== undefined;
};
