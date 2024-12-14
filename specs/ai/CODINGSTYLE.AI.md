# AI Coding Style Guide for @effect/builder

## Core Requirements

### Effect v3 Style
```typescript
// Always use uppercase Schema methods (Effect v3 style)
const schema = Schema.Struct({  // 
  name: Schema.String,         // 
  age: Schema.Number,
  tags: Schema.Array(Schema.String)
})

// Never use lowercase schema methods
const schema = Schema.struct({  // 
  name: Schema.string,         // 
  age: Schema.number
})

// Use Schema.Option for optional fields
const schema = Schema.Struct({
  email: Schema.Option(Schema.String),  // 
  tags: Schema.Option(Schema.Array(Schema.String))
})
```

### Type Safety Implementation
```typescript
// Use explicit type parameters only when necessary
const transform = transform<User>((user) => ({
  ...user,  // Preserve immutability
  age: user.age + 1
}))

// Let type inference work
const builder = define(schema)  // Schema provides type information
```

### Schema-based Validation
```typescript
// Define schema with validation
const schema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number.pipe(
    Schema.positive(),
    Schema.int()
  )
})

// Define error type
export class ValidationError extends Data.TaggedError<{
  readonly _tag: "ValidationError"
  readonly schema: ParseError
}> {}

export type BuilderError = ValidationError

// Use Effect for validation
const validateUser = transform<User>((user) => Effect.gen(function* () {
  if (user.age < 0) {
    yield* Effect.fail(new ValidationError({
      _tag: "ValidationError",
      schema: Schema.parseError("Age must be positive")
    }))
  }
  return { ...user }
}))

// Handle errors
const program = Effect.gen(function* () {
  const result = yield* pipe(
    validateUser,
    Effect.catchTag("ValidationError", (error) => 
      Effect.logError("Validation failed:", error.schema))
  )
  return result
})
```

### Immutable Transformations
```typescript
// Always return new objects
const updateAge = transform<User>((user) => Effect.succeed({
  ...user,  // Spread to create new object
  age: user.age + 1
}))

// Never mutate input
const wrong = transform<User>((user) => {
  user.age += 1  // 
  return Effect.fail(new ValidationError({
    _tag: "ValidationError",
    schema: Schema.parseError("Direct mutation is not allowed")
  }))
})
```

## Code Generation Patterns

### Builder Pattern
```typescript
const Message = define(MessageSchema, {
  type: "text",
  content: ""
})

const builder = pipe(
  Message.compose(
    Message.field("type", "flex"),
    Message.field("content", "Hello")
  ),
  Effect.flatMap((msg) => 
    msg.type === "flex"
      ? Effect.succeed(Message.field("options", { color: "red" }))
      : Effect.fail(new ValidationError({
          _tag: "ValidationError",
          schema: Schema.parseError("Invalid message type")
        }))
  )
)
```

### Error Handling
```typescript
// Use ValidationError for schema validation failures
const validateAge = transform<User>((user) => Effect.gen(function* () {
  if (user.age < 0) {
    yield* Effect.fail(new ValidationError({
      _tag: "ValidationError",
      schema: Schema.parseError("Age must be positive")
    }))
  }
  return user
}))

// Handle errors with Effect
const program = Effect.gen(function* () {
  const result = yield* pipe(
    validateAge,
    Effect.catchTag("ValidationError", (error) =>
      Effect.logError("Validation failed:", error.schema))
  )
  return result
})
```

## Documentation

### JSDoc Style
```typescript
/**
 * Creates a new Transform that applies the given transformation.
 *
 * @example
 * import { Schema, Effect, Data } from "effect"
 *
 * const UserSchema = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Number
 * })
 *
 * const transform = transform((user) => Effect.succeed({
 *   ...user,
 *   age: user.age + 1
 * }))
 *
 * @since 1.0.0
 * @category constructors
 */
export const transform: {
  <A>(f: (a: Partial<A>) => Effect<Partial<A>, ValidationError>): Transform<A>
  <A>(a: Partial<A>): Transform<A>
} = <A>(f: (a: Partial<A>) => Effect<Partial<A>, ValidationError>) => ...
```

