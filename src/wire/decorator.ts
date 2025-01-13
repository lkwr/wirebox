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
    async?: false;
    singleton?: Circuit | boolean;
    init?: undefined;
    inputs?: InputFn<TInputs>;
  }): ClassDecorator<TTarget>;

  <
    TTarget extends Class,
    const TInputs extends readonly Class[],
    const TAsync extends boolean = false,
  >(options: {
    async?: TAsync;
    singleton?: Circuit | boolean;
    init: InitFn<TTarget, NoInfer<TInputs>, NoInfer<TAsync>>;
    inputs?: InputFn<TInputs>;
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
