export { Circuit, tap, tapAsync } from "./circuit.ts";

export { wired } from "./wire/decorator.ts";
export { wire, isWired, unwire } from "./wire/wire.ts";

export type {
  Class,
  Context,
  InitFn,
  InputFn,
  ResolvedInstance,
  ResolvedInstances,
} from "./types.ts";
