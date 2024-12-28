# Changelog

## 0.3.2

### Changed

- More examples for the documentation.
- Updated default values setting methods in the documentation.
- Improved the structure and clarity of the Getting Started guide.

### Fixed

- Fixed errors in the documentation examples for better clarity.

## 0.3.1

### Documentation

- Improved README examples with better type inference documentation
- Added runSync example for Effect handling
- Enhanced lens pattern documentation

## 0.3.0

### Features

- Enhanced schema defaults support:
  - Field-level schema defaults using `Schema.annotations({ default: value })`
  - Builder defaults take precedence over schema defaults
  - Improved type safety for default values

### Bug Fixes

- Fixed spread operator type issue in `getSchemaDefaults` function
- Removed unused SchemaAST import

## 0.2.0

### Breaking Changes

Redesigned builder API for better type safety and flexibility:

- Standalone builder operations for direct usage
- Enhanced type inference and runtime validation
- Improved error handling with Effect

New API features:

- `Builder.define(schema)`: Creates a builder with default values and pipe utility
- `Builder.field(key).set(value)`: Field-level operations for precise property updates
- `Builder.when(predicate, ifTrue, ifFalse)`: Conditional transformations with explicit true/false paths
- `Builder.compose(...transforms)`: Composition of multiple builder operations
- `Builder.build(schema)`: Schema validation and object construction

Example usage:

```typescript
// Using define for default values
const User = Builder.define(UserSchema, {
  name: "",
  age: 0
})
console.log(User.Default) // { name: "", age: 0 }

// Using pipe for composition
const user = pipe(
  compose(User.field("name").set("John"), User.field("age").set(30)),
  User.build
)
```

### Minor Changes

Added new builder operations for enhanced object construction:

- `Builder.field`: Field-level operations for precise property updates
- `Builder.when`: Conditional transformations based on predicates
- `Builder.compose`: Composition of multiple builder operations

## 0.1.0

### Minor Changes

Initial release of effect-builder, a type-safe, immutable builder pattern implementation using Effect. Features include:

- Type-safe object construction with runtime validation
- Immutable transformations using Effect
- Support for complex nested structures and validations
- Flexible composition of builder operations
- Recursive builder patterns with proper type inference

For full documentation, see the [README.md](./README.md) and [specs/SPEC.md](./specs/SPEC.md).
