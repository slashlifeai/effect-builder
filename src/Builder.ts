import { Data, Effect, pipe, Schema } from "effect"
import * as ReadonlyArray from "effect/Array"

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
export interface Builder<A, F extends Schema.Struct.Fields> {
  readonly schema: Schema.Struct<F>
  readonly Default: Partial<A>
  readonly field: <K extends keyof A>(key: K) => Lens<A, A[K]>
  readonly when: (
    predicate: (a: Partial<A>) => boolean,
    ifTrue: Transform<A>,
    ifFalse?: Transform<A>
  ) => Transform<A>
  readonly build: (transform: Transform<A>) => Effect.Effect<A, ValidationError>
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
const createBuilderLenses = <A extends Schema.Struct.Fields>(schema: Schema.Struct<A>): BuilderLens<A> => {
  return pipe(
    Object.entries(schema.fields),
    ReadonlyArray.reduce(
      {} as BuilderLens<A>,
      (acc: BuilderLens<A>, [key, _field]: [keyof A, any]) => ({
        ...acc,
        [key]: createBuilderLens<A, keyof A>(key)
      })
    )
  )
}

/**
 * Creates a builder for constructing objects with runtime validation.
 *
 * @since 0.3.0
 * @category constructors
 */
export const define = <A, F extends Schema.Struct.Fields>(
  schema: Schema.Struct<F>,
  defaults: Partial<A> = {} as Partial<A>
): Builder<A, F> & BuilderLens<A> => {
  const lenses = createBuilderLenses(schema)
  // @ts-ignore no idea how to make this type check work
  return {
    ...lenses,
    schema,
    Default: defaults,
    field: <K extends keyof A>(key: K) => createLens<A, K>(key),
    when: (predicate, ifTrue, ifFalse = (a) => a) => (a: Partial<A>) => predicate(a) ? ifTrue(a) : ifFalse(a),
    build: (transform) =>
      pipe(
        transform(defaults),
        (result) =>
          pipe(
            Schema.decodeUnknown(schema)(result),
            Effect.mapError((error) => new ValidationError({ message: `Schema validation failed: ${error}` }))
          )
      )
  }
}

/**
 * @since 0.3.0
 * @category combinators
 */
export const compose = <A>(...transforms: Array<Transform<A>>): Transform<A> => (a: Partial<A>) =>
  transforms.reduce(
    (acc: Partial<A>, transform) => transform(acc),
    a
  )
