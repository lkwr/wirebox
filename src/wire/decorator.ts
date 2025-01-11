import type { Circuit } from "../circuit.ts";
import type { Class, InitFn, InputFn, ResolvedInstances } from "../types.ts";
import { wire } from "./wire.ts";

export type ClassDecorator<TTarget extends Class> = (
  target: TTarget,
  context: ClassDecoratorContext<TTarget>,
) => void;

export type WiredDecoratorFn = {
  <TTarget extends Class<readonly []>>(): ClassDecorator<TTarget>;

  <
    TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(
    inputs: InputFn<TInputs>,
  ): ClassDecorator<TTarget>;

  <
    TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(options: {
    init?: undefined;
    inputs?: InputFn<TInputs>;
    singleton?: Circuit | boolean;
  }): ClassDecorator<TTarget>;

  <TTarget extends Class, const TInputs extends readonly Class[]>(options: {
    init: InitFn<TTarget, NoInfer<TInputs>>;
    inputs?: InputFn<TInputs>;
    singleton?: Circuit | boolean;
  }): ClassDecorator<TTarget>;
};

export const wired: WiredDecoratorFn = (
  ...args: unknown[]
): ClassDecorator<Class> => {
  return (target) => {
    const wireArgs = [target, ...args] as Parameters<typeof wire>;
    wire(...wireArgs);
  };
};
