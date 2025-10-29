import type { Class } from "./types";

export class WireboxError extends Error {}

export class UnwiredError extends WireboxError {
  target: Class;

  constructor(target: Class) {
    super(`Class(${target.name}) is not set up for wiring.`);
    this.target = target;
  }
}

export class AsyncDependencyError extends WireboxError {
  target: Class;

  constructor(target: Class, initializing: boolean) {
    super(
      `Class(${target.name}) is async and ${initializing ? "currently initializing" : "not initialized yet"}. Use "tapAsync" instead.`,
    );
    this.target = target;
  }
}

export class NoCircuitLinkError extends WireboxError {
  target: Class;

  constructor(target: Class) {
    super(
      `Class(${target.name}) cannot be instantiated because the Circuit cannot be determined. Make sure you are calling "link" inside a sync constructor of a wired class.`,
    );
    this.target = target;
  }
}
