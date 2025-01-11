import type { Circuit } from "./circuit.ts";
import type { ProvidedValue } from "./provider/types.ts";

export type Class<
  TArgs extends readonly any[] = readonly any[],
  TReturn = any,
> = new (...args: TArgs extends readonly never[] ? [] : TArgs) => TReturn;

export type Fn<
  TArgs extends readonly any[] = readonly any[],
  TInstance = any,
> = (...args: TArgs) => TInstance;

export type MaybePromise<T> = T | Promise<T>;

export type Wrapped<T> = { value: T };

export type ResolvedInstance<TClass extends Class> =
  ProvidedValue<InstanceType<TClass>> extends never
    ? InstanceType<TClass>
    : ProvidedValue<InstanceType<TClass>>;

export type ResolvedInstances<TClasses extends readonly Class[]> = {
  readonly [Index in keyof TClasses]: ResolvedInstance<TClasses[Index]>;
};

export type ClassMeta = {
  /**
   * Optional initializer function for the class.
   */
  init?: InitFn<Class, Class[]>;

  /**
   * Function to resolve the inputs for the class.
   */
  inputs: InputFn<Class[]>;

  /**
   * The circuit to use for the singleton.
   *
   * If not provided, the class is not a singleton.
   */
  singleton?: Circuit;
};

export type Context = {
  circuit: Circuit;
  dependent?: Class;
};

export type InputFn<TInputs extends readonly Class[]> = (
  circuit: Circuit,
) => TInputs;

export type InitFn<TTarget extends Class, TInputs extends readonly Class[]> = (
  inputs: ResolvedInstances<TInputs>,
  ctx: Context,
) => MaybePromise<InstanceType<TTarget>>;