## Development Process

### Testing
```typescript
// Test error handling
describe("User Builder", () => {
  test("should handle validation error", () => {
    const User = define(UserSchema)
    const program = Effect.gen(function* () {
      const builder = User.compose(
        User.field("name", ""),  // Invalid
        User.field("age", -1)    // Invalid
      )
      const result = yield* Builder.build(builder)
      return result
    })

    expect(Effect.runSync(program)).toEqual(
      Effect.fail(new ValidationError({
        _tag: "ValidationError",
        schema: Schema.parseError("Invalid user data")
      }))
    )
  })

  test("should handle schema validation", () => {
    const program = Effect.gen(function* () {
      const result = yield* pipe(
        validateUser,
        Effect.catchTag("ValidationError", (error) => 
          Effect.logError("Schema validation failed:", error.schema))
      )
      return result
    })

    expect(Effect.runSync(program)).toBeDefined()
  })
})
```

### Debugging
```typescript
// Add descriptive error handling
const validateAge = transform<User>((user) => Effect.gen(function* () {
  if (user.age < 0) {
    yield* Effect.fail(new ValidationError({
      _tag: "ValidationError",
      schema: Schema.parseError("Age must be positive")
    }))
  }
  if (user.age > 150) {
    yield* Effect.fail(new ValidationError({
      _tag: "ValidationError",
      schema: Schema.parseError("Age exceeds maximum allowed")
    }))
  }
  return user
}))

// Test error cases
test("should handle age validation", () => {
  const program = pipe(
    validateAge({ age: -1, name: "test" }),
    Effect.catchTag("ValidationError", (error) => 
      Effect.succeed(`Validation failed: ${error.schema}`))
  )

  expect(Effect.runSync(program)).toBe("Validation failed: Age must be positive")
})
```

## Performance

### Object Creation
```typescript
// Reuse objects where possible
const defaults = { name: "", age: 0 }
const User = define(UserSchema, defaults)

// Smart equality checks with Effect
const updateAge = transform<User>((user) => 
  user.age !== newAge
    ? Effect.succeed({ ...user, age: newAge })
    : Effect.succeed(user)  // Return same object if no change
)
```

### Composition
```typescript
// Combine transformations with proper error handling
const updateUserProfile = pipe(
  User.compose(
    User.field("name", newName),
    User.field("age", newAge)
  ),
  Effect.flatMap((user) => 
    user.age >= 18
      ? Effect.succeed(User.field("canVote", true))
      : Effect.fail(new ValidationError({
          _tag: "ValidationError",
          schema: Schema.parseError("User must be 18 or older to vote")
        }))
  )
)
```

## ESLint Configuration

```json
{
  "extends": [
    "plugin:@effect/recommended"
  ],
  "plugins": ["@effect"],
  "rules": {
    "@effect/prefer-schema": "error",
    "@effect/constrained-type-parameters": "error",
    "@effect/no-module-property": "error",
    "@effect/no-unused-vars": "error",
    "@effect/no-unused-expressions": "error",
    "@effect/no-unsafe-member-access": "error",
    "@effect/no-unsafe-call": "error",
    "@effect/no-unsafe-constructor": "error",
    "@effect/no-unsafe-optional-chaining": "error",
    "@effect/no-unsafe-nullish-coalescing": "error"
  }
}
```

## Prettier Configuration

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "always",
  "proseWrap": "preserve"
}
```

## Testing Patterns
```typescript
describe("User Builder", () => {
  test("should build valid user", () => {...})
  test("should validate age", () => {...})
})

describe("Error cases", () => {
  test("should handle missing fields", () => {...})
})

describe("Edge cases", () => {
  test("should handle empty strings", () => {...})
  test("should handle zero values", () => {...})
})

describe("Null safety", () => {
  test("should handle null values", () => {...})
  test("should handle undefined", () => {...})
})
