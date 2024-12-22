import { Data, Effect, pipe, Schema } from "effect"

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
export interface Builder<A, E, R> {
  readonly schema: Schema.Schema<A, E, R>
  readonly Default: Partial<A>
  readonly field: <K extends keyof A>(key: K) => Lens<A, A[K]>
  readonly when: (
    predicate: (a: Partial<A>) => boolean,
    ifTrue: Transform<A>,
    ifFalse?: Transform<A>
  ) => Transform<A>
  readonly build: (transform: Transform<A>) => Effect.Effect<A, E | ValidationError, R>
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
 * Creates a builder for constructing objects with runtime validation.
 *
 * @since 0.3.0
 * @category constructors
 */
export const define = <A, E, R>(
  schema: Schema.Schema<A, E, R>,
  defaults: Partial<A> = {} as Partial<A>
): Builder<A, E, R> => ({
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
})

/**
 * @since 0.3.0
 * @category combinators
 */
export const compose = <A>(...transforms: Array<Transform<A>>): Transform<A> => (a: Partial<A>) =>
  transforms.reduce(
    (acc, transform) => transform(acc),
    a
  )
