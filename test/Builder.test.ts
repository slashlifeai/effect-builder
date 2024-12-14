import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, pipe, Schema } from "effect"
import type { Transform } from "../src/Builder.js"
import { define } from "../src/Builder.js"

describe("define", () => {
  // Complex schema with nested structures and validations
  const AddressSchema = Schema.Struct({
    street: Schema.String,
    city: Schema.String,
    country: Schema.String
  })

  const UserSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    age: Schema.Number.pipe(Schema.positive(), Schema.int()),
    email: Schema.Option(Schema.String),
    roles: Schema.Array(Schema.String),
    address: Schema.Option(AddressSchema),
    tags: Schema.Record({ key: Schema.String, value: Schema.Boolean })
  })

  describe("field operation", () => {
    it("sets primitive field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe({}, builder.field("name")("John Doe"))
        expect(result).toEqual({ name: "John Doe", age: 30 })
      }))

    it("sets nested optional field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const address = { street: "123 Main St", city: "NY", country: "USA" }
        const result = yield* pipe(
          {},
          builder.field("address")(Option.some(address))
        )
        expect(result).toEqual({ address: Option.some(address) })
      }))

    it("sets array field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {},
          builder.field("roles")(["admin", "user"])
        )
        expect(result).toEqual({ roles: ["admin", "user"] })
      }))

    it("sets record field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {},
          builder.field("tags")({ active: true, verified: false })
        )
        expect(result).toEqual({ tags: { active: true, verified: false } })
      }))

    it("overwrites existing field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { name: "Old Name" },
          builder.field("name")("New Name")
        )
        expect(result).toEqual({ name: "New Name" })
      }))

    it("handles undefined fields gracefully", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe({}, builder.field("email")(Option.none()))
        expect(result).toEqual({ email: Option.none() })
      }))
  })

  describe("when operation", () => {
    it("matches on primitive field type", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { age: 20 },
          builder.when(
            (age: number) => age >= 18,
            builder.field("roles")(["adult"])
          )
        )
        expect(result).toEqual({ age: 20, roles: ["adult"] })
      }))

    it("matches on optional field value", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { email: Option.some("test@example.com") },
          builder.when(
            (email: string) => email.includes("@"),
            builder.field("roles")(["verified"])
          )
        )
        expect(result).toEqual({
          email: Option.some("test@example.com"),
          roles: ["verified"]
        })
      }))

    it("matches on array field values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { roles: ["admin"] },
          builder.when(
            (roles: Array<string>) => roles.includes("admin"),
            builder.field("tags")({ isAdmin: true })
          )
        )
        expect(result).toEqual({
          roles: ["admin"],
          tags: { isAdmin: true }
        })
      }))

    it("skips transformation when predicate is false", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { age: 15 },
          builder.when(
            (age: number) => age >= 18,
            builder.field("roles")(["adult"])
          )
        )
        expect(result).toEqual({ age: 15 })
      }))

    it("handles predicate on non-existent field", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {},
          builder.when(
            (age: number) => age >= 18,
            builder.field("roles")(["adult"])
          )
        )
        expect(result).toEqual({})
      }))

    it("supports nested when conditions", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { age: 20, roles: ["premium"] },
          builder.when(
            (age: number) => age >= 18,
            builder.when(
              (roles: Array<string>) => roles.includes("premium"),
              builder.field("tags")({ premium: true, adult: true })
            )
          )
        )
        expect(result).toEqual({
          age: 20,
          roles: ["premium"],
          tags: { premium: true, adult: true }
        })
      }))

    it("handles type mismatches in predicate", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { name: "John" }, // string type doesn't match number predicate
          builder.when(
            (age: number) => age >= 18,
            builder.field("roles")(["adult"])
          )
        )
        expect(result).toEqual({ name: "John" })
      }))

    it("handles multiple fields of same type", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {
            name: "John",
            city: "NY" // Both are strings
          },
          builder.when(
            (str: string) => str.length > 2,
            builder.field("roles")(["valid"])
          )
        )
        expect(result).toEqual({
          name: "John",
          city: "NY"
        })
      }))

    it("handles null values in when predicate", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { email: Option.none() },
          builder.when(
            (email: string) => email.includes("@"),
            builder.field("roles")(["verified"])
          )
        )
        expect(result).toEqual({ email: Option.none() })
      }))
  })

  describe("compose operation", () => {
    it("chains multiple field operations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("id")(1),
            builder.field("name")("test"),
            builder.field("age")(25),
            builder.field("roles")(["user"])
          )
        )
        expect(result).toEqual({
          id: 1,
          name: "test",
          age: 25,
          roles: ["user"]
        })
      }))

    it("chains conditional transformations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          { id: 1, age: 20 },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.field("roles")(["adult"])
            ),
            builder.when(
              (id: number) => id > 0,
              builder.field("tags")({ active: true })
            )
          )
        )
        expect(result).toEqual({
          id: 1,
          age: 20,
          roles: ["adult"],
          tags: { active: true }
        })
      }))

    it("applies defaults through composition", () =>
      Effect.gen(function*() {
        const defaults = {
          roles: ["user"],
          tags: { verified: false }
        }
        const builder = define(UserSchema, defaults)
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("name")("test"),
            builder.field("age")(25)
          )
        )
        expect(result).toEqual({
          name: "test",
          age: 25,
          roles: ["user"],
          tags: { verified: false }
        })
      }))

    it("handles empty composition", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe({ name: "test" }, builder.compose())
        expect(result).toEqual({ name: "test" })
      }))

    it("preserves defaults in empty composition", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema, { roles: ["guest"] })
        const result = yield* pipe({}, builder.compose())
        expect(result).toEqual({ roles: ["guest"] })
      }))

    it("handles errors in transformation chain", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {},
          builder.compose(
            builder.field("name")("John"),
            builder.field("age")(-1), // This will fail validation
            builder.field("roles")(["user"])
          ),
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))

    it("preserves error context in nested operations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          { age: 20 },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.field("address")({
                // @ts-ignore
                street: 123, // Invalid type
                city: "NY",
                country: "USA"
              })
            )
          ),
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))
  })

  describe("build operation", () => {
    it("builds a valid object with complete data", () =>
      Effect.gen(function*(_) {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {
            id: 1,
            name: "John Doe",
            age: 30,
            email: Option.some("john@example.com"),
            roles: ["user"],
            address: Option.some({
              street: "123 Main St",
              city: "Springfield",
              country: "USA"
            }),
            tags: { admin: true }
          },
          builder.build
        )

        expect(result).toEqual({
          id: 1,
          name: "John Doe",
          age: 30,
          email: Option.some("john@example.com"),
          roles: ["user"],
          address: Option.some({
            street: "123 Main St",
            city: "Springfield",
            country: "USA"
          }),
          tags: { admin: true }
        })
      }))

    it("fails with validation error for invalid data", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John Doe",
            age: -1, // Invalid: age must be positive
            email: Option.some("john@example.com"),
            roles: ["user"],
            tags: { admin: true }
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
        if (Effect.isFailure(result)) {
          expect(result.toString()).toContain("Schema validation failed")
        }
      }))

    it("builds with defaults", () =>
      Effect.gen(function*(_) {
        const defaults = {
          roles: ["user"],
          tags: { guest: true }
        }
        const builder = define(UserSchema, defaults)
        const result = yield* pipe(
          {
            id: 1,
            name: "John Doe",
            age: 30,
            email: Option.none()
          },
          builder.build
        )

        expect(result).toEqual({
          id: 1,
          name: "John Doe",
          age: 30,
          email: Option.none(),
          roles: ["user"],
          tags: { guest: true },
          address: Option.none()
        })
      }))

    it("fails with invalid nested structure", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John",
            age: 30,
            address: Option.some({
              street: "123 Main St",
              city: "Springfield",
              country: 123 // Invalid: should be string
            })
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))

    it("fails with invalid record type", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John",
            age: 30,
            tags: { admin: "true" } // Invalid: should be boolean
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))

    it("builds with partial data and defaults", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema, {
          roles: ["guest"],
          tags: { guest: true }
        })
        const result = yield* pipe(
          {
            id: 1,
            name: "John",
            age: 30
          },
          builder.build
        )

        expect(result).toEqual({
          id: 1,
          name: "John",
          age: 30,
          roles: ["guest"],
          tags: { guest: true },
          email: Option.none(),
          address: Option.none()
        })
      }))

    it("validates array element types", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John",
            age: 30,
            roles: [123] // Invalid: should be string[]
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))

    it("validates optional fields when present", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John",
            age: 30,
            email: "invalid-email" // Invalid: should be Option<string>
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))

    it("handles deeply nested validation", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: 1,
            name: "John",
            age: 30,
            address: {
              // Invalid: should be Option<Address>
              street: "123 Main St",
              city: "Springfield",
              country: "USA"
            }
          },
          builder.build
        )

        const result = yield* Effect.either(program)
        expect(Effect.isFailure(result)).toBe(true)
      }))
  })

  describe("complex scenarios", () => {
    it("supports complex transformations with defaults and conditions", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema, {
          roles: ["user"],
          tags: { active: true }
        })
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("id")(1),
            builder.field("name")("John Doe"),
            builder.field("age")(30),
            builder.field("email")(Option.some("john@example.com")),
            builder.field("address")(
              Option.some({
                street: "123 Main St",
                city: "New York",
                country: "USA"
              })
            ),
            builder.when(
              (age: number) => age >= 18,
              builder.compose(
                builder.field("roles")(["adult", "user"]),
                builder.field("tags")({ adult: true, active: true })
              )
            )
          )
        )
        expect(result).toEqual({
          id: 1,
          name: "John Doe",
          age: 30,
          email: Option.some("john@example.com"),
          address: Option.some({
            street: "123 Main St",
            city: "New York",
            country: "USA"
          }),
          roles: ["adult", "user"],
          tags: { adult: true, active: true }
        })
      }))

    it("handles multiple conditions with shared field types", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {
            age: 20,
            email: Option.some("test@example.com"),
            roles: ["premium"]
          },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.field("tags")({ adult: true })
            ),
            builder.when(
              (email: string) => email.endsWith(".com"),
              builder.field("tags")({ commercial: true })
            ),
            builder.when(
              (roles: Array<string>) => roles.includes("premium"),
              builder.field("tags")({ premium: true })
            )
          )
        )
        expect(result).toEqual({
          age: 20,
          email: "test@example.com",
          roles: ["premium"],
          tags: { adult: true, commercial: true, premium: true }
        })
      }))

    it("handles deeply nested conditional transformations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {
            age: 25,
            roles: ["premium"],
            email: Option.some("test@example.com")
          },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.when(
                (roles: Array<string>) => roles.includes("premium"),
                builder.when(
                  (email: string) => email.includes("@"),
                  builder.compose(
                    builder.field("tags")({
                      premium: true,
                      adult: true,
                      verified: true
                    }),
                    builder.field("address")(
                      Option.some({
                        street: "Premium St",
                        city: "Elite City",
                        country: "VIP Land"
                      })
                    )
                  )
                )
              )
            )
          )
        )

        expect(result).toEqual({
          age: 25,
          roles: ["premium"],
          email: Option.some("test@example.com"),
          tags: { premium: true, adult: true, verified: true },
          address: Option.some({
            street: "Premium St",
            city: "Elite City",
            country: "VIP Land"
          })
        })
      }))

    it("handles boundary values", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const program = pipe(
          {
            id: Number.MAX_SAFE_INTEGER,
            name: "a".repeat(1000), // Very long string
            age: 1, // Minimum valid age
            roles: Array(100).fill("role"), // Large array
            tags: Object.fromEntries(
              Array(100)
                .fill(0)
                .map((_, i) => [`key${i}`, i % 2 === 0])
            ) // Large record
          },
          builder.build
        )

        const result = yield* program
        expect(result.id).toBe(Number.MAX_SAFE_INTEGER)
        expect(result.name.length).toBe(1000)
        expect(result.roles.length).toBe(100)
        expect(Object.keys(result.tags).length).toBe(100)
      }))

    it("maintains schema invariants through transformations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)
        const result = yield* pipe(
          {},
          builder.compose(
            // Age should always be positive after any transformation
            builder.field("age")(20),
            builder.when((age: number) => age >= 18, builder.field("age")(25)),
            builder.when((age: number) => age >= 21, builder.field("age")(30))
          ),
          builder.build
        )

        expect(result.age).toBeGreaterThan(0)
      }))

    it("handles recursive builder patterns", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)

        // Create a recursive builder pattern
        const addRole = (role: string): Transform<typeof UserSchema.Type> => (a) =>
          pipe(a, builder.field("roles")((a.roles || []).concat(role)))

        const addRoleWithCheck = (
          role: string,
          check: (a: Partial<typeof UserSchema.Type>) => boolean
        ): Transform<typeof UserSchema.Type> =>
        (a) => check(a) ? addRole(role)(a) : Effect.succeed(a)

        const result = yield* pipe(
          { age: 25, roles: ["user"] },
          builder.compose(
            addRole("base"),
            addRoleWithCheck("adult", (a) => (a.age ?? 0) >= 18),
            addRoleWithCheck("premium", (a) => (a.roles ?? []).includes("adult")),
            builder.build
          )
        )

        expect(result.roles).toEqual(["user", "base", "adult", "premium"])
      }))

    it("preserves type information through complex transformations", () =>
      Effect.gen(function*() {
        const builder = define(UserSchema)

        // This test verifies that type information is preserved
        // through complex transformations
        const result = yield* pipe(
          { id: 1 },
          builder.compose(
            builder.field("name")("test"),
            builder.when(
              (name: string) => name === "test",
              builder.compose(
                builder.field("age")(20),
                builder.when(
                  (age: number) => age >= 18,
                  builder.compose(
                    builder.field("roles")(["user"]),
                    builder.field("tags")({ active: true })
                  )
                )
              )
            )
          ),
          builder.build
        )

        // TypeScript should infer all these types correctly
        const id: number = result.id
        const name: string = result.name
        const age: number = result.age
        const roles: ReadonlyArray<string> = result.roles
        const tags: { [key: string]: boolean } = result.tags

        expect(typeof id).toBe("number")
        expect(typeof name).toBe("string")
        expect(typeof age).toBe("number")
        expect(Array.isArray(roles)).toBe(true)
        expect(typeof tags).toBe("object")
      }))
  })
})
