import { Circuit, createProvider, tap } from "./src";

const X = createProvider<Circuit>(({ circuit }) => circuit);

const x = tap(X);

console.log(x);
