import { WireDefinition } from "./definition/definition.ts";
import {
  AlreadyInitializedError,
  AsyncDependencyError,
  InvalidProvidableError,
  NoCircuitContextError,
  UnwiredError,
} from "./errors.ts";
import {
  type Providable,
  type ProviderInfo,
  provide,
} from "./provider/provider.ts";
import type { Class, Context, ResolvedInstance, Wrapped } from "./types.ts";

let currentContext: Context | null = null;

/**
 * A circuit is a container which is responsible for managing the instances by holding and initializing them.
 *
 * Only one instance of a class can exist in a circuit.
 *
 * @category Core
 */
export class Circuit {
  /**
   * The default circuit.
   */
  static readonly #default = new Circuit();

  readonly #instances = new WeakMap<Class, InstanceType<Class>>();
  readonly #asyncInitializers = new WeakMap<
    Class,
    Promise<InstanceType<Class>>
  >();

  constructor() {
    // install this circuit instance in the circuit itself
    // after that it is possible to use the circuit class as an input.
    this.install(Circuit, this);
  }

  tap<TTarget extends Class>(target: TTarget): ResolvedInstance<TTarget> {
    const ctx = this.#createContext(target);
    const instance = this.#resolve(target, ctx);
    return this.#resolveInstance(instance, ctx) as ResolvedInstance<TTarget>;
  }

