/**
 * This module provides a type-safe, immutable builder pattern implementation
 * using Effect.
 *
 * @since 0.1.0
 */
import { Data, Effect, Option, pipe, Schema, SchemaAST } from "effect"
import * as ReadonlyArray from "effect/Array"

/**
 * @since 0.3.0
 * @category models
 */
type SchemaType<F extends Schema.Struct.Fields> = Schema.Schema.Type<Schema.Struct<F>>

/**
 * @since 0.3.0
 * @category models
 */
export interface Lens<S, A> {
  readonly get: (s: Partial<S>) => A | undefined
  readonly set: <V extends A>(value: V) => Transform<S>
  readonly modify: (f: (value: A) => A) => Transform<S>
}

/**
 * @since 0.3.0
 * @category errors
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
}> {}

/**
 * @since 0.3.0
 * @category errors
 */
export class BuilderError extends Data.TaggedError("BuilderError") {}

/**
 * @since 0.3.0
 * @category models
 */
export type Transform<A> = (a: Partial<A>) => Partial<A>

/**
 * @since 0.3.0
 * @category models
 */
export interface BuilderOp<F extends Schema.Struct.Fields, R> {
  readonly schema: Schema.Struct<F>
  readonly Default: Partial<SchemaType<F>>
  readonly field: <K extends keyof SchemaType<F>>(key: K) => Lens<SchemaType<F>, SchemaType<F>[K]>
  readonly when: (
    predicate: (a: Partial<SchemaType<F>>) => boolean,
    ifTrue: Transform<SchemaType<F>>,
    ifFalse?: Transform<SchemaType<F>>
  ) => Transform<SchemaType<F>>
  readonly build: (
    transform: Transform<SchemaType<F>>
  ) => Effect.Effect<SchemaType<F>, ValidationError, R>
}

/**
 * @since 0.3.0
 * @category models
 */
export type BuilderLens<A> = {
  readonly [K in keyof A]: {
    (value: A[K]): Transform<A>
    readonly get: (s: Partial<A>) => A[K] | undefined
    readonly modify: (f: (value: A[K]) => A[K]) => Transform<A>
  }
}

/**
 * @since 0.3.0
 * @category models
 */
export type Builder<F extends Schema.Struct.Fields, R> =
  & BuilderOp<F, R>
  & Omit<BuilderLens<SchemaType<F>>, keyof BuilderOp<F, R>>

/**
 * Creates a lens for a specific field
 *
 * @since 0.3.0
 * @category constructors
 */
const createLens = <S, K extends keyof S>(key: K): Lens<S, S[K]> => {
  const get = (s: Partial<S>) => s[key]
  const set = <V extends S[K]>(value: V) => (state: Partial<S>) => ({ ...state, [key]: value })
  const modify = (f: (value: S[K]) => S[K]) => (state: Partial<S>) => {
    const currentValue = state[key]
    if (currentValue === undefined) return state
    return { ...state, [key]: f(currentValue) }
  }
  return { get, set, modify } as const
}

/**
 * Creates a builder lens for a specific field
 *
 * @since 0.3.0
 * @category constructors
 */
const createBuilderLens = <A, K extends keyof A>(key: K): BuilderLens<A>[K] => {
  const lens = createLens<A, K>(key)
  const setter = (value: A[K]) => lens.set(value)
  return Object.assign(setter, {
    get: lens.get,
    modify: lens.modify
  })
}

/**
 * Creates a builder lens for each field in the schema
 *
 * @since 0.3.0
 * @category constructors
 */
export const createBuilderLenses = <A>(schema: Schema.Struct<any>): BuilderLens<A> =>
  pipe(
    Object.entries(schema.fields),
    ReadonlyArray.reduce({} as BuilderLens<A>, (acc, [key]) => ({
      ...acc,
      [key]: createBuilderLens<A, keyof A>(key as keyof A)
    }))
  )

/**
 * Gets default values from schema annotations recursively
 *
 * @since 0.3.0
 * @category constructors
 */
