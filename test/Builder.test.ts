import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, pipe, Schema } from "effect";
import { define } from "../src/Builder.js";

describe("define", () => {
  // Complex schema with nested structures and validations
  const AddressSchema = Schema.Struct({
    street: Schema.String,
    city: Schema.String,
    country: Schema.String,
  });

  const UserSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    age: Schema.Number.pipe(Schema.positive(), Schema.int()),
    email: Schema.Option(Schema.String),
    roles: Schema.Array(Schema.String),
    address: Schema.Option(AddressSchema),
    tags: Schema.Record({ key: Schema.String, value: Schema.Boolean }),
  });

  describe("field operation", () => {
    it("sets primitive field values", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe({}, builder.field("name", "John Doe"));
        expect(result).toEqual({ name: "John Doe", age: 30 });
      }));

    it("sets nested optional field values", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const address = { street: "123 Main St", city: "NY", country: "USA" };
        const result = yield* pipe(
          {},
          builder.field("address", Option.some(address))
        );
        expect(result).toEqual({ address: Option.some(address) });
      }));

    it("sets array field values", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          {},
          builder.field("roles", ["admin", "user"])
        );
        expect(result).toEqual({ roles: ["admin", "user"] });
      }));

    it("sets record field values", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          {},
          builder.field("tags", { active: true, verified: false })
        );
        expect(result).toEqual({ tags: { active: true, verified: false } });
      }));
  });

  describe("when operation", () => {
    it("matches on primitive field type", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          { age: 20 },
          builder.when(
            (age: number) => age >= 18,
            builder.field("roles", ["adult"])
          )
        );
        expect(result).toEqual({ age: 20, roles: ["adult"] });
      }));

    it("matches on optional field value", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          { email: Option.some("test@example.com") },
          builder.when(
            (email: string) => email.includes("@"),
            builder.field("roles", ["verified"])
          )
        );
        expect(result).toEqual({
          email: Option.some("test@example.com"),
          roles: ["verified"],
        });
      }));

    it("matches on array field values", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          { roles: ["admin"] },
          builder.when(
            (roles: string[]) => roles.includes("admin"),
            builder.field("tags", { isAdmin: true })
          )
        );
        expect(result).toEqual({
          roles: ["admin"],
          tags: { isAdmin: true },
        });
      }));
  });

  describe("compose operation", () => {
    it("chains multiple field operations", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("id", 1),
            builder.field("name", "test"),
            builder.field("age", 25),
            builder.field("roles", ["user"])
          )
        );
        expect(result).toEqual({
          id: 1,
          name: "test",
          age: 25,
          roles: ["user"],
        });
      }));

    it("chains conditional transformations", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          { id: 1, age: 20 },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.field("roles", ["adult"])
            ),
            builder.when(
              (id: number) => id > 0,
              builder.field("tags", { active: true })
            )
          )
        );
        expect(result).toEqual({
          id: 1,
          age: 20,
          roles: ["adult"],
          tags: { active: true },
        });
      }));

    it("applies defaults through composition", () =>
      Effect.gen(function* () {
        const defaults = {
          roles: ["user"],
          tags: { verified: false },
        };
        const builder = define(UserSchema, defaults);
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("name", "test"),
            builder.field("age", 25)
          )
        );
        expect(result).toEqual({
          name: "test",
          age: 25,
          roles: ["user"],
          tags: { verified: false },
        });
      }));
  });

  describe("complex scenarios", () => {
    it("supports complex transformations with defaults and conditions", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema, {
          roles: ["user"],
          tags: { active: true },
        });
        const result = yield* pipe(
          {},
          builder.compose(
            builder.field("id", 1),
            builder.field("name", "John Doe"),
            builder.field("age", 30),
            builder.field("email", Option.some("john@example.com")),
            builder.field(
              "address",
              Option.some({
                street: "123 Main St",
                city: "New York",
                country: "USA",
              })
            ),
            builder.when(
              (age: number) => age >= 18,
              builder.compose(
                builder.field("roles", ["adult", "user"]),
                builder.field("tags", { adult: true, active: true })
              )
            )
          )
        );
        expect(result).toEqual({
          id: 1,
          name: "John Doe",
          age: 30,
          email: Option.some("john@example.com"),
          address: Option.some({
            street: "123 Main St",
            city: "New York",
            country: "USA",
          }),
          roles: ["adult", "user"],
          tags: { adult: true, active: true },
        });
      }));

    it("handles multiple conditions with shared field types", () =>
      Effect.gen(function* () {
        const builder = define(UserSchema);
        const result = yield* pipe(
          {
            age: 20,
            email: Option.some("test@example.com"),
            roles: ["premium"],
          },
          builder.compose(
            builder.when(
              (age: number) => age >= 18,
              builder.field("tags", { adult: true })
            ),
            builder.when(
              (email: string) => email.endsWith(".com"),
              builder.field("tags", { commercial: true })
            ),
            builder.when(
              (roles: string[]) => roles.includes("premium"),
              builder.field("tags", { premium: true })
            )
          )
        );
        expect(result).toEqual({
          age: 20,
          email: "test@example.com",
          roles: ["premium"],
          tags: { adult: true, commercial: true, premium: true },
        });
      }));
  });
});
