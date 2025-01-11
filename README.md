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

## 🔧 Quick Start

Here is a basic example of how to use WireBox, for more detailed examples, please refer to the [examples](https://github.com/lkwr/wirebox/tree/main/examples) directory.

### Wire up classes (declaration)

```ts
import { wire } from "wirebox";

class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

wire(LoggerService);
```

or using the decorator syntax:

```ts
import { wired } from "wirebox";

@wired()
class LoggerService {
  log(message: string) {
    console.log(message);
  }
}
```

### Wire up inputs (dependency injection)

```ts
import { LoggerService } from "./logger.ts";

// configure your inputs to wire up
@wired(() => [LoggerService])
class Database {
  constructor(private logger: LoggerService) {}

  connect(): Promise<void> {
    this.logger.log("Connecting to database...");

    // some logic here

    this.logger.log("Database connected!");

    return Promise.resolve();
  }
}

// or without the decorator
wire(Database, () => [LoggerService]);
```

### Tapping onto your classes

```ts
import { tap } from "wirebox";

import { Database } from "./database.ts";

const myDatabase = tap(Database);

// "myDatabase" is now your Database instance
// You can call "tap" multiple times and always get the same instance

await myDatabase.connect();
```

## 📖 Glossary

### `Circuit`

A circuit is a container which is responsible for managing the instances by holding and initializing them. Each circuit can maximum have one instance of a class in its store. So if you want to have multiple instances of the same class, simply create a new circuit for it. You can create as many circuits as you want by simply calling `new Circuit()`.

### `tap` / `tapAsync`

Tapping a class simply means to resolve the class instance and return it. If the class is not yet initialized, it will be initialized and returned.

Remember for classes with async initializers, you should use `tapAsync`. The `tap` function will only work if the requested class with all its inputs are already initialized in the circuit.

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
