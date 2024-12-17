import { Data, Effect, pipe, Schema } from "effect"

/**
 * @since 0.2.0
 * @category errors
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
}> {}

/**
 * @since 0.2.0
 * @category errors
 */
export class BuilderError extends Data.TaggedError("BuilderError") {}

/**
 * @since 0.2.0
 * @category models
 */
export type Transform<A> = (a: Partial<A>) => Effect.Effect<Partial<A>, never, never>

/**
 * @since 0.2.0
 * @category models
 */
export interface Builder<A, E, R> {
  readonly schema: Schema.Schema<A, E, R>
  readonly Default: Partial<A>
  readonly field: <K extends keyof A>(key: K) => {
    readonly set: <V extends A[K]>(value: V) => Transform<A>
    readonly modify: (f: (value: A[K] | undefined) => A[K]) => Transform<A>
    readonly get: (a: Partial<A>) => A[K] | undefined
  }
  readonly when: (
    predicate: (a: Partial<A>) => boolean,
    ifTrue: Transform<A>,
    ifFalse?: Transform<A>
  ) => Transform<A>
  readonly build: (transform: Transform<A>) => Effect.Effect<A, E | ValidationError, R>
}

/**
 * Creates a builder for constructing objects with runtime validation.
 *
 * @since 0.2.0
 * @category constructors
 */
export const define = <A, E, R>(
  schema: Schema.Schema<A, E, R>,
  defaults: Partial<A> = {} as Partial<A>
): Builder<A, E, R> => ({
  schema,
  Default: defaults,
  field: <K extends keyof A>(key: K) => ({
    set: <V extends A[K]>(value: V) => (a: Partial<A>) => Effect.succeed({ ...a, [key]: value }),
    modify: (f: (value: A[K] | undefined) => A[K]) => (a: Partial<A>) => Effect.succeed({ ...a, [key]: f(a[key]) }),
    get: (a: Partial<A>) => a[key]
  }),
  when: (predicate, ifTrue, ifFalse = Effect.succeed) => (a: Partial<A>) => predicate(a) ? ifTrue(a) : ifFalse(a),
  build: (transform) =>
    pipe(
      transform(defaults),
      Effect.flatMap((result) =>
        pipe(
          Schema.decodeUnknown(schema)(result),
          Effect.mapError((error) => new ValidationError({ message: `Schema validation failed: ${error}` }))
        )
      )
    )
})

/**
 * @since 0.2.0
 * @category combinators
 */
export const compose = <A>(...transforms: Array<Transform<A>>): Transform<A> => (a: Partial<A>) =>
  transforms.reduce(
    (effect, transform) => Effect.flatMap(effect, transform),
    Effect.succeed(a)
  )
