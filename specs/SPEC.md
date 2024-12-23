# effect-builder v0.3.0 Specification

effect-builder is a TypeScript library that provides a type-safe, immutable builder pattern implementation using Effect. It enables developers to construct complex objects with runtime validation while maintaining compile-time type safety.

## Overview

effect-builder is designed to provide a simple, intuitive API for building complex objects while ensuring type safety and runtime validation. The library is built on top of Effect and leverages its powerful features to provide a robust and efficient way to construct objects.

## Design Principles

### Type Safety
- Full type inference from Schema
- Compile-time validation of field access
- Runtime validation during build phase

### Composability
- Easy to combine transforms
- Reusable patterns
- Clean composition with pipe and compose

### Developer Experience
- Intuitive API design
- Clear error messages
- Minimal boilerplate

## Core Concepts

### 1. Transform

The **Transform** type represents a basic transformation unit that allows for the modification of object properties in a type-safe manner. It takes a partial object as input and returns a modified partial object.

```typescript
type Transform<A> = (a: Partial<A>) => Partial<A>
```

### 2. Builder Factory

```typescript
interface Builder<A> {
  Default: A
  schema: Schema<A>
}
```

The **Builder Factory** is responsible for creating builder instances from a defined schema.

### 3. Schema Defaults

Schema defaults can be specified at two levels:

1. Schema-Level Defaults:
```typescript
const schema = Schema.Struct({
  name: Schema.String.annotations({ default: "Guest" })
})
```

2. Builder-Level Defaults:
```typescript
const builder = define(schema, {
  name: "Anonymous" // Overrides schema default
})
```

Builder defaults take precedence over schema defaults.

## Features

### 1. Auto-generate Lenses from Schema

```typescript
const UserSchema = Schema.struct({
  name: Schema.string,
  age: Schema.number
})

const User = define(UserSchema)

pipe(
  compose(
    User.name("John"),    // Generated lens API
    User.age(25)
  ),
  User.build
)
```

### 2. Schema Annotation Defaults

```typescript
const UserSchema = Schema.struct({
  name: Schema.string,
  age: Schema.number,
  role: Schema.literal("user", "admin")
}).annotate({
  defaults: {
    role: "user",
    age: 0
  }
})
```

### 3. Proper Lens Implementation

```typescript
interface Lens<S, A> {
  get: (s: S) => A
  set: {
    (value: A, state: S): S
    (value: A): (state: S) => S
  }
}

// Follows lens laws:
// 1. get(set(a, s)) = a
// 2. set(get(s), s) = s
// 3. set(a, set(b, s)) = set(a, s)
```

## Examples

### Line Message Builder

```typescript
const MessageSchema = Schema.struct({
  type: Schema.literal("text", "sticker", "image"),
  text: Schema.optional(Schema.string),
  packageId: Schema.optional(Schema.number),
  stickerId: Schema.optional(Schema.number),
  imageUrl: Schema.optional(Schema.string)
}).annotate({
  defaults: { type: "text" }
})

const Message = define(MessageSchema)

// Text Message
const textMessage = pipe(
  compose(
    Message.type("text"),
    Message.text("Hello!")
  ),
  Message.build
)

// Reusable transforms
const withLoveStickerPack = compose(
  Message.type("sticker"),
  Message.packageId(789)
)

const loveStickerMessage = pipe(
  compose(
    withLoveStickerPack,
    Message.stickerId(123)
  ),
  Message.build
)
```

## Best Practices

### 1. Lens Organization
- Extract reusable lenses
- Group related lenses
- Use type-safe setters

### 2. Transform Composition
- Keep transforms small and focused
- Use debug points for visibility
- Compose for complex operations

### 3. Error Handling
```typescript
pipe(
  createUser(data),
  Effect.catchAll((error) =>
    match(error)
      .when(ValidationError, handleValidation)
      .when(BuilderError, handleBuilder)
      .exhaustive()
  )
)
```
- Type-safe error handling
- Pattern matching
- Effect-based error propagation

## API Reference

### `define<A, E, R>`

Creates a new builder with schema validation.

### `field<K>`

Creates a lens for accessing specific fields.

### `compose`

Combines multiple transforms into one.

### `build`

Validates and constructs the final object.

## Migration Guide

### From Traditional Builder

- Replace mutable state with transforms
- Use lenses for field access
- Add schema validation

### From Effect 2

- Update Schema types to uppercase
- Use new Effect combinators
- Leverage improved type inference

## Package Goals

1. **Type Safety**: Ensure compile-time type checking for all builder operations
2. **Validation**: Provide runtime validation through Effect's Schema system
3. **Immutability**: Enforce immutable data transformations
4. **Developer Experience**: Offer a simple, intuitive API for building complex objects
5. **Error Handling**: Leverage Effect's error handling capabilities
