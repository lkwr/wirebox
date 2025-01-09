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

  <TTarget extends Class, const TInputs extends readonly Class[]>(
    target: TTarget,
    inputs: InputFn<TInputs>,
    init: InitFn<TTarget, TInputs>,
  ): void;

  <
    TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    target: TTarget,
    options: {
      inputs: InputFn<TInputs>;
    },
  ): void;

  <TTarget extends Class, const TInputs extends readonly Class[]>(
    target: TTarget,
    options: {
      init: InitFn<TTarget, TInputs>;
    },
  ): void;

  <TTarget extends Class, const TInputs extends readonly Class[]>(
    target: TTarget,
    options: {
      inputs: InputFn<TInputs>;
      init: InitFn<TTarget, TInputs>;
    },
  ): void;
};
