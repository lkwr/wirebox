import type { Circuit } from "../circuit.ts";
import type { Class, InitFn, InputFn, ResolvedInstances } from "../types.ts";

export type WireFn = {
  <TTarget extends Class<readonly []>>(target: TTarget): void;

  <
    TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    target: TTarget,
    inputs: InputFn<TInputs>,
  ): void;

  <
    TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    target: TTarget,
    options: {
      async?: false;
      singleton?: Circuit | boolean;
      init?: undefined;
      inputs?: InputFn<TInputs>;
    },
  ): void;

  <
    TTarget extends Class,
    const TInputs extends readonly Class[],
    const TAsync extends boolean = false,
  >(
    target: TTarget,
    options: {
      async?: TAsync;
      singleton?: Circuit | boolean;
      init: InitFn<TTarget, NoInfer<TInputs>, NoInfer<TAsync>>;
      inputs?: InputFn<TInputs>;
    },
  ): void;
};
