/**
 * A helper class to store metadata on an object.
 */
export class Meta<TValue extends Record<string, unknown>> {
  /**
   * The symbol used to store the metadata object on the target.
   */
  static metaSymbol = Symbol("meta");

  /**
   * The target on which the metadata object is stored.
   */
  readonly target: object;

  constructor(target: object) {
    this.target = target;
  }

  /**
   * Get the value of the metadata object.
   */
  get value(): TValue | undefined {
    return Reflect.get(this.target, Meta.metaSymbol);
  }

  /**
   * Set the value of the metadata object.
   */
  set value(value: TValue) {
    Reflect.defineProperty(this.target, Meta.metaSymbol, {
      writable: false,
      enumerable: false,
      configurable: true,
      value,
    });
  }

  /**
   * Delete the entire metadata object, so the target is clean.
   */
  delete() {
    Reflect.deleteProperty(this.target, Meta.metaSymbol);
  }

  /**
   * Check whether the metadata object exists on the target.
   *
   * @returns true if the metadata object exists, false otherwise.
   */
  has(): boolean {
    return Reflect.has(this.target, Meta.metaSymbol);
  }

  /**
   * Shorthand for getting the metadata object from the target.
   *
   * This is a shortcut for:
   *
   * ```ts
   * new Meta<TMeta>(target).value;
   * ```
   *
   * @param target The target to get the metadata object from.
   * @returns The metadata object.
   */
  static get<TMeta extends Record<string, unknown>>(
    target: object,
  ): TMeta | undefined {
    return Meta.of<TMeta>(target).value;
  }

  /**
   * Shorthand for setting the metadata object on the target.
   *
   * This is a shortcut for:
   *
   * ```ts
   * new Meta<TValue>(target).value = value;
   * ```
   *
   * @param target The target to set the metadata object on.
   * @param value The value to set.
   * @returns The meta instance.
   */
  static set<TValue extends Record<string, unknown>>(
    target: object,
    value: TValue,
  ): Meta<TValue> {
    const meta = Meta.of<TValue>(target);
    meta.value = value;
    return meta;
  }

  /**
   * Shorthand for creating a new Meta instance.
   *
   * This is a shortcut for:
   *
   * ```ts
   * new Meta<TValue>(target);
   * ```
   *
   * @param target The target to create the Meta instance for.
   * @returns The Meta instance.
   */
  static of<TValue extends Record<string, unknown>>(
    target: object,
  ): Meta<TValue> {
    return new Meta<TValue>(target);
  }
}
