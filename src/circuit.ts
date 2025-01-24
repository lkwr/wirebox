import { type ProviderInfo, provide } from "./provider/provider.ts";
import type { Class, Context, ResolvedInstance, Wrapped } from "./types.ts";
import { WiredMeta } from "./wire/meta.ts";

/**
 * A circuit is a container which is responsible for managing the instances by holding and initializing them.
 *
 * Only one instance of a class can exist in a circuit.
 */
export class Circuit<TData = unknown> {
  /**
   * The default circuit.
   */
  private static readonly default = new Circuit();

  readonly #instances = new WeakMap<Class, InstanceType<Class>>();
  readonly #asyncInitializers = new WeakMap<
    Class,
    Promise<InstanceType<Class>>
  >();

  readonly data: TData;

  constructor(data: TData = undefined as TData) {
    this.data = data;

    // install this circuit instance in the circuit itself
    // after that it is possible to use the circuit class as an input.
    this.install(Circuit, this);
  }

  tap<TTarget extends Class>(target: TTarget): ResolvedInstance<TTarget> {
    return this.#resolve(
      target,
      this.#createContext(target),
    ) as ResolvedInstance<TTarget>;
  }

  tapAsync<TTarget extends Class>(
    target: TTarget,
  ): Promise<ResolvedInstance<TTarget>> {
    return this.#resolveAsync(target, this.#createContext(target)).then(
      (wrapper) => wrapper.value,
    ) as Promise<ResolvedInstance<TTarget>>;
  }

  #resolve(target: Class, context: Context<Class>): unknown {
    // get the class meta
    const meta = WiredMeta.from(target);

    // if the class is a singleton, forward the tap to the singleton circuit
    if (meta.singleton && meta.singleton !== this) {
      return meta.singleton.#resolve(target, context);
    }

    // get the saved instance
    const savedInstance = this.#instances.get(target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance) return this.#resolveInstance(savedInstance, context);

    // if target is async and not initialized, throw an error
    if (meta.async)
      throw new Error(
        `Class(${target.name}) is async and not initialized. Use "tapAsync" instead.`,
      );

    // if target has an async initializer running, throw an error
    if (this.#asyncInitializers.has(target))
      throw new Error(
        `Class(${target.name}) is async and currently initializing. Use "tapAsync" instead.`,
      );

    // if the target not resolved yet and no meta is available, throw an error
    if (!meta.isEnabled())
      throw new Error(`Class(${target.name}) is not wired.`);

    // resolve the inputs
    const inputs = this.#resolveInputs(meta.inputs(), context);

    // initialize the class either with the initializier if available or with the constructor
    const instance = this.#initialize(target, meta, inputs, context);

    // check if the class is async
    if (instance instanceof Promise) {
      // handle the promise and save it to prevent multiple async initializations
      this.#handlePromise(target, instance, context);

      throw new Error(
        `Class(${target.name}) is async and now initializing. Use "tapAsync" instead.`,
      );
    } else {
      // save the instance to prevent multiple initializations
      this.#instances.set(target, instance);

      // resolve and return the instance
      return this.#resolveInstance(instance, context);
    }
  }

  #resolveAsync(
    target: Class,
    context: Context<Class>,
  ): Promise<Wrapped<unknown>> {
    // get the class meta
    const meta = WiredMeta.from(target);

    // if the class is a singleton, forward the tap to the singleton circuit
    if (meta.singleton && meta.singleton !== this) {
      return meta.singleton.#resolveAsync(target, context);
    }

    // get the saved instance
    const savedInstance = this.#instances.get(target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance)
      return this.#resolveInstanceAsync(savedInstance, context);

    const asyncInitializer = this.#asyncInitializers.get(target);

    // if there is an async initializer, return the promise with the resolved instance
    if (asyncInitializer)
      return asyncInitializer.then((result: unknown) =>
        this.#resolveInstanceAsync(result, context),
      );

    // if the target not resolved yet and no meta is available, throw an error
    if (!meta.isEnabled())
      throw new Error(`Class(${target.name}) is not wired.`);

    // resolve the inputs and initialize the class, with either the initializer or the constructor
    const initializer = this.#resolveInputsAsync(meta.inputs(), context).then(
      (inputs) => this.#initialize(target, meta, inputs, context),
    );

    // handle the promise and save it to prevent multiple async initializations
    // and return the promise
    return this.#handlePromise(target, initializer, context);
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
    target: TTarget,
    instance: InstanceType<TTarget>,
  ): InstanceType<TTarget> {
    // if the class is already initialized, throw an error
    if (this.#instances.has(target))
      throw new Error(`Class(${target.name}) is already initialized.`);

    // save the instance
    this.#instances.set(target, instance);

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
    return this.#instances.has(Target);
  }

  #initialize(
    target: Class,
    meta: WiredMeta,
    inputs: unknown[],
    context: Context<Class>,
  ): unknown {
    return meta.init
      ? meta.init(inputs, context)
      : Reflect.construct(target, inputs);
  }

  #handlePromise(
    target: Class,
    initializer: Promise<unknown>,
    context: Context<Class>,
  ): Promise<Wrapped<unknown>> {
    const newInitializer = initializer
      .then((instance) => {
        if (this.#instances.has(target))
          throw new Error(`Class(${target.name}) is already initialized.`);
        this.#instances.set(target, instance);
        return this.#resolveInstanceAsync(instance, context);
      })
      .finally(() => {
        this.#asyncInitializers.delete(target);
      });

    this.#asyncInitializers.set(target, initializer);

    return newInitializer;
  }

  #createContext(target: Class, dependent?: Class): Context<Class> {
    return { circuit: this, target, dependent };
  }

  #resolveInputs(inputs: Class[], context: Context<Class>): unknown[] {
    return inputs.map((input) =>
      this.#resolve(input, this.#createContext(input, context.target)),
    );
  }

  async #resolveInputsAsync(
    inputs: Class[],
    context: Context<Class>,
  ): Promise<unknown[]> {
    return Promise.all(
      inputs.map((input) =>
        this.#resolveAsync(input, this.#createContext(input, context.target)),
      ),
    ).then((resolved) => resolved.map((input) => input.value));
  }

  #resolveInstance(instance: unknown, context: Context<Class>): unknown {
    const providerInfo = this.#resolveProviderInfo(instance, context);
    if (!providerInfo) return instance;

    if (providerInfo.async)
      throw new Error(
        `Class("${context.target.name}") is a async provider and cannot be used in sync tap.`,
      );

    return providerInfo.getValue(context);
  }

  async #resolveInstanceAsync(
    instance: unknown,
    context: Context<Class>,
  ): Promise<Wrapped<unknown>> {
    const providerInfo = this.#resolveProviderInfo(instance, context);
    if (!providerInfo) return { value: instance };

    if (providerInfo.async) {
      return { value: await providerInfo.getValue(context) };
    } else {
      return { value: providerInfo.getValue(context) };
    }
  }

  #resolveProviderInfo(
    instance: unknown,
    context: Context<Class>,
  ): ProviderInfo<unknown> | null {
    if (typeof instance !== "object" || instance === null)
      throw new Error(
        `Class("${context.target.name}") provided invalid instance.`,
      );

    // if instance is not a provider, return null
    if (!(provide in instance)) return null;

    // if provider info is not a function, throw error
    if (typeof instance[provide] !== "function")
      throw new Error(
        `Class("${context.target.name}") has invalid provide info.`,
      );

    return instance[provide]();
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
