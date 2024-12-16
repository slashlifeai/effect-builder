import { Data, Effect, Option, pipe, Schema } from "effect"

/**
 * @since 0.1.0
 * @category models
 */
export type Transform<A> = (
  a: Partial<A>
) => Effect.Effect<Partial<A>, BuilderError>

/**
 * @since 0.1.0
 * @category errors
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string
}> {}

/**
 * @since 0.1.0
 * @category errors
 */
export type BuilderError = ValidationError

/**
 * @since 0.1.0
 * @category type-level
 */
type ExtractKey<F, A> = F extends (value: any) => any ? never
  : F extends (value: infer V) => boolean ? { [K in keyof A]: A[K] extends V ? K : never }[keyof A]
  : never

/**
 * Creates a builder for constructing objects with runtime validation.
 *
 * @since 0.1.0
 * @category constructors
 *
 * @example
 * import { Schema, Effect } from "effect"
 * import * as Builder from "effect-builder"
 *
 * const UserSchema = Schema.struct({
 *   name: Schema.String,
 *   age: Schema.Number
 * })
 *
 * const program = Effect.gen(function* (_) {
 *   const builder = Builder.define(UserSchema)
 *   const result = yield* pipe(
 *     {},
 *     builder.field("name", "John"),
 *     builder.field("age", 30)
 *   )
 *   // result: { name: string; age: number }
 * })
 */
export const define = <A, E, R>(
  schema: Schema.Schema<A, E, R>,
  defaults: Partial<A> = {}
) => ({
  /**
   * Sets a field of the object being built to a specific value.
   *
   * @since 0.1.0
   * @category builders
   *
   * @example
   * import { pipe, Effect } from "effect"
   * import * as Builder from "effect-builder"
   *
   * const program = Effect.gen(function* (_) {
   *   const builder = Builder.define(UserSchema)
   *   const result = yield* pipe(
   *     {},
   *     builder.field("name", "John")
   *   )
   * })
   */
  field: <K extends keyof A>(key: K) => (value: A[K]): Transform<A> => (a) =>
    Effect.succeed({ ...a, ...defaults, [key]: value }),

  /**
   * Applies a transformation function conditionally based on a predicate.
   *
   * @since 0.1.0
   * @category builders
   *
   * @example
   * import { pipe, Effect } from "effect"
   * import * as Builder from "effect-builder"
   *
   * const program = Effect.gen(function* (_) {
   *   const builder = Builder.define(UserSchema)
   *   const result = yield* pipe(
   *     { age: 20 },
   *     builder.when(
   *       (age: number) => age >= 18,
   *       builder.field("roles", ["adult"])
   *     )
   *   )
   * })
   */
  when: <F extends (value: any) => boolean>(
    predicate: F,
    transform: Transform<A>
  ): Transform<A> =>
  (a) => {
    const key = (Object.keys(a) as Array<keyof A>).find(
      (k) => typeof a[k] === typeof predicate.arguments
    ) as ExtractKey<F, A>
    return Option.fromNullable(key ? a[key] : undefined).pipe(
        Option.map(predicate),
        Option.getOrElse(() => false)
      )
      ? transform(a)
      : Effect.succeed({ ...a, ...defaults })
  },

  /**
   * Composes multiple transformation functions into a single transformation function.
   *
   * @since 0.1.0
   * @category builders
   *
   * @example
   * import * as Builder from "effect-builder"
   * import { pipe, Effect } from "effect"
   *
   * const program = Effect.gen(function* (_) {
   *   const builder = Builder.define(UserSchema)
   *   const result = yield* pipe(
   *     {},
   *     builder.compose(
   *       builder.field("name", "John"),
   *       builder.field("age", 30),
   *       builder.when(
   *         (age: number) => age >= 18,
   *         builder.field("roles", ["adult"])
   *       )
   *     )
   *   )
   * })
   */
  compose: (...transforms: Array<Transform<A>>): Transform<A> => (a) =>
    // Apply each transformation in sequence, starting with the initial state
    pipe(
      transforms,
      Effect.reduce({ ...a, ...defaults }, (acc, transform) => transform(acc))
    ),

  /**
   * Validates and builds the final object according to the schema.
   *
   * @since 0.1.0
   * @category builders
   *
   * @example
   * import { Schema, pipe, Effect } from "effect"
   * import * as Builder from "effect-builder"
   *
   * const program = Effect.gen(function* (_) {
   *   const builder = Builder.define(UserSchema)
   *   const user = yield* pipe(
   *     {},
   *     builder.field("name", "John"),
   *     builder.field("age", 30),
   *     builder.build
   *   )
   *   // user is fully typed and validated
   * })
   */
  build: (a: any) =>
    pipe(
      { ...a, ...defaults },
      Schema.decodeUnknown(schema),
      Effect.mapError(
        (error) => new ValidationError({ message: "Schema validation failed: " + error })
      )
    )
})
