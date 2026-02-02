import type { Circuit } from "../circuit.ts";
import type { Class, Context } from "../types.ts";

const REGISTRY = new WeakMap<Class, WireDefinition>();

/**
 * @category Definition
 */
export class WireDefinition {
  readonly target: Class;

  private constructor(target: Class) {
    if (REGISTRY.has(target))
      throw new Error("WireDefinition for this target already exists.");

    REGISTRY.set(target, this);
    this.target = target;
  }

  singleton?: Circuit;
  dependencies?: () => readonly Class[];
  preloads?: () => readonly Class[];
  preconstructAsync?: (
    dependencies: readonly unknown[],
    context: Context,
  ) => Promise<() => unknown>;
  preconstruct?: (
    dependencies: readonly unknown[],
    context: Context,
  ) => unknown;
  setup?: (() => void | Promise<void>) | (() => () => void | Promise<void>);

  remove(): boolean {
    return REGISTRY.delete(this.target);
  }

  static from(
    target: Class,
    createIfNotExists?: false,
  ): WireDefinition | undefined;
  static from(target: Class, createIfNotExists: true): WireDefinition;

  static from(
    target: Class,
    createIfNotExists = false,
  ): WireDefinition | undefined {
    return (
      REGISTRY.get(target) ??
      (createIfNotExists ? new WireDefinition(target) : undefined)
    );
  }

  static set(
    target: Class,
    options: Partial<WireDefinition> = {},
  ): WireDefinition {
    const definition = WireDefinition.from(target, true);

    if (options.dependencies) definition.dependencies = options.dependencies;
    if (options.preloads) definition.preloads = options.preloads;
    if (options.preconstructAsync)
      definition.preconstructAsync = options.preconstructAsync;
    if (options.preconstruct) definition.preconstruct = options.preconstruct;
    if (options.setup) definition.setup = options.setup;
    if (options.singleton) definition.singleton = options.singleton;

    return definition;
  }
}
