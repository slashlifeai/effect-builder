# @effect/builder

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

## Installation

```bash
pnpm add @effect/builder
```

## Quick Start

```typescript
import { Builder, Schema } from "@effect/builder";

// Define your schema
const UserSchema = Schema.struct({
  name: Schema.string,
  age: Schema.number.pipe(Schema.positive(), Schema.int()),
});

// Create and use the builder
const User = Builder.define(UserSchema);
const program = Effect.gen(function* () {
  const user = yield* pipe(
    User.compose(
      User.field("name", "John"),
      User.when((user) => user.age >= 18, User.field("gender", "male"))
    ),
    Builder.build
  );
  return user;
});

const result = Effect.runSync(program);
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
