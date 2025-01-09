import {
  AbstractAsyncValueProvider,
  AbstractValueProvider,
} from "./provider/provider.ts";
import type {
  Class,
  ClassMeta,
  Context,
  ResolvedInstance,
  ResolvedInstances,
  Wrapped,
} from "./types.ts";
import { Meta } from "./utils/meta.ts";

/**
 * A circuit is a container which is responsible for managing the instances by holding and initializing them.
 *
 * Only one instance of a class can exist in a circuit.
 */
export class Circuit {
  /**
   * The default circuit.
   */
  private static readonly default = new Circuit();

  private readonly instances = new WeakMap<Class, InstanceType<Class>>();
  private readonly asyncInitializers = new WeakMap<
    Class,
    Promise<InstanceType<Class>>
  >();

  constructor() {
    // install this circuit instance in the circuit itself
    // after that it is possible to use the circuit class as an input.
    this.install(Circuit, this);
  }

  tap<TTarget extends Class>(Target: TTarget): ResolvedInstance<TTarget> {
    return this.resolve(Target);
  }

  tapAsync<TTarget extends Class>(
    Target: TTarget,
  ): Promise<ResolvedInstance<TTarget>> {
    return this.resolveAsync(Target).then((wrapper) => wrapper.value);
  }

  private resolve<TTarget extends Class>(
    Target: TTarget,
    dependent?: Class,
  ): ResolvedInstance<TTarget> {
    const savedInstance = this.instances.get(Target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance)
      return this.resolveInstance(savedInstance, Target, dependent);

    // if target has an async initializer running, throw an error
    // that is because this function is sync and cannot return a promise
    if (this.asyncInitializers.has(Target))
      throw new Error(
        `Class(${Target.name}) is async and currently initializing. Use "tapAsync" instead.`,
      );

    // get the class meta
    const meta = Meta.get<ClassMeta>(Target);
    if (!meta)
      throw new Error(`Class("${Target.name}") is not registered for wiring.`);

    // resolve the inputs
    const inputs = this.resolveInputs(meta.inputs(this), Target);

    // initialize the class either with the initializier if available or with the constructor
    const instance = meta.init
      ? meta.init(inputs, this.getContext(dependent))
      : new Target(...inputs);

    // check if the class is async
    if (instance instanceof Promise) {
      // handle the promise and save it to prevent multiple async initializations
      this.handlePromise(Target, instance, dependent);

      throw new Error(
        `Class(${Target.name}) is async and now initializing. Use "tapAsync" instead.`,
      );
    } else {
      // save the instance to prevent multiple initializations
      this.instances.set(Target, instance);

      // resolve and return the instance
      return this.resolveInstance(instance, Target, dependent);
    }
  }

  private resolveAsync<TTarget extends Class>(
    Target: TTarget,
    dependent?: Class,
  ): Promise<Wrapped<ResolvedInstance<TTarget>>> {
    const savedInstance = this.instances.get(Target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance)
      return this.resolveInstanceAsync(savedInstance, dependent);

    const asyncInitializer = this.asyncInitializers.get(Target);

    // if there is an async initializer, return the promise with the resolved instance
    if (asyncInitializer)
      return asyncInitializer.then((result: any) =>
        this.resolveInstanceAsync(result, dependent),
      );

    // get the class meta
    const meta = Meta.get<ClassMeta>(Target);
    if (!meta)
      throw new Error(`Class("${Target.name}") is not registered for wiring!`);

    // resolve the inputs and initialize the class, with either the initializer or the constructor
    const promise = this.resolveInputsAsync(meta.inputs(this), Target).then(
      (inputs) =>
        meta.init
          ? meta.init(inputs, this.getContext(dependent))
          : new Target(...inputs),
    );

    // handle the promise and save it to prevent multiple async initializations
    // and return the promise
    return this.handlePromise(Target, promise, dependent);
  }

