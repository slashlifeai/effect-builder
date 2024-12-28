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
import { Schema, Effect, pipe } from "effect"
import { compose, define } from "effect-builder"

// Define your schema with defaults
const UserSchema = Schema.Struct({
  name: Schema.String.annotations({ default: "Guest" }),
  age: Schema.Number.pipe(Schema.positive(), Schema.int()),
  roles: Schema.Array(Schema.String).annotations({ default: [] })
})

// Type is inferred from schema:
// type User = {
//   name: string
//   age: number
//   roles: string[]
// }
type User = typeof UserSchema.Type

// Create a builder (defaults are optional as they can come from schema)
const User = define(UserSchema)

// Build a user with transformations
const result = Effect.gen(function* () {
  return yield* pipe(compose(User.name("John")), User.build)
}).pipe(Effect.runSync)

// Handle the result
console.log("Created user:", result)
// {
//   name: "John",
//   age: 30,
//   roles: ["admin"]
// }
```

## Features

- **Type Safety**: Full TypeScript support with inference
- **Schema Validation**: Runtime validation using Effect's Schema
- **Immutable Updates**: All operations produce new states without mutations
- **Effect Integration**: Full support for Effect's error handling and composition

## Schema Defaults

You can specify default values at two levels:

### 1. Schema-Level Defaults

Use `Schema.annotations` to define defaults directly in your schema:

```typescript
const UserSchema = Schema.Struct({
  name: Schema.String.annotations({ default: "Guest" }),
  roles: Schema.Array(Schema.String).annotations({ default: [] })
})
```

### 2. Builder-Level Defaults

Provide defaults when creating the builder:

```typescript
const User = define(UserSchema, {
  name: "Anonymous", // This overrides the schema default
  roles: ["user"]
})
```

Builder defaults take precedence over schema defaults. This gives you flexibility to:

- Define sensible defaults in your schema
- Override them when needed in specific builder instances

## Auto-Generated Lenses

The builder automatically generates type-safe lenses for each field in your schema. These lenses provide a convenient way to access and modify fields while maintaining type safety and immutability.

```typescript
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  roles: Schema.Array(Schema.String)
})

const User = define(UserSchema)

// Simple field access
User.name("John") // Set name to "John"
User.age(25) // Set age to 25

// Complex modifications using .modify
User.roles.modify((roles) => [...roles, "admin"]) // Add "admin" role

// Compose multiple transformations
pipe(
  compose(
    User.name("John"),
    User.age(25),
    User.roles.modify((roles) => [...roles, "admin"])
  ),
  User.build
)
```

Each lens follows the standard lens laws and provides type-safe operations:

- Get the current value
- Set a new value
- Modify the existing value with a function

Read more in the [specs/SPEC.md](./specs/SPEC.md)

## Documentation

For detailed documentation on how to use Effect Builder, please refer to the following resources:
- [Getting Started](./docs/GettingStarted.md): A comprehensive guide to help you set up Effect Builder and start using it effectively.
- [API Documentation](https://slashlifeai.github.io/effect-builder): Detailed information about the API, including available functions, types, and examples of usage.

## Installation

```bash
npm install effect-builder
```

## License

MIT
