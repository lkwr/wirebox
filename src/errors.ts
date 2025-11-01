import type { Class } from "./types";

/**
 * The base class for all Wirebox errors.
 */
export class WireboxError extends Error {}

/**
 * Thrown when a class is not set up for wiring.
 */
export class UnwiredError extends WireboxError {
  readonly target: Class;

  /**
   * @param target The target class.
   */
  constructor(target: Class) {
    super(`Class(${target.name}) is not set up for wiring.`);
    this.target = target;
  }
}

/**
 * Thrown when a class is already initialized.
 */
export class AlreadyInitializedError extends WireboxError {
  readonly target: Class;

  /**
   * @param target The target class.
   */
  constructor(target: Class) {
    super(`Class(${target.name}) is already initialized.`);
    this.target = target;
  }
}

/**
 * Thrown when an async dependency is used in a sync context.
 */
export class AsyncDependencyError extends WireboxError {
  readonly target: Class;

  /**
   * @param target The target class.
   * @param initializing Whether the class is currently initializing.
   */
  constructor(target: Class, initializing: boolean) {
    super(
      `Class(${target.name}) is async and ${initializing ? "currently initializing" : "not initialized yet"}. Use "tapAsync" instead.`,
    );
    this.target = target;
  }
}

/**
 * Thrown when the {@link link} function is called outside of a wired contructor.
 */
export class NoCircuitLinkError extends WireboxError {
  readonly target: Class;

  /**
   * @param target The target class.
   */
  constructor(target: Class) {
    super(
      `Class(${target.name}) cannot be instantiated because the Circuit cannot be determined. Make sure you are calling "link" inside a sync constructor of a wired class.`,
    );
    this.target = target;
  }
}

/**
 * Thrown when a class with an {@link provide} implementation is not a valid {@link Providable}.
 */
export class InvalidProvidableError extends WireboxError {
  readonly target: Class;

  /**
   * @param target The target class.
   */
  constructor(target: Class) {
    super(`Class(${target.name}) is not a valid Providable.`);
    this.target = target;
  }
}
