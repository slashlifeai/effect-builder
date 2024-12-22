import { describe, it } from "@effect/vitest"
import { Effect, Either, pipe, Schema } from "effect"
import { expect } from "vitest"
import { compose, define, ValidationError } from "../src/Builder.js"

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
  const withRole = (role: string) => User.roles.modify((roles) => [...roles, role])

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
          ),
          userBuilder.build
        )

        expect(userBuilder.field("name").get(state)).toBe("John")
        expect(userBuilder.field("age").get(state)).toBe(30)
      }))

    it("should modify field values", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John"),
            userBuilder.field("age").modify((age) => age + 1)
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
            User.name("John"),
            User.age(-1)
          ),
          userBuilder.build,
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
    it("should use default values when fields are not set", () =>
      Effect.gen(function*() {
        const result = yield* pipe(
          compose(
            User.name("John")
          ),
          userBuilder.build
        )

        expect(result).toEqual({
          id: 0,
          name: "John",
          age: 0,
          roles: []
        })
      }))
  })
})
