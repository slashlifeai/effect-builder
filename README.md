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
import { Schema, Effect, pipe, Option } from "effect"
import { compose, define } from "effect-builder"

// Define your schema
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number.pipe(Schema.positive(), Schema.int()),
  roles: Schema.Array(Schema.String)
})

type User = typeof UserSchema.Type

// Create a builder with defaults
const User = define(UserSchema, {
  name: "",
  age: 0,
  roles: [] as string[]
})

// Use auto-generated lenses for field access
const result = pipe(
  compose(
    User.name("John"), // Direct field setter
    User.age(30), // Type-safe field setter
    User.roles.modify(
      // Lens-based modification
      (roles) => [...roles, "admin"]
    )
  ),
  User.build
)

// Result will be:
// {
//   name: "John",
//   age: 30,
//   roles: ["admin"]
// }
```

## Features

### Auto-generated Lenses

The library automatically generates type-safe lenses for each field in your schema. This provides:

- **Direct Field Access**: Use `User.fieldName(value)` for simple field setting
- **Lens Operations**: Each field gets `get`, `set`, and `modify` operations
- **Type Safety**: Full type inference and compile-time checking
- **Immutability**: All operations produce new objects without mutation

Example of lens operations:

```typescript
// Direct field setting
User.name("John")

// Lens-based modification
User.roles.modify((roles) => [...roles, "admin"])

// Composition of multiple operations
compose(
  User.name("John"),
  User.age(30),
  User.roles.modify((roles) => [...roles, "admin"])
)
```

### Type-Safe Field Operations

- **Type-Safe Field Operations**: Use field-specific setters and modifiers with full type inference
- **Composable Transforms**: Combine multiple operations using the `compose` function
- **Conditional Logic**: Apply transforms based on predicates with `when`
- **Default Values**: Initialize builders with sensible defaults through `define`
- **Schema Validation**: Runtime validation using Effect's Schema system
- **Immutable Updates**: All operations produce new states without mutations
- **Effect Integration**: Full support for Effect's error handling and composition

## Installation

```bash
npm install effect-builder
```

## Example Usage

```typescript
import { Schema, Effect, pipe, Option } from "effect"
import { compose, define } from "effect-builder"

// Define a complex schema
const MessageSchema = Schema.Struct({
  type: Schema.Union(Schema.Literal("text"), Schema.Literal("flex")),
  content: Schema.String,
  options: Schema.Option(
    Schema.Struct({
      color: Schema.Option(Schema.String),
      size: Schema.Option(Schema.Number)
    })
  )
})

// Create a builder with defaults
const messageBuilder = define(MessageSchema, {
  type: "text",
  content: "",
  options: Option.none()
})

// Create reusable field operations
const MessageOps = {
  setType: (type: "text" | "flex") => messageBuilder.field("type").set(type),
  setContent: (content: string) => messageBuilder.field("content").set(content),
  setOptions: (options: { color?: string; size?: number }) =>
    messageBuilder.field("options").set(
      Option.some({
        color: Option.fromNullable(options.color),
        size: Option.fromNullable(options.size)
      })
    )
}

// Build with type-safe transformations
const program = Effect.gen(function* () {
  const message = yield* pipe(
    compose(
      MessageOps.setType("flex"),
      MessageOps.setContent("Hello, World!"),
      MessageOps.setOptions({ color: "blue", size: 16 }),
      messageBuilder.when(
        (msg) => msg.type === "flex",
        MessageOps.setOptions({ color: "red" }) // Only applied for flex messages
      )
    ),
    messageBuilder.build
  )

  return message
})

// Handle success and errors
pipe(
  program,
  Effect.tapError((error) => Effect.log(`Error: ${error.message}`)),
  Effect.runPromise
)
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

For detailed documentation and examples, see:

- [Specification](./specs/SPEC.md)
- [Changelog](./CHANGELOG.md)
- [Coding Style](./specs/ai/CODINGSTYLE.AI.md)

## License

MIT - See [LICENSE](./LICENSE) for details
