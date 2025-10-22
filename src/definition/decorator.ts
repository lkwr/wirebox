import { Circuit, getCircuit } from "../circuit.ts";
import type {
  Class,
  InitializerFn,
  InputsFn,
  ResolvedInstance,
  ResolvedInstances,
} from "../types.ts";
import { linksSymbol, WireDefinition } from "./definition.ts";

export type ClassDecorator<TTarget extends Class> = (
  target: TTarget,
  context: ClassDecoratorContext<TTarget>,
) => void;

export type ClassFieldDecorator<T> = (
  target: undefined,
  context: ClassFieldDecoratorContext<unknown, T>,
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

type WiredOptions = {
  inputs?: InputsFn<Class[]>;
  init?: InitializerFn<Class, Class[], boolean>;
  async?: boolean;
  singleton?: Circuit | boolean;
};

export const wired: WiredDecoratorFn = (
  options?: InputsFn<Class[]> | WiredOptions,
): ClassDecorator<Class> => {
  return (target, context) => {
    const links = context.metadata[linksSymbol] as (() => Class)[] | undefined;

    if (!options) {
      WireDefinition.set(target, { links });
      return;
    }

    if (typeof options === "function") {
      WireDefinition.set(target, { inputs: options, links });
      return;
    }

    WireDefinition.set(target, {
      links,
      inputs: options.inputs,
      initializer: options.init,
      async: options.async,
      singleton:
        options.singleton === true
          ? Circuit.getDefault()
          : options.singleton || null,
    });
  };
};

export const linked = <T extends Class>(
  target: () => T,
): ClassFieldDecorator<ResolvedInstance<T>> => {
  return (_, context) => {
    context.metadata[linksSymbol] ??= [];
    const links = context.metadata[linksSymbol] as (() => Class)[];

    links.push(target);

    context.addInitializer(function () {
      const circuit = getCircuit();
      if (!circuit)
        throw new Error("No circuit available in context for linked injection");

      context.access.set(this, circuit.tap(target()));
    });
  };
};
