import { describe, expect, it } from "@effect/vitest"
import { Effect, Either, pipe, Schema } from "effect"
import { compose, define, ValidationError } from "../src/Builder.js"

describe("Builder v0.3.0", () => {
  // Define a schema for testing
  const UserSchema = Schema.Struct({
    id: Schema.Number.annotations({ default: 3 }),
    name: Schema.String,
    age: Schema.Number.pipe(Schema.positive(), Schema.int()),
    roles: Schema.Array(Schema.String)
  })

  type User = typeof UserSchema.Type

  // Create a builder with defaults
  const User = define(UserSchema, {
    id: 0,
    name: "",
    age: 1,
    roles: [] as Array<string>
  })

  // Custom transforms
  const withRole = (role: string) => User.roles.modify((roles) => [...roles, role])

  describe("Field Operations", () => {
    it.effect("should set field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(30)
          ),
          User.build
        )

        expect(result).toEqual({
          id: 0,
          name: "John",
          age: 30,
          roles: []
        })
      }))

    it.effect("should modify field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            withRole("user"),
            withRole("admin")
          ),
          User.build
        )

        expect(result).toEqual({
          id: 0,
          name: "",
          age: 1,
          roles: ["user", "admin"]
        })
      }))

    it.effect("should get field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(30)
          ),
          User.build
        )

        expect(User.name.get(result)).toBe("John")
        expect(User.age.get(result)).toBe(30)
      }))

    it.effect("should modify field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age.modify((age) => age + 1)
          ),
          User.build
        )

        expect(result.age).toBe(2)
      }))
  })

  describe("Schema Validation", () => {
    it.effect("should validate required fields", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(-1)
          ),
          User.build,
          Effect.either
        )

        expect(result).toEqual(
          Either.left(
            new ValidationError({ message: expect.stringContaining("Schema validation failed") })
          )
        )
      }))
  })

  describe("Default Values", () => {
    it.effect("should use default values when fields are not set", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John")
          ),
          User.build
        )

        expect(result).toEqual({
          id: 0,
          name: "John",
          age: 1,
          roles: []
        })
      }))

    it.effect("should work with and without defaults", () =>
      Effect.gen(function*() {
        // Builder with defaults
        const UserWithDefaults = define(UserSchema, {
          id: 1,
          name: "default",
          age: 25,
          roles: ["user"]
        })

        // Builder without defaults
        const UserWithoutDefaults = define(UserSchema)

        const resultWithDefaults = yield* pipe(
          compose(),
          UserWithDefaults.build
        )

        const resultWithoutDefaults = yield* pipe(
          compose(
            UserWithoutDefaults.id(1),
            UserWithoutDefaults.name("John"),
            UserWithoutDefaults.age(30),
            UserWithoutDefaults.roles(["admin"])
          ),
          UserWithoutDefaults.build
        )

        expect(resultWithDefaults).toEqual({
          id: 1,
          name: "default",
          age: 25,
          roles: ["user"]
        })

        expect(resultWithoutDefaults).toEqual({
          id: 1,
          name: "John",
          age: 30,
          roles: ["admin"]
        })
      }))
  })

  describe("Schema Defaults", () => {
    it.effect("should respect field-level schema defaults", () =>
      Effect.gen(function*() {
        const TestSchema = Schema.Struct({
          id: Schema.Number.annotations({ default: 42 }),
          name: Schema.String.annotations({ default: "default-name" }),
          count: Schema.Number
        })

        const builder = define(TestSchema)
        const result = yield* pipe(
          compose(builder.count(100)),
          builder.build
        )

        expect(result.id).toBe(42)
        expect(result.name).toBe("default-name")
      }))

    it.effect("should override schema defaults with builder defaults", () =>
      Effect.gen(function*() {
        const TestSchema = Schema.Struct({
          id: Schema.Number.annotations({ default: 42 }),
          name: Schema.String.annotations({ default: "schema-default" })
        })

        const builder = define(TestSchema, {
          id: 100,
          name: "builder-default"
        })

        const result = yield* pipe(
          compose(),
          builder.build
        )

        expect(result.id).toBe(100)
        expect(result.name).toBe("builder-default")
      }))
  })
})
