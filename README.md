# effect-builder

A type-safe, immutable builder pattern implementation using Effect. It enables developers to construct complex objects with runtime validation while maintaining compile-time type safety.

## Specification-Driven Development

This project follows a specification-driven development approach:

- [specs/SPEC.md](./specs/SPEC.md): Core specifications and features

  - Package goals and objectives
  - Type-safe transformations
  - Builder pattern implementation
  - Error handling patterns
  - Testing requirements

- [specs/ai/CODINGSTYLE.AI.md](./specs/ai/CODINGSTYLE.AI.md): AI development guidelines
  - Type safety implementation
  - Schema-based validation
  - Immutable transformations
  - Error handling patterns
  - Code generation examples

These specifications serve as the source of truth for both human developers and AI assistants, ensuring consistent and high-quality code generation.

## Quick Start

```typescript
import { Schema, Effect, pipe } from "effect";
import * as Builder from "effect-builder";

// Define your schema
const UserSchema = Schema.struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.optional(Schema.String),
});

// Create a builder
const User = Builder.define(UserSchema);

// Build an object with type-safe transformations
const program = Effect.gen(function* () {
  const user = yield* pipe(
    {},
    User.field("name")("John"),
    User.field("age")(30),
    User.when(
      (age: number) => age >= 18,
      User.field("email")("john@example.com")
    ),
    User.build
  );
  // user: { name: string; age: number; email: string | undefined }
});

// Run the program
Effect.runPromise(program);
```

## Features

- Type-safe field transformations using Effect's Schema system
- Immutable builder pattern with composable operations
- Curried functions for better composition
- Runtime validation with comprehensive error handling
- Support for conditional transformations
- Full TypeScript support with type inference

## Installation

```bash
npm install effect-builder
```

## Example Usage

```typescript
import { Schema, Effect, pipe } from "effect";
import * as Builder from "effect-builder";

// Define a complex schema
const MessageSchema = Schema.struct({
  type: Schema.union(Schema.Literal("text"), Schema.Literal("flex")),
  content: Schema.String,
  options: Schema.optional(
    Schema.Struct({
      color: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    })
  ),
});

// Create a builder with defaults
const Message = Builder.define(MessageSchema, {
  type: "text",
  content: "",
});

// Build with type-safe transformations
const program = Effect.gen(function* () {
  const message = yield* pipe(
    {},
    Message.field("type")("flex"),
    Message.field("content")("Hello"),
    Message.when(
      (type: "text" | "flex") => type === "flex",
      Message.field("options")({
        color: "red",
        size: 14,
      })
    ),
    Builder.build
  );
  // message is fully typed and validated
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## Documentation

For detailed documentation and best practices, refer to our specification files:

- [Core Specifications](./specs/SPEC.md)
- [AI Development Guidelines](./specs/ai/CODINGSTYLE.AI.md)

## License

MIT - See [LICENSE](./LICENSE) for details
