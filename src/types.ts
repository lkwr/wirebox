import type { Circuit } from "./circuit.ts";
import type { ProvidedValue } from "./provider/provider.ts";

export type Class<
  TArgs extends readonly any[] = readonly any[],
  TInstance = any,
> = abstract new (...args: TArgs) => TInstance;

export type MaybePromise<T> = T | Promise<T>;

export type Wrapped<T> = { value: T };

export type ResolvedInstance<TClass extends Class> =
  ProvidedValue<TClass> extends never
    ? InstanceType<TClass>
    : ProvidedValue<TClass>;

export type ResolvedInstances<TClasses extends readonly Class[]> =
  TClasses extends never[]
    ? readonly []
    : {
        readonly [TKey in keyof TClasses]: ResolvedInstance<TClasses[TKey]>;
      };

export type Context<TOrigin extends Class = Class> = {
  circuit: Circuit;
  target: TOrigin;
  dependent?: Class;
};

export type InputsFn<TInputs extends readonly Class[]> = () => TInputs;

export type InitializerFn<
  TTarget extends Class,
  TInputs extends readonly Class[],
  TAsync extends boolean,
> = (
  dependencies: ResolvedInstances<TInputs>,
  ctx: Context<TTarget>,
) => TAsync extends true
  ? MaybePromise<ConstructorParameters<TTarget>>
  : ConstructorParameters<TTarget>;
