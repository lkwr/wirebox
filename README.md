# WireBox

A simple but flexible dependency injection library for TypeScript and JavaScript.

## 🚀 Features

- **Simple API**: Easy-to-use and straightforward API.
- **Isolated Scopes**: Class instances can be isolated into their own "scopes".
- **Type-Safe**: Fully utilizes TypeScript's strong typing system.
- **Async Support**: Write async class initializers.
- **Providers**: Utility to inject non-class values (even async ones).
- **Decorators**: Use optional type-safe TC39 decorators to simplify your code.

## 📦 Installation

Install the package using your favorite package manager:

```sh
npm install wirebox
```

## 🚀 How to use

Here is a basic example of how to use WireBox, for more detailed examples, please refer to the [auto-generated documentation](https://wirebox.pages.dev) or see the [examples](https://github.com/lkwr/wirebox/tree/main/examples) directory.

### 1. Wiring classes

First of all, you need to configure how Wirebox should handle your classes. We will call this step "wiring". Classes which are not wired can not be used with Wirebox.

To wire your classes, you can use decorators or manual function calls. Both types of decorators are supported ([TC39 stage 3 decorators proposal](https://github.com/tc39/proposal-decorators) and [legacy decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)) because we only rely on the first argument of the decorator, the class itself. But decorators are typed the new stage 3 proposal way.

#### Wiring options

##### Standalone

The simplest way to wire a class is to use the `@standalone` decorator. This decorator defines the class as standalone, which means the class constructor does not expect any argument at all.

For example:

```ts
import { standalone } from "wirebox";

@standalone()
class Logger {
  log(message: string) {
    console.log(message);
  }
}
```

The `@standalone` does not take any arguments.

##### Requires

The `@requires` decorator is used to define the dependencies of a class. For example the `Database` class requires the `Logger` class to work properly.

```ts
import { requires } from "wirebox";

@requires(() => [Logger])
class Database {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async connect(): Promise<void> {
    this.#logger.log("Connecting to database...");

    // some logic here

    this.#logger.log("Database connected!");
  }
}
```

The `@requires` decorator takes a function which returns the list of dependencies. The reason why it uses a function is because with this approach, we eliminate circular dependencies issues and the dependency class does not need to be declared at the dependent class declaration.

By returning an empty dependency list, it will function the same way as the `@standalone` decorator.

##### Preconstruct

The `@preconstruct` decorator is a more advanced decorator which allows you to define some logic before the class constructor is called. This is powerful when used on an abstract class. To understand why, let's take a look at this logger example:

```ts
import { preconstruct } from "wirebox";

// some external configuration
const useConsoleLogger = true;

@preconstruct(() => useConsoleLogger ? new ConsoleLogger() : new FileLogger())
abstract class Logger {
  abstract log(message: string): void;
}

class ConsoleLogger extends Logger {
  log(message: string): void {
    console.log(message);
  }
}

class FileLogger extends Logger {
  log(message: string): void {
    // some file write logic here
  }
}
```

Because `ConsoleLogger` and `FileLogger` extends the `Logger` class (`implements Logger` will also work), we can use the `@preconstruct` decorator to create an instance of either class. So we only need to define `Logger` as our dependency and the preconstrcut will take care of which class to instantiate.

Dependencies can be optionally defined as the second argument and will be available in the preconstruct function as first argument.

```ts
import { preconstruct } from "wirebox";

@standalone()
class Config {
  useConsoleLogger: boolean;

  constructor() {
    this.useConsoleLogger = true;
  }
}

@preconstruct(
  ([config]) => config.useConsoleLogger ? new ConsoleLogger() : new FileLogger(),
  () => [Config]
)
abstract class Logger {
  abstract log(message: string): void;
}

// ...
```

##### Preconstruct Async

The `@preconstructAsync` decorator is almost identical to the `@preconstruct` decorator, but it allows you to define async preconstruct logic, which can also be powerful in some cases. For example, you can use it on an `Database` class to create a database connection before the class is instantiated:

```ts
import { preconstructAsync } from "wirebox";

@preconstructAsync(async () => {
  const connection = await connectToDatabase(/* ... */);
  return () => new Database(connection);
})
class Database {
  constructor(private connection: Connection) {}

  async query(query: Query): Promise<Result> {
    // use the connection here
  }
}
```

And of course, the `@preconstructAsync` decorator can also be used with dependencies as the second argument the same way as the `@preconstruct` decorator.

**Note:** The async preconstruct function returns a `Promise<() => InstanceType<T>>` and not `Promise<InstanceType<T>>` where `T` is the class being preconstructed. This is because the construction of the class needs to be done synchronously inside wirebox, so we are able to attach some additional context information to the class construction. Without this, the `link` utility would not be working properly. But this is only necessary for the async preconstruct and not the normal preconstruct because the normal preconstruct function is already synchronous. For more information, see the `link` utility.

##### Usage without decorators

If your runtime does not support decorators or you don't want to use them for some reason, there are alternative functions which does exactly the same, but are so convenient as decorators.

```ts
class MyClass {}

// @standalone equivalent
setStandalone(MyClass);

// @requires equivalent
setRequires(MyClass, () => [MyDpenendency]);

// @preconstruct equivalent
setPreconstruct(MyClass, ([dep1]) => new MyClass(dep1), () => [MyDependency]);

// @preconstructAsync equivalent
setPreconstructAsync(MyClass, async ([dep1]) => new MyClass(dep1), () => [MyDependency]);
```

Every decorator alternative function takes exactly the same arguments as the decorators, expect for the additional first target (class) argument. The naming is the same as the decorators but with the `@` replaced by `set` (and camelCased).

**Note:** These functions should only called once and directly after the class declaration, otherwise they may not work as expected.

#### Additional options

The four decorators above can only be used once per class and you can not mix them! So using two of them at the same class will not work and also makes no sense.

But there is currently one additional decorator which can be combined with any of the above decorators. It is the `@singleton` decorator.

```ts
import { standalone } from "wirebox";

@standalone()
@singleton()
class Logger {
  log(message: string) {
    console.log(message);
  }
}
```

The `@singleton` decorator is used to make a class a singleton. A singleton class is a class where only one instance of this class can exist in the whole application. This is useful for classes which are expensive to create and should only be created once or classes which are unnecessary to create multiple times, for example a database connection (expensive) or a logger (unnecessary).

This decorator takes an optional `Circuit` as the first argument, which specifies which Circuit will be responsible to create the singleton instance. If no Circuit is specified, the default Circuit will be used (`Circuit.getDefault()`). Circuits will be explained in the next section.

Also, there is a `setSingleton` function which can be used without decorators.

### 2. Tapping classes

Obtaining a class instance of a wired class is called "tapping" and done via a `tap` function.

Instead of using the `new` operator, a wired class can be instantiated using the `tap` function.

```ts
import { tap } from "wirebox";
import { Logger } from "./logger.ts";

// Get an instance of the Logger class
const logger = tap(Logger); // The Logger class have to be wired!

console.log(logger instanceof Logger); // true
```

The `tap` function will return the instance of the class, or throw an error if the class is not wired.

#### Async tapping

You may remember that there is a `@preconstructAsync` decorator which allows you to define async preconstructors. Tapping a class with an async part (like `@preconstrcutAsync`) will not work using the syncronous `tap` function. Instead, you need to use the `tapAsync` function which returns a `Promise` which resolves with the instance of the class. Of course, `tapAsync` can also be used on classes without async parts but you have to still `await` them. If you don't know if the requesting class has async parts (including dependencies), you are always safe using `tapAsync`.

#### Circuits

Circuits are the part of Wirebox which are responsible for managing the instances of wired classes. Inside a circuit, there can only be one instance of a class. To explain this, let's take a look at the following example:

```ts
import { Circuit, standalone } from "wirebox";
import { Logger } from "./logger.ts";


// Create a new empty circuit (no instances inside yet)
const myCircuit = new Circuit();

// Tap the Logger class inside the newly created circuit
// This will create an instance of the Logger class and save it inside the circuit
const myLogger = myCircuit.tap(Logger);

console.log(myLogger instanceof Logger); // true

// Try to tap the Logger class with the same circuit again will result in exactly the same instance
const myOtherLogger = myCircuit.tap(Logger);

console.log(myOtherLogger instanceof Logger); // true
console.log(myLogger === myOtherLogger); // true
```

So, when a instance of a class is already initialized inside a circuit, tapping the class will return the same instance. If you want a new instance, you need to create a new circuit.

#### The default circuit

There is a default circuit which is used for `singleton` classes (which does not specify a different circuit, see `@singleton` above) and the top-level `tap` and `tapAsync` functions.

The top-level `tap` and `tapAsync` functions are just shortcuts for the default circuit:

```ts
// a simplified implementation of the "tap" and "tapAsync" functions
const tap = (target: Class) => Circuit.getDefault().tap(target);
const tapAsync = (target: Class) => Circuit.getDefault().tapAsync(target);
```


## 🔧 Advanced usage

### Providers

Providers are a way to use arbitrary values as the tap result instead of the class instance. For example:

```ts
import { tap, createProvider } from "wirebox";

const HelloProvider = createProvider(() => "Hello World!");

const myValue = tap(HelloProvider); // also works as a @requires, @preconstruct, etc. dependency

console.log(myValue); // "Hello World!"
```

TODO more information


### Utilities

#### Combine

#### Lazy

#### With Circuit

## 📖 Glossary

### Circuit

A circuit is a container which is responsible for managing the instances by holding and initializing them. Each circuit can only store one instance of a class. So if you want to have multiple instances of the same class, simply create a new circuit for it. You can create as many circuits as you want by simply calling `new Circuit()`.

There is also the default circuit which can be accessed via `Circuit.getDefault()`.

### tap / tapAsync

Tapping a class simply means to resolve the class instance and return it. If the class is not yet initialized, it will be initialized and returned.

Remember for classes with async parts (like `@preconstructAsync`, or dependencies with async parts), you should use `tapAsync`.

## 🧪 Testing

To run tests, install the development dependencies and run the test command:

```sh
bun install
bun test
```

## 🌟 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request.

We use prettier to format the code, so please make sure to run `bun run format` before committing.

## 📄 License

This project is licensed under the [MIT License](https://github.com/lkwr/wirebox/tree/main/LICENSE).
