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
