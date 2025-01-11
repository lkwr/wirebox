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
      init?: undefined;
      inputs?: InputFn<TInputs>;
      singleton?: Circuit | boolean;
    },
  ): void;

  <TTarget extends Class, const TInputs extends readonly Class[]>(
    target: TTarget,
    options: {
      init: InitFn<TTarget, NoInfer<TInputs>>;
      inputs?: InputFn<TInputs>;
      singleton?: Circuit | boolean;
    },
  ): void;
};
