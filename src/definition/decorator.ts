import type { Circuit } from "../circuit.ts";
import type {
  Class,
  InitializerFn,
  InputsFn,
  ResolvedInstances,
} from "../types.ts";
import { wire } from "./wire.ts";

export type ClassDecorator<TTarget extends Class> = (
  target: TTarget,
  context: ClassDecoratorContext<TTarget>,
) => void;

export type WiredDecoratorFn = {
  // empty

  (): ClassDecorator<Class<[]>>;

  // only inputs

  <const TInputs extends readonly Class[]>(
    inputs: InputsFn<TInputs>,
  ): ClassDecorator<Class<ResolvedInstances<TInputs>>>;

  // options without initializer

  <
    const TTarget extends Class<ResolvedInstances<TInputs>>,
    const TInputs extends readonly Class[],
  >(options: {
    async?: false;
    singleton?: Circuit | boolean;
    init?: undefined;
    inputs?: InputsFn<TInputs>;
  }): ClassDecorator<TTarget>;

  // options with initializer

  <
    const TTarget extends Class,
    const TInputs extends readonly Class[],
  >(options: {
    async?: false;
    singleton?: Circuit | boolean;
    init: InitializerFn<TTarget, NoInfer<TInputs>, false>;
    inputs?: InputsFn<TInputs>;
  }): ClassDecorator<TTarget>;

  <
    const TTarget extends Class,
    const TInputs extends readonly Class[],
  >(options: {
    async: true;
    singleton?: Circuit | boolean;
    init: InitializerFn<TTarget, NoInfer<TInputs>, true>;
    inputs?: InputsFn<TInputs>;
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
