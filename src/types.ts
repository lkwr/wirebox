import type { Circuit } from "./circuit.ts";
import type { ProvidedValue } from "./provider/provider.ts";

export type AbstractClass<
  TArgs extends readonly any[] = readonly any[],
  TReturn = any,
> = abstract new (
  ...args: TArgs extends readonly never[] ? [] : TArgs
) => TReturn;

export type NonAbstractClass<
  TArgs extends readonly any[] = readonly any[],
  TReturn = any,
> = new (...args: TArgs extends readonly never[] ? [] : TArgs) => TReturn;

export type Class<
  TArgs extends readonly any[] = readonly any[],
  TReturn = any,
> = NonAbstractClass<TArgs, TReturn> | AbstractClass<TArgs, TReturn>;

export type NonAnyInstanceType<TClass extends Class> =
  {} extends InstanceType<TClass> ? object : InstanceType<TClass>;

export type Fn<
  TArgs extends readonly any[] = readonly any[],
  TInstance = any,
> = (...args: TArgs) => TInstance;

export type MaybePromise<T> = T | Promise<T>;

export type Wrapped<T> = { value: T };

export type ResolvedInstance<TClass extends Class> =
  ProvidedValue<TClass> extends never
    ? InstanceType<TClass>
    : ProvidedValue<TClass>;

export type ResolvedInstances<TClasses extends readonly Class[]> = {
  readonly [Index in keyof TClasses]: ResolvedInstance<TClasses[Index]>;
};

export type Context<TOrigin extends Class = Class> = {
  circuit: Circuit;
  target: TOrigin;
  dependent?: Class;
};

export type InputFn<TInputs extends readonly Class[]> = () => TInputs;

export type InitFn<
  TTarget extends Class,
  TInputs extends readonly Class[],
  TAsync extends boolean,
> = (
  inputs: ResolvedInstances<TInputs>,
  ctx: Context<TTarget>,
) => TAsync extends true
  ? MaybePromise<InstanceType<TTarget>>
  : InstanceType<TTarget>;
