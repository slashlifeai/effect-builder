# Coding Style Guide

## Core Principles

### Type Safety
- Use TypeScript's strict mode
- Avoid type assertions
- Leverage type inference
- Maintain strict type checking

### Immutability
- Never mutate input objects
- Return new instances for all transformations
- Use readonly modifiers where applicable

### Schema-based Validation
- Define schemas using Effect Schema
- Validate at compile time and runtime
- Use branded types for additional type safety

## Effect Conventions

### Imports
```typescript
import { Schema, Effect, Data } from "effect"
```

### Builder Pattern Usage
```typescript
// Define schema with validation
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number.pipe(
    Schema.positive(),
    Schema.int()
  )
})

// Use schema for validation
const User = define(UserSchema)

// Create builder
const builder = User.compose(
  User.field("name", "John"),
  User.field("age", 30)
)

// Apply transformations
const transformed = builder
  .transform(user => ({ ...user, age: user.age + 1 }))
  .when(
    user => user.age >= 18,
    user => ({ ...user, canVote: true })
  )

// Build final object
const result = Effect.runSync(Builder.build(transformed))
```

### Error Handling
```typescript
// Define custom error types
export class ValidationError extends Data.TaggedError<{
  readonly _tag: "ValidationError"
  readonly schema: ParseError
}> {}

// Use Effect for error handling
const program = Effect.gen(function* () {
  const result = yield* Builder.build(transform)
  return result
})
```

## Documentation Style

### JSDoc Format
```typescript
/**
 * Creates a new Transform that applies the given transformation.
 *
 * @example
 * import { Schema, Effect } from "effect"
 *
 * const schema = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Number
 * })
 *
 * const transform = transform((user) => ({
 *   ...user,
 *   age: user.age + 1
 * }))
 *
 * @since 1.0.0
 * @category constructors
 */
export const transform: {
  <A>(f: (a: Partial<A>) => Partial<A>): Transform<A>
  <A>(a: Partial<A>): Transform<A>
} = <A>(f: (a: Partial<A>) => Partial<A>) => ...
```

## Performance Considerations

- Minimize object allocations
- Use Effect's optimized methods
- Avoid unnecessary transformations
- Cache expensive computations

## Testing Requirements

- Test type safety
- Test immutability
- Test validation rules
- Test error cases
- Test performance characteristics

## Testing

### Test Structure
```typescript
describe("User Builder", () => {
  test("should build valid user", () => {
    const User = define(UserSchema)
    const builder = User.compose(
      User.field("name", "John"),
      User.field("age", 30)
    )
    const result = Effect.runSync(Builder.build(builder))
    expect(result).toEqual({ name: "John", age: 30 })
  })
})
```

### Error Testing
```typescript
test("should handle validation error", () => {
  const User = define(UserSchema)
  const builder = User.compose(
    User.field("name", ""),  // Invalid: empty name
    User.field("age", -1)    // Invalid: negative age
  )
  expect(() => Effect.runSync(Builder.build(builder)))
    .toThrow(ValidationError)
})
```

## Performance

### Object Creation
```typescript
// Reuse objects where possible
const defaults = { name: "", age: 0 }
const User = define(UserSchema, defaults)

// Smart equality checks
const updateAge = User.when(
  (user) => user.age !== newAge,  // Only update if different
  User.field("age", newAge)
)
```

### Composition
```typescript
// Combine related transformations
const updateUserProfile = User.compose(
  User.field("name", newName),
  User.field("age", newAge),
  User.when(
    (user) => user.age >= 18,
    User.field("canVote", true)
  )
)