  /**
   * Installing means to manually add an instance to the circuit.
   * The installed instance class also don't need to be wired
   * because you are responsible for initializing it.
   *
   * For example, when a circuit is created, it installs itself as an instance.
   * With this, it is possible to use the circuit class as an input.
   *
   * You can use this to manually add instances you already have initialized.
   *
   * @param Target The class of the instance to install.
   * @param instance The instance to install.
   * @returns The instance that was installed.
   */
  install<TTarget extends Class>(
    Target: TTarget,
    instance: InstanceType<TTarget>,
  ): InstanceType<TTarget> {
    // if the class is already initialized, throw an error
    if (this.instances.has(Target))
      throw new Error(`Class(${Target.name}) is already initialized.`);

    // save the instance
    this.instances.set(Target, instance);

    // return the instance
    return instance;
  }

  /**
   * Check if the given class is initialized in this circuit.
   *
   * @param Target The class to check.
   * @returns True if the class is initialized, false otherwise.
   */
  has<TTarget extends Class>(Target: TTarget): boolean {
    return this.instances.has(Target);
  }

  private handlePromise<T>(
    target: Class,
    promise: Promise<T>,
    dependent?: Class,
  ): Promise<T> {
    const pipedPromise = promise
      .then((instance) => {
        if (this.instances.has(target))
          throw new Error("Class already initialized");

        this.instances.set(target, instance);
        return this.resolveInstanceAsync(instance, dependent);
      })
      .finally(() => {
        this.asyncInitializers.delete(target);
      });

    this.asyncInitializers.set(target, promise);

    return pipedPromise as Promise<T>;
  }

  private getContext(dependent?: Class): Context {
    return { circuit: this, dependent };
  }

  private resolveInputs<TInputs extends readonly Class[]>(
    inputs: TInputs,
    target: Class,
  ): ResolvedInstances<TInputs> {
    return inputs.map((input) =>
      this.resolve(input, target),
    ) as ResolvedInstances<TInputs>;
  }

  private async resolveInputsAsync<TInputs extends readonly Class[]>(
    inputs: TInputs,
    target: Class,
  ): Promise<ResolvedInstances<TInputs>> {
    const wrappedInputs = await Promise.all(
      inputs.map((input) => this.resolveAsync(input, target)),
    );
    return wrappedInputs.map(
      (inputWrapper) => inputWrapper.value,
    ) as ResolvedInstances<TInputs>;
  }

  private resolveInstance<TTarget extends Class>(
    instance: InstanceType<TTarget>,
    target: TTarget,
    dependent?: Class,
  ): ResolvedInstance<TTarget> {
    const value: any = instance;

    if (value instanceof AbstractValueProvider)
      return value.getValue(this.getContext(dependent));
    if (value instanceof AbstractAsyncValueProvider)
      throw new Error(
        `Class("${target.name}") is a async value provider and cannot be used in sync tap.`,
      );

    return value;
  }

  private async resolveInstanceAsync<TTarget extends Class>(
    instance: InstanceType<TTarget>,
    dependent?: Class,
  ): Promise<Wrapped<ResolvedInstance<TTarget>>> {
    const value: any = instance;

    if (value instanceof AbstractValueProvider)
      return { value: value.getValue(this.getContext(dependent)) };
    if (value instanceof AbstractAsyncValueProvider)
      return { value: await value.getValue(this.getContext(dependent)) };

    return { value };
  }

  public static getDefault(): Circuit {
    return Circuit.default;
  }
}

export const tap = <TTarget extends Class>(
  target: TTarget,
  circuit: Circuit = Circuit.getDefault(),
): ResolvedInstance<TTarget> => {
  return circuit.tap(target);
};

export const tapAsync = <TTarget extends Class>(
  target: TTarget,
  circuit: Circuit = Circuit.getDefault(),
): Promise<ResolvedInstance<TTarget>> => {
  return circuit.tapAsync(target);
};
