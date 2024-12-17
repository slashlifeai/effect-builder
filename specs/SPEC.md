# effect-builder v0.2.0 Specification

effect-builder is a TypeScript library that provides a type-safe, immutable builder pattern implementation using Effect. It enables developers to construct complex objects with runtime validation while maintaining compile-time type safety.

## Overview

A type-safe, composable builder pattern implementation using Effect and Schema. The builder combines the power of lenses for precise field access with schema validation for runtime safety.

## Key Features

### 1. Type-Safe Builder Creation

```typescript
const builder = define(Schema, defaults)
```

- Takes a Schema for type and runtime validation
- Optional defaults for initial state
- Returns a builder with type-safe operations

### 2. Lens-Based Field Access

```typescript
// Extract reusable lenses
const UserLens = {
  name: (name: string) => userBuilder.field("name").set(name),
  age: (age: number) => userBuilder.field("age").set(age),
  preferences: userBuilder.field("preferences")
}
```

- Type-safe field access
- Composable transformations
- Reusable lens definitions

### 3. Transform Composition

```typescript
const result = pipe(
  builder.Default,
  compose(
    UserLens.name("John"),
    UserLens.age(25),
    Effect.tap((user) => Effect.log(`Building user: ${user.name}`))
  ),
  builder.build
)
```

- Functional composition of transforms
- Debug points with Effect.tap
- Clear transform chain

### 4. Schema Validation

```typescript
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  preferences: Schema.Struct({
    theme: Schema.Union(Schema.Literal("light"), Schema.Literal("dark"))
  })
})
```

- Runtime validation
- Type inference
- Detailed error messages

### 5. Error Handling

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

## Best Practices

1. **Lens Organization**

   - Extract reusable lenses
   - Group related lenses
   - Use type-safe setters

2. **Transform Composition**

   - Keep transforms small and focused
   - Use debug points for visibility
   - Compose for complex operations

3. **Schema Design**

   - Define precise schemas
   - Use unions for variants
   - Include validation rules

4. **Error Handling**
   - Handle all error cases
   - Provide clear error messages
   - Use pattern matching

## Examples

### Basic Usage

```typescript
const userBuilder = define(UserSchema)
const createUser = (name: string) =>
  pipe(compose(UserLens.name(name), UserLens.age(25)), userBuilder.build)
```

### Complex Composition

```typescript
const premiumUser = pipe(
  compose(
    UserLens.name("John"),
    UserLens.preferences.modify(addPremiumFeatures),
    Effect.tap(debug("Premium features added"))
  ),
  userBuilder.build
)
```

### Validation Example

```typescript
const validateUser = pipe(
  createUser("John"),
  Effect.tap((user) => Effect.log(`Created: ${user.name}`)),
  Effect.catchAll(handleError)
)
```

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

## Core Concepts

### 1. Transform

The **Transform** type represents a basic transformation unit that allows for the modification of object properties in a type-safe manner. It takes a partial object as input and returns a modified partial object. This enables developers to specify only the fields they want to change while keeping the rest of the object intact.

```typescript
type Transform<A> = (a: Partial<A>) => Partial<A>
```

A transform is a pure function that does not have any side effects. It only depends on its input and always returns the same output given the same input. This makes it easy to reason about and compose transforms.

### 2. Builder Factory

```typescript
interface Builder<A> {
  Default: A
  schema: Schema<A>
}
```

The **Builder Factory** is responsible for creating builder instances from a defined schema. It provides a way to initialize complex objects while ensuring that all operations adhere to the schema's constraints. This factory pattern promotes a clear separation of concerns, allowing developers to focus on defining the structure of their data without worrying about the underlying implementation details.

```typescript
const userBuilder = define(UserSchema)
```

The builder factory `define` is a higher-order function that takes a schema as an argument and returns a builder instance. The builder instance is a type-safe representation of the schema, allowing developers to construct objects that conform to the schema.

### 3. Lenses

**Lenses** are a powerful abstraction for accessing and modifying nested properties within complex objects. They provide a way to focus on specific fields, enabling immutable updates without directly mutating the original object.

```typescript
const nameLens = Builder.field("name")
const updatedUser = nameLens.set("Jane")(user)
nameLens.get(updatedUser) // "Jane"
```

A lens is a pair of functions: a getter and a setter. The getter function takes an object as input and returns the value of the focused field. The setter function takes an object and a new value as input and returns a new object with the focused field updated.

### 4. Composition

The library provides a way to compose multiple operations together using the `compose` function. This allows for combining multiple operations into a single transformation:

```typescript
const user = pipe(
  Builder.compose(
    Builder.field("name").set("John Doe"),
    Builder.field("age").set(30)
  )
)
```

Each operation in the composition is applied in sequence, with the result of each operation being passed to the next. This enables building complex transformations from simple operations.

### 5. Building and Validation

The `Builder.build` function is responsible for constructing the final object and ensuring it meets the schema requirements:

```typescript
// Create a partial object through transformations
const partialUser = pipe(
  Builder.compose(
    Builder.field("name").set("John Doe"),
    Builder.field("age").set(30)
  )
)

// Build and validate the final object
const finalUser = Builder.build(UserSchema)(partialUser)
```

The build process:

1. Takes a schema and a partial object
2. Validates that all required fields are present
3. Ensures all values match their type definitions
4. Returns an Effect that either:
   - Succeeds with the complete, validated object
   - Fails with a ValidationError containing details about what went wrong

This provides a clear separation between the construction phase (using transforms) and the validation phase (using build).

### 6. Immutability

The library enforces **immutability** throughout its operations. When a property is updated, a new object is created rather than modifying the existing one. This approach ensures that the original data remains unchanged, which is crucial for maintaining predictable state management in applications.

Immutability is achieved through the use of lenses and transforms. When a lens is used to update a field, a new object is created with the updated field, leaving the original object unchanged.

### 7. Type Safety

**Type Safety** is a core principle of the `effect-builder` library. All builder operations are designed to provide compile-time type checking, ensuring that developers can catch errors early in the development process. This reduces the likelihood of runtime errors and enhances the overall robustness of the code.

Type safety is achieved through the use of TypeScript's type system. The library uses type annotations to specify the types of all builder operations, ensuring that the types are correct and consistent.

### 8. Validation

The library integrates with Effect's Schema system to provide **runtime validation** of object properties. This ensures that any data constructed using the builder adheres to the defined schema, allowing for immediate feedback on data integrity and structure.

Validation is performed when the `build` method is called on a builder instance. The `build` method checks that the constructed object conforms to the schema, throwing an error if the object is invalid.

### 9. Error Handling

Leveraging Effect's powerful **error handling capabilities**, the library provides a consistent way to manage errors that may arise during object construction or validation. This allows developers to build robust applications that can gracefully handle unexpected situations.

Error handling is achieved through the use of Effect's error handling mechanisms. The library uses Effect's `try` and `catch` functions to handle errors that may occur during object construction or validation.

### 10. Conditional Logic

The **Builder.when** function allows developers to apply conditional logic when setting properties. This enables dynamic behavior based on the state of the object, making it easier to implement complex business rules without cluttering the code with if-else statements.

```typescript
Builder.when(
  (user) => user.age > 18,
  Builder.field("roles").set(["admin"]), // Set to admin if age > 18
  Builder.field("roles").set(["user"]) // Otherwise, set to user
)
```

The `when` function takes a predicate function, a then branch, and an else branch as arguments. The predicate function is used to determine which branch to execute. If the predicate function returns true, the then branch is executed; otherwise, the else branch is executed.
