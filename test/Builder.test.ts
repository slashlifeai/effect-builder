import { describe, it } from "@effect/vitest"
import { Effect, Either, Option, pipe, Schema } from "effect"
import { expect } from "vitest"
import { compose, define } from "../src/Builder.js"

describe("Builder v0.2.0", () => {
  // Define a schema for testing
  const UserSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    age: Schema.Number.pipe(Schema.positive(), Schema.int()),
    roles: Schema.Array(Schema.String)
  })

  type User = typeof UserSchema.Type

  // Create a builder with defaults
  const userBuilder = define(UserSchema, {
    id: 0,
    name: "",
    age: 0,
    roles: []
  })

  // Extract reusable lenses
  const User = {
    name: (name: string) => userBuilder.field("name").set(name),
    age: (age: number) => userBuilder.field("age").set(age),
    roles: userBuilder.field("roles")
  }

  // Custom transforms
  const withRole = (role: string) => User.roles.modify((roles = []) => [...roles, role])
  const withAge = (age: number) => User.age(age)

  describe("Field Operations", () => {
    it("should set field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(30)
          ),
          userBuilder.build
        )

        expect(result).toEqual({
          id: 0,
          name: "John",
          age: 30,
          roles: []
        })
      }))

    it("should modify field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            withRole("user"),
            withRole("admin")
          ),
          userBuilder.build
        )

        expect(result).toEqual({
          id: 0,
          name: "",
          age: 0,
          roles: ["user", "admin"]
        })
      }))

    it("should get field values", () =>
      Effect.gen(function*() {
        const state = yield* pipe(
          compose(
            User.name("John"),
            User.age(30)
          )
        )(userBuilder.Default)

        expect(userBuilder.field("name").get(state)).toBe("John")
        expect(userBuilder.field("age").get(state)).toBe(30)
      }))

    it("should modify field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            userBuilder.field("age").modify((age) => (age ?? 0) + 1)
          ),
          userBuilder.build
        )

        expect(result.age).toBe(1)
      }))
  })

  describe("Schema Validation", () => {
    it("should validate required fields", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name(""), // Empty name
            User.age(30)
          ),
          userBuilder.build,
          Effect.either
        )

        Either.mapLeft(result, (error) => {
          const errorStr = String(error)
          expect(errorStr).toMatch(/name/)
          expect(errorStr).toMatch(/should not be empty/)
        })
      }))

    it("should handle undefined fields", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John")
            // age is undefined
          ),
          userBuilder.build,
          Effect.either
        )

        Either.mapLeft(result, (error) => {
          const errorStr = String(error)
          expect(errorStr).toMatch(/age/)
          expect(errorStr).toMatch(/required/)
        })
      }))
  })

  describe("Validation", () => {
    it.effect("should fail on invalid age", () =>
      Effect.gen(function*() {
        const program = pipe(
          compose(
            User.name("John"),
            User.age(-1) // Invalid: age must be positive
          ),
          userBuilder.build
        )

        const result = yield* Effect.either(program)
        Either.mapLeft(result, (error) => {
          const errorStr = String(error)
          expect(errorStr).toMatch(/Expected a positive number/)
          expect(errorStr).toMatch(/actual -1/)
          expect(errorStr).toMatch(/\["age"\]/)
        })
      }))
  })

  describe("Conditional Logic", () => {
    it("should apply transforms conditionally", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            withAge(20),
            userBuilder.when(
              (user) => user.age !== undefined && typeof user.age !== "undefined" && user.age >= 18,
              withRole("adult"),
              withRole("minor")
            )
          ),
          userBuilder.build
        )

        expect(result.roles).toContain("adult")
        expect(result.roles).not.toContain("minor")
      }))

    it("should handle falsy condition with default transform", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(20),
            userBuilder.when(
              (user) => (user.age ?? 0) > 50,
              withRole("senior")
            )
          ),
          userBuilder.build
        )

        expect(result.roles).toEqual([])
      }))

    it("should handle custom else transform", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(20),
            userBuilder.when(
              (user) => (user.age ?? 0) > 50,
              withRole("senior"),
              withRole("junior")
            )
          ),
          userBuilder.build
        )

        expect(result.roles).toEqual(["junior"])
      }))
  })

  describe("Default Values", () => {
    it("should use default values when fields are not set", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            User.age(30)
          ),
          userBuilder.build
        )

        expect(result.roles).toEqual([])
      }))

    it("should override default values", () =>
      Effect.gen(function*() {
        const customBuilder = define(UserSchema, {
          id: 1,
          name: "default",
          age: 18,
          roles: ["user"]
        })

        const result = yield* pipe(
          compose(
            User.name("John")
          ),
          customBuilder.build
        )

        expect(result.id).toBe(1)
        expect(result.name).toBe("John")
        expect(result.age).toBe(18)
        expect(result.roles).toEqual(["user"])
      }))
  })

  describe("Complex Schema Operations", () => {
    const AddressSchema = Schema.Struct({
      street: Schema.String,
      city: Schema.String,
      country: Schema.String
    })

    const ComplexUserSchema = Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
      age: Schema.Number.pipe(Schema.positive(), Schema.int()),
      email: Schema.Option(Schema.String),
      roles: Schema.Array(Schema.String),
      address: Schema.Option(AddressSchema),
      tags: Schema.Record({ key: Schema.String, value: Schema.Boolean })
    })

    const complexBuilder = define(ComplexUserSchema, {
      id: 0,
      name: "",
      age: 18,
      email: Option.none(),
      roles: [],
      address: Option.none(),
      tags: {}
    })

    it("should handle optional fields", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            complexBuilder.field("email").set(Option.some("test@example.com")),
            complexBuilder.field("address").set(Option.some({
              street: "123 Main St",
              city: "NY",
              country: "USA"
            }))
          ),
          complexBuilder.build
        )

        expect(result.email).toEqual(Option.some("test@example.com"))
        expect(result.address).toEqual(Option.some({
          street: "123 Main St",
          city: "NY",
          country: "USA"
        }))
      }))

    it("should handle record fields", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            complexBuilder.field("tags").set({
              active: true,
              verified: false
            })
          ),
          complexBuilder.build
        )

        expect(result.tags).toEqual({
          active: true,
          verified: false
        })
      }))

    it("should validate nested structures", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            complexBuilder.field("address").set(Option.some({
              street: "", // Invalid: empty street
              city: "NY",
              country: "USA"
            }))
          ),
          complexBuilder.build,
          Effect.either
        )

        Either.mapLeft(result, (error) => {
          const errorStr = String(error)
          expect(errorStr).toMatch(/street/)
          expect(errorStr).toMatch(/empty/)
        })
      }))
  })
})
