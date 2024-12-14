import { describe, expect, it } from "@effect/vitest";
import { Effect, pipe, Schema } from "effect";
import { define } from "../src/Builder.js";

describe("define", () => {
  const UserSchema = Schema.Struct({
    name: Schema.String,
    age: Schema.Number,
  });

  it("should create builder with all required operations", () =>
    Effect.gen(function* () {
      const builder = define(UserSchema);

      // Test field operation
      const fieldResult = yield* pipe({}, builder.field("name", "test"));
      expect(fieldResult).toEqual({ name: "test" });

      // Test when operation
      const whenResult = yield* pipe(
        { age: 20 },
        builder.when(
          (age: number) => age >= 18,
          builder.field("name", "adult")
        )
      );
      expect(whenResult).toEqual({ age: 20, name: "adult" });

      // Test compose operation
      const composeResult = yield* pipe(
        {},
        builder.compose(builder.field("name", "test"), builder.field("age", 25))
      );
      expect(composeResult).toEqual({ name: "test", age: 25 });
    }));

  it("should apply defaults when provided", () =>
    Effect.gen(function* () {
      const defaults = { name: "default" };
      const builder = define(UserSchema, defaults);

      const result = yield* pipe({}, builder.field("age", 25));

      expect(result).toEqual({ name: "default", age: 25 });
    }));
});
