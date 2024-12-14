import type { Schema } from "effect";
import { Data, Effect, pipe, Option } from "effect";

export type Transform<A> = (
  a: Partial<A>
) => Effect.Effect<Partial<A>, BuilderError>;

export class ValidationError extends Data.TaggedError("ValidationError")<{}> {}

export type BuilderError = ValidationError;

type ExtractKey<F, A> = F extends (value: any) => value is any
  ? never
  : F extends (value: infer V) => boolean
  ? { [K in keyof A]: A[K] extends V ? K : never }[keyof A]
  : never;

export const define = <A>(
  schema: Schema.Schema<A>,
  defaults: Partial<A> = {}
) => ({
  field:
    <K extends keyof A>(key: K, value: A[K]): Transform<A> =>
    (a) =>
      Effect.succeed({ ...a, ...defaults, [key]: value }),

  when:
    <F extends (value: any) => boolean>(
      predicate: F,
      transform: Transform<A>
    ): Transform<A> =>
    (a) => {
      const key = (Object.keys(a) as Array<keyof A>).find(
        (k) => typeof a[k] === typeof predicate.arguments
      ) as ExtractKey<F, A>;
      return Option.fromNullable(key ? a[key] : undefined).pipe(
        Option.map(predicate),
        Option.getOrElse(() => false)
      )
        ? transform(a)
        : Effect.succeed({ ...a, ...defaults });
    },

  compose:
    (...transforms: Array<Transform<A>>): Transform<A> =>
    (a) =>
      pipe(
        transforms,
        Effect.reduce({ ...a, ...defaults }, (acc, transform) => transform(acc))
      ),
});
