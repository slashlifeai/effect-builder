# @effect/builder v0.0.1 Specification

@effect/builder is a TypeScript library that provides a type-safe, immutable builder pattern implementation using Effect. It enables developers to construct complex objects with runtime validation while maintaining compile-time type safety.

## Package Goals

1. **Type Safety**: Ensure compile-time type checking for all builder operations
2. **Validation**: Provide runtime validation through Effect's Schema system
3. **Immutability**: Enforce immutable data transformations
4. **Developer Experience**: Offer a simple, intuitive API for building complex objects
5. **Error Handling**: Leverage Effect's error handling capabilities

## Core Concepts

### Transform

Basic transformation unit:

```typescript
type Transform<A> = (a: Partial<A>) => Partial<A>;
```

### Builder Factory

Factory for creating Builder values from Schema:

```typescript
const define = <A>(
  schema: Schema<A>,
  defaults?: Partial<A>
) => ({
  field: <K extends keyof A>(key: K) => (value: A[K]): Transform<A>,
  when: (predicate: (a: Partial<A>) => boolean, transform: Transform<A>): Transform<A>,
  compose: (...transforms: Transform<A>[]): Transform<A>
})
```

Example usage:

```typescript
const UserSchema = Schema.struct({
  name: Schema.string,
  age: Schema.number,
  roles: Schema.array(Schema.string)
})

const program = Effect.gen(function* () {
  const builder = define(UserSchema)
  const result = yield* pipe(
    {},
    builder.field("name")("John"),
    builder.field("age")(30),
    builder.when(
      (age: number) => age >= 18,
      builder.field("roles")(["adult"])
    )
  )
})
```

### Builder

Global function for final construction:

```typescript
const Builder = {
  build: <A>(transform: Transform<A>) => Effect<A, BuilderError>,
};
```

### Error Types

```typescript
export class ValidationError extends Data.TaggedError<{
  readonly _tag: "ValidationError";
  readonly schema: ParseError;
}> {}

export type BuilderError = ValidationError;
```

## Features

1. **Immutable Transformations**

   - All operations return new values
   - Smart object creation to avoid unnecessary copying

2. **Type-safe Field Operations**

   - Type-safe field operations generated from Schema
   - Complete type inference

3. **Composition**

   - Compose multiple transformations
   - Support conditional transformations

4. **Schema-based Validation**

   - Validation using @effect/schema
   - Validation executed at build time

5. **Lazy Evaluation**
   - Transformations delayed until build time
   - Avoid intermediate validation and unnecessary object creation

## Usage Example

```typescript
import { Schema, Effect, Data } from "effect";

// 1. Define Schema & Builder
const MessageSchema = Schema.Struct({
  type: Schema.Union(Schema.Literal("text"), Schema.Literal("flex")),
  content: Schema.String,
  options: Schema.optional(
    Schema.Struct({
      color: Schema.optional(Schema.String),
      size: Schema.optional(Schema.Number),
    })
  ),
});

const Message = define(MessageSchema, {
  type: "text",
  content: "",
});

// 2. Create Transforms
const flexMessage = Message.compose(
  Message.field("type", "flex"),
  Message.field("content", "Hello"),
  Message.when(
    (msg) => msg.type === "flex",
    Message.field("options", { color: "red" })
  ),
  Message.when(
    (msg) => msg.type === "text",
    Message.field("options", { color: "blue" })
  )
);

// 3. Build Final Result
const message = Effect.flatMap(flexMessage, Builder.build);
```

## Limitations

1. Synchronous operations only
2. Basic validation errors only
3. No serialization support

## Implementation Priority

1. Core Transform types and operations
2. Builder Factory (define)
3. Immutable update logic
4. Error handling mechanism