  async tapAsync<TTarget extends Class>(
    target: TTarget,
  ): Promise<ResolvedInstance<TTarget>> {
    const ctx = this.#createContext(target);
    const instance = await this.#resolveAsync(target, ctx);
    return this.#resolveInstanceAsync(instance, ctx).then(
      (wrapper) => wrapper.value,
    ) as Promise<ResolvedInstance<TTarget>>;
  }

  #resolve(target: Class, context: Context<Class>): unknown {
    // get the saved instance
    const savedInstance = this.#instances.get(target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance) return savedInstance;

    // get the class definition
    const definition = WireDefinition.from(target);

    // if the target not resolved yet and no valid definition is available, throw an error
    if (!definition || !definition.isValid()) throw new UnwiredError(target);

    // if the class is a singleton, forward the tap to the singleton circuit
    if (definition.singleton && definition.singleton !== this)
      return definition.singleton.#resolve(target, context);

    // if target has an async initializer running, throw an error
    if (this.#asyncInitializers.has(target))
      throw new AsyncDependencyError(target, true);

    // if target has an async preconstruct, throw an error
    if (definition.preconstructAsync)
      throw new AsyncDependencyError(target, false);

    // if target has setup, throw an error
    if (definition.setup) throw new AsyncDependencyError(target, false);

    // resolve the inputs
    const inputs = this.#resolveDependencies(
      definition.dependencies?.() ?? [],
      context,
    );

    // initialize the class either with the preconstruct if available or with the constructor
    const instance = this.#runWithContext(
      () =>
        definition.preconstruct
          ? definition.preconstruct(inputs, context)
          : Reflect.construct(target, inputs),
      context,
    );

    // save the instance to prevent multiple initializations
    this.#instances.set(target, instance);

    // resolve and return the instance
    return instance;
  }

  #resolveAsync(target: Class, context: Context<Class>): Promise<unknown> {
    // get the saved instance
    const savedInstance = this.#instances.get(target);

    // if target has an initialized instance, resolve and return it
    if (savedInstance) return savedInstance;

    // get the async initializer if already running
    const asyncInitializer = this.#asyncInitializers.get(target);

    // if there is an async initializer, return the promise with the resolved instance
    if (asyncInitializer) return asyncInitializer;

    // get the class definition
    const definition = WireDefinition.from(target);

    // if the target not resolved yet and no valid definition is available, throw an error
    if (!definition || !definition.isValid()) throw new UnwiredError(target);

    // if the class is a singleton, forward the tap to the singleton circuit
    if (definition.singleton && definition.singleton !== this)
      return definition.singleton.#resolveAsync(target, context);

    // resolve the inputs and initialize the class, with either the initializer or the constructor
    const initializer = this.#resolveDependenciesAsync(
      definition.dependencies?.() ?? [],
      definition.preloads?.() ?? [],
      context,
    ).then(async (inputs) => {
      const instancePromise = this.#runWithContext(
        () =>
          // use preconstructAsync if available
          definition.preconstructAsync
            ? definition.preconstructAsync(inputs, context)
            : // then use preconstruct if available
              definition.preconstruct
              ? definition.preconstruct(inputs, context)
              : // otherwise use the constructor
                Reflect.construct(target, inputs),
        context,
      );

      const instance = await instancePromise;

      // if there is no setup, return the instance directly
      if (!definition.setup) return instance;

      // run the setup
      let setupPromise = definition.setup.bind(instance)();

      // if the setup result is a function, call it to get the actual promise
      if (typeof setupPromise === "function") {
        setupPromise = setupPromise.bind(instance)();
      }

      // wait for the setup to finish
      await setupPromise;

      return instance;
    });

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
   * @param target The class of the instance to install.
   * @param instance The instance to install.
   * @returns The instance that was installed.
   */
  install<TTarget extends Class>(
    target: TTarget,
    instance: InstanceType<TTarget>,
  ): InstanceType<TTarget> {
    // if the class is already initialized, throw an error
    if (this.#instances.has(target)) throw new AlreadyInitializedError(target);

    // save the instance
    this.#instances.set(target, instance);

    // return the instance
    return instance;
  }

  /**
   * Uninstalling means to manually remove an instance from the circuit.
   *
   * This method should be used with caution!
   *
   * @param target The class of the instance to uninstall.
   * @returns The instance that was uninstalled, or undefined if not found.
   */
  uninstall<TTarget extends Class>(
    target: TTarget,
  ): InstanceType<TTarget> | undefined {
    // try to get the instance
    const instance = this.#instances.get(target);

    // if no instance was found, return undefined
    if (!instance) return undefined;

    // remove the instance from the circuit
    this.#instances.delete(target);

    // return the deleted instance
    return instance;
  }

  /**
   * Check if the given class is installed (initialized) in this circuit.
   *
   * @param target The class to check.
   * @returns True if the class is installed (initialized), false otherwise.
   */
  isInstalled(target: Class): boolean {
    return this.#instances.has(target);
  }

  /**
   * Get the instance of the given class.
   *
   * NOTICE: This method is a low-level operation as it does not instantiate classes or resolve providable classes. Use it with caution.
   *
   * @param target The class to get the instance for.
   * @returns The instance of the class, or undefined if not found.
   */
  get<TTarget extends Class>(
    target: Class,
  ): ResolvedInstance<TTarget> | undefined {
    return this.#instances.get(target);
  }

  /**
   * Check if the given class has async initializer
   * or provides an async value.
   *
   * Classes without an async initializer will be instantiated
   * if not yet initialized in the circuit. This is necessary to
   * receive possible provider info.
   *
   * @param target The class to check.
   * @returns True if the class has async initializer or provides an async value, false otherwise.
   */
  isAsync(target: Class): boolean {
    const definition = WireDefinition.from(target);

    // if no definition is available, return false
    if (!definition) return false;

    // if target has async preconstruct, return true
    if (definition.preconstructAsync) return true;

    // if target has setup, return true
    if (definition.setup) return true;

    const ctx = this.#createContext(target);

    // we need to instantiate the class here
    // to get the provider info
    const instance = this.#resolve(target, ctx);

    // get the provider info
    const providerInfo = this.#resolveProviderInfo(instance, ctx);

    // if there is no provider info, return false
    if (!providerInfo) return false;

    // return the async flag from the provider info
    return providerInfo.async ?? false;
  }

  #runWithContext<T>(fn: () => T, context: Context): T {
    const previousContext = currentContext;

    try {
      currentContext = context;
      return fn();
    } finally {
      currentContext = previousContext;
    }
  }

  #handlePromise(
    target: Class,
    initializer: Promise<unknown>,
    context: Context,
  ): Promise<unknown> {
    const wrapped = initializer
      .then((result) => {
        if (this.#instances.has(target))
          throw new AlreadyInitializedError(target);

        const instance =
          typeof result === "function"
            ? this.#runWithContext(() => result(), context)
            : result;

        this.#instances.set(target, instance);
        return instance;
      })
      .finally(() => {
        this.#asyncInitializers.delete(target);
      });
    this.#asyncInitializers.set(target, wrapped);
    return wrapped;
  }

  #createContext(target: Class, dependent?: Class): Context {
    return { circuit: this, target, dependent };
  }

  #resolveDependencies(inputs: readonly Class[], context: Context): unknown[] {
    return inputs.map((input) => {
      const ctx = this.#createContext(input, context.target);
      const instance = this.#resolve(input, ctx);
      return this.#resolveInstance(instance, ctx);
    });
  }

  async #resolveDependenciesAsync(
    dependencies: readonly Class[],
    preloads: readonly Class[],
    context: Context<Class>,
  ): Promise<unknown[]> {
    const [result] = await Promise.all([
      Promise.all(
        dependencies.map(async (dependency) => {
          const ctx = this.#createContext(dependency, context.target);
          const instance = await this.#resolveAsync(dependency, ctx);
          const wrapped = await this.#resolveInstanceAsync(instance, ctx);
          return wrapped.value;
        }),
      ),
      Promise.all(
        preloads.map(async (preload) => {
          const ctx = this.#createContext(preload, context.target);
          const instance = await this.#resolveAsync(preload, ctx);
          const wrapped = await this.#resolveInstanceAsync(instance, ctx);
          return wrapped.value;
        }),
      ),
    ]);

    return result;
  }

  #resolveInstance(instance: unknown, context: Context<Class>): unknown {
    const providerInfo = this.#resolveProviderInfo(instance, context);
    if (!providerInfo) return instance;

    if (providerInfo.async)
      throw new AsyncDependencyError(context.target, false);

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
      throw new InvalidProvidableError(context.target);

    // if instance is not a provider, return null
    if (!(provide in instance)) return null;

    // if provider info is not a function, throw error
    if (typeof instance[provide] !== "object")
      throw new InvalidProvidableError(context.target);

    return (instance as Providable)[provide];
  }

  public static getDefault(): Circuit {
    return Circuit.#default;
  }
}

/**
 * @category Core
 */
export const tap = <TTarget extends Class>(
  target: TTarget,
  circuit: Circuit = Circuit.getDefault(),
): ResolvedInstance<TTarget> => {
  return circuit.tap(target);
};

/**
 * @category Core
 */
export const tapAsync = <TTarget extends Class>(
  target: TTarget,
  circuit: Circuit = Circuit.getDefault(),
): Promise<ResolvedInstance<TTarget>> => {
  return circuit.tapAsync(target);
};

/**
 * @category Core
 */
export const getContext = (): Context => {
  const context = currentContext;
  if (!context) throw new NoCircuitContextError();
  return context;
};

/**
 * @category Core
 */
export const getCircuit = (): Circuit => {
  return getContext().circuit;
};

/**
 * @category Core
 */
export const link = <T extends Class>(target: T): ResolvedInstance<T> => {
  return getCircuit().tap(target);
};