const getSchemaDefaults = <A, F extends Schema.Struct.Fields>(schema: Schema.Struct<F>): Partial<A> => {
  // Get defaults from fields first
  const fieldDefaults = Object.entries(schema.fields).reduce((acc, [key, field]) => {
    const fieldDefault = SchemaAST.getDefaultAnnotation(field.ast).pipe(
      Option.getOrElse(() => undefined)
    )
    return fieldDefault ? { ...acc, [key]: fieldDefault } : acc
  }, {})

  // Get struct-level defaults
  const structDefaults = SchemaAST.getDefaultAnnotation(schema.ast).pipe(
    Option.getOrElse(() => ({}))
  )

  // Merge with struct defaults taking precedence
  return {
    ...(typeof fieldDefaults === "object" && fieldDefaults !== null ? fieldDefaults : {}),
    ...(typeof structDefaults === "object" && structDefaults !== null ? structDefaults : {})
  } as Partial<A>
}

/**
 * Creates a builder for constructing objects with runtime validation.
 *
 * @since 0.1.0
 * @category constructors
 * @example
 * import { Schema, Effect, pipe } from "effect"
 * import { define, compose } from "effect-builder/Builder"
 *
 * const UserSchema = Schema.Struct({
 *   name: Schema.String,
 * })
 *
 * const User = define(UserSchema)
 *
 * const result = Effect.gen(function* () {
 *   return yield* pipe(compose(User.name("John")), User.build)
 * }).pipe(Effect.runSync)
 *
 * console.log("Created user:", result)
 * // {
 */
export const define = <F extends Schema.Struct.Fields>(
  schema: Schema.Struct<F>,
  defaults?: Partial<SchemaType<F>>
): Builder<F, Schema.Schema.Context<F[keyof F]>> => {
  const lenses = createBuilderLenses<SchemaType<F>>(schema)

  // Get schema defaults first
  const schemaDefaults = getSchemaDefaults<SchemaType<F>, F>(schema)

  // Merge defaults, prioritizing schema defaults over builder defaults
  const mergedDefaults = {
    ...schemaDefaults, // Override with schema defaults
    ...defaults // Start with builder defaults
  }

  const builder: Builder<F, Schema.Schema.Context<F[keyof F]>> = {
    ...lenses,
    schema,
    Default: mergedDefaults,
    field: <K extends keyof SchemaType<F>>(key: K) => createLens<SchemaType<F>, K>(key),
    when: (predicate, ifTrue, ifFalse = (a) => a) => (a: Partial<SchemaType<F>>) =>
      predicate(a) ? ifTrue(a) : ifFalse(a),
    build: (transform) =>
      pipe(
        transform(mergedDefaults),
        Schema.decodeUnknown(schema),
        Effect.mapError((error) => new ValidationError({ message: `Schema validation failed: ${error}` }))
      )
  }

  return builder
}

/**
 * @since 0.1.0
 * @category combinators
 * @example
 * import { Schema, Effect, pipe } from "effect"
 * import { define, compose } from "effect-builder/Builder"
 *
 * const UserSchema = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Number,
 *   roles: Schema.Array(Schema.String).annotations({ default: ["user"] })
 * })
 *
 * const User = define(UserSchema)
 *
 * const result = Effect.gen(function* () {
 *   return yield* pipe(
 *      compose(
 *        User.name("John"),
 *        User.age(25),
 *        User.roles.modify((roles) => [...roles, "admin"])
 *      ),
 *      User.build
 *  )
 * }).pipe(Effect.runSync)
 *
 * console.log("Created user:", result)
 * // {
 * //   name: "John",
 * //   age: 25,
 * //   roles: ["admin"]
 * // }
 */
export const compose = <A>(...transforms: Array<Transform<A>>): Transform<A> => (a: Partial<A>) =>
  transforms.reduce(
    (acc: Partial<A>, transform) => transform(acc),
    a
  )
