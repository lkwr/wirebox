import type { Circuit } from "./circuit.ts";
import type { ProvidedValue } from "./provider/provider.ts";

/**
 * A representation of a class type.
 *
 * @param TArgs The arguments of the class.
 * @param TInstance The instance type of the class.
 * @category Utility Type
 */
export type Class<
  TArgs extends readonly any[] = readonly any[],
  TInstance = any,
> = abstract new (...args: TArgs) => TInstance;

/**
 * Extracts properties from a type `T` whose types match `V` exactly.
 *
 * @param T The source type.
 * @param V The value type to extract.
 * @category Utility Type
 */
export type ExtractProperties<T, V> = {
  [K in keyof T as T[K] extends V ? (V extends T[K] ? K : never) : never]: T[K];
};

/**
 * A type representing a setup function for a class.
 *
 * This can be:
 * - A function that returns a void promise and is bound to the instance.
 * - A function that returns another function which is bound to the instance and returns a void promise.
 * - A key of a method on the instance that returns a void promise.
 */
export type Setupable<T extends Class> =
  | ((this: InstanceType<T>) => void | Promise<void>)
  | (() => (this: InstanceType<T>) => void | Promise<void>)
  | keyof ExtractProperties<
      InstanceType<T>,
      (() => Promise<void>) | (() => void)
    >;

/**
 * A wrapped value which holds the actual value in the `value` property.
 *
 * Used to await a function which returns an inner promise without resolving it.
 *
 * @param T The wrapped value type.
 * @category Utility Type
 */
export type Wrapped<T> = { value: T };

/**
 * The resolved instance of a class when {@link tap} or {@link tapAsync} is called.
 *
 * It is similar to the {@link InstanceType} utility type, but resolve {@link Providable} classes.
 *
 * @param TClass The class to resolve.
 * @category Utility Type
 */
export type ResolvedInstance<TClass extends Class> =
  ProvidedValue<TClass> extends never
    ? InstanceType<TClass>
    : ProvidedValue<TClass>;

/**
 * The resolved instances of multiple classes in an array.
 *
 * It is similar to the {@link ResolvedInstance} type, but for multiple classes.
 *
 * @category Utility Type
 */
export type ResolvedInstances<TClasses extends readonly Class[]> =
  TClasses extends never[]
    ? readonly []
    : {
        readonly [TKey in keyof TClasses]: ResolvedInstance<TClasses[TKey]>;
      };

/**
 * The context which is provided inside preconstructors and providers.
 *
 * @param TOrigin The origin class of the context.
 * @category Utility Type
 */
export type Context<TOrigin extends Class = Class> = {
  /**
   * The circuit which is currently resolving the target.
   */
  circuit: Circuit;

  /**
   * The target class which is currently being resolved.
   */
  target: TOrigin;

  /**
   * The class which depends on the target and the reason why it is being resolved.
   *
   * This can be `undefined` if the target is being resolved directly using {@link tap} or {@link tapAsync}.
   */
  dependent?: Class;
};
