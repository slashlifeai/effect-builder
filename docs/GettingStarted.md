# Getting Started with Effect Builder

Effect Builder is a type-safe, immutable builder pattern implementation that allows developers to construct complex objects with runtime validation while maintaining compile-time type safety. This guide will help you get started with Effect Builder quickly and effectively.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 14 or later)
- npm or pnpm package manager

## Installation

To install Effect Builder, run the following command in your terminal:

```bash
pnpm add effect-builder
```

This command will add Effect Builder to your project dependencies.

## Basic Usage

To use Effect Builder, you need to define a schema and create a builder. Follow these steps:

### Step 1: Import Required Modules

Import the necessary modules from the `effect` and `effect-builder` libraries:

```typescript
import { Schema, Effect, pipe } from "effect"
import { define } from "effect-builder/Builder"
```

### Step 2: Define Your Schema

Create a schema that describes the structure of the object you want to build. For example, to define a `User` schema:

```typescript
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  roles: Schema.Array(Schema.String).annotations({ default: ["user"] })
})
```

### Step 3: Create the Builder

Use the `define` function to create a builder based on your schema:

```typescript
const User = define(UserSchema)
```

### Step 4: Build an Object

Now you can use the builder to create an object. Here’s how to build a user:

```typescript
const result = Effect.gen(function* () {
  return yield* pipe(
    User.name("John"),
    User.age(25),
    User.roles.modify((roles) => [...roles, "admin"]),
    User.build
  )
}).pipe(Effect.runSync)
```

### Step 5: Output the Result

Log the created user object to the console:

```typescript
console.log("Created user:", result)
// Output will be:
// {
//   name: "John",
//   age: 25,
//   roles: ["user", "admin"]
// }
```

## Advanced Usage

In this section, we will explore more complex scenarios using Effect Builder, including composing lenses, creating custom builders, and reusing builders to create different object types such as `createAdmin`, `createVIP`, etc.

### Lenses and Composition

Effect Builder automatically generates type-safe lenses for each field in your schema. Lenses allow you to access and modify fields in an immutable way. You can compose lenses to create custom builders tailored to specific needs.

#### Example: Composing Lenses for Custom Builders

```typescript
import { Schema, Effect, pipe } from "effect"
import { define, compose } from "effect-builder/Builder"

const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  roles: Schema.Array(Schema.String).annotations({ default: ["user"] })
})

const User = define(UserSchema)

// Create a custom builder for Admin
const createAdmin = (name: string, age: number) => {
  return Effect.gen(function* () {
    return yield* pipe(
      compose(
        User.name(name),
        User.age(age),
        User.roles.modify((roles) => [...roles, "admin"])
      ),
      User.build
    )
  }).pipe(Effect.runSync)
}

const adminResult = createAdmin("Alice", 30)
console.log("Created admin:", adminResult)
// Output will be:
// {
//   name: "Alice",
//   age: 30,
//   roles: ["user", "admin"]
// }
```

### Reusing Builders for Different Object Types

You can create different builders for various user roles by composing lenses and reusing the existing builder. For example, you can create a `createVIP` function that builds a VIP user:

#### Example: Creating a VIP User

```typescript
const createVIP = (name: string, age: number) => {
  return Effect.gen(function* () {
    return yield* pipe(
      compose(
        User.name(name),
        User.age(age),
        User.roles.modify((roles) => [...roles, "VIP"])
      ),
      User.build
    )
  }).pipe(Effect.runSync)
}

const vipResult = createVIP("Bob", 28)
console.log("Created VIP user:", vipResult)
// Output will be:
// {
//   name: "Bob",
//   age: 28,
//   roles: ["user", "VIP"]
// }
```

### Conclusion

Using lenses to compose custom builders allows you to create specialized object types efficiently while maintaining type safety and immutability. This flexibility enhances your development experience with Effect Builder, enabling you to define and reuse builders for various use cases.

## Conclusion

You have successfully set up Effect Builder and created a user object using a schema. For further information, refer to the [API Documentation](https://slashlifeai.github.io/effect-builder) and explore more advanced features of Effect Builder. If you have any questions, feel free to reach out to the community or consult the documentation.
