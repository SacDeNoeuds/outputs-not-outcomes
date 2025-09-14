import type { RuntimeError } from './runtime-error.js'

export declare const Result: ResultConstructor;

interface ResultConstructor {
  /**
     * A reference to the prototype.
     */
    readonly prototype: Result<unknown, unknown>;

    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used to resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <Reason, Value>(executor: (resolve: (value: Value | Result<Reason, Value>) => void, reject: (reason: Reason) => void) => void): Result<RuntimeError | Reason, Value>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    all<Results extends readonly unknown[] | []>(values: Results): Result<
      { -readonly [P in keyof Results]: ReasonOf<Results[P]>; }[keyof Results],
      { -readonly [P in keyof Results]: Awaited<Results[P]>; }
    >;

    // see: lib.es2015.iterable.d.ts
    all<Reason, Value>(values: Iterable<Value | PromiseLike<Value> | Result<Reason, Value>>): Promise<
      Result<Reason, Awaited<Value>[]>
    >;

    /**
     * Creates a Promise that is resolved with an array of results when all
     * of the provided Promises resolve or reject.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    allSettled<Results extends readonly unknown[] | []>(values: Results): Result<never, { -readonly [P in keyof Results]: SettledResult<ReasonOf<Results[P]>, Awaited<Results[P]>>; }>;

    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    race<T extends readonly unknown[] | []>(values: T): Result<ReasonOf<T[number]>, Awaited<T[number]>>;

    // see: lib.es2015.iterable.d.ts
    // race<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject(): Result<void, never>;
    reject<Reason>(reason: PromiseLike<Reason>): Result<Reason | RuntimeError, never>;
    reject<Reason>(reason: Reason): Result<Reason, never>;

    /**
     * Creates a new resolved promise.
     * @returns A resolved promise.
     */
    resolve(): Result<never, void>;
    /**
     * Creates a new resolved result for the provided value.
     * @param value A result.
     * @returns A result whose internal state matches the provided promise.
     */
    resolve<T>(value: PromiseLike<T>): Result<RuntimeError, Awaited<T>>;
    /**
     * Creates a new resolved promise for the provided value.
     * @param value A promise.
     * @returns A promise whose internal state matches the provided promise.
     */
    resolve<T>(value: T): Result<never, Awaited<T>>;

  withResolvers<Reason, Value>(): ResultWithResolvers<Reason, Value>
}

export interface ResultWithResolvers<Reason, Value> {
    result: Result<Reason, Value>;
    resolve: (value: Value | PromiseLike<Value>) => void;
    reject: (...args: ([void] extends [Reason] ? [] : [reason: Reason])) => void;
}

export type ReasonOf<T> = T extends null | undefined
  ? T
  : // special case for `null | undefined` when not in `--strictNullChecks` mode
  T extends object & { then(onfulfilled: any, onrejected: infer F): any; }
  ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
  F extends ((value: infer V, ...args: infer _) => any)
  ? // if the argument to `then` is callable, extracts the first argument
    ReasonOf<V>
  : // recursively unwrap the value
    never
  : // the argument to `then` was not callable
    T; // non-object or non-thenable

export interface FulfilledResult<Value> {
    status: "fulfilled";
    value: Value;
}

export interface RejectedResult<Reason> {
    status: "rejected";
    reason: Reason;
}

export type SettledResult<Reason, Value> = FulfilledResult<Value> | RejectedResult<Reason>;
    
export interface Result<Reason, Value> extends Promise<Value> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Result is resolved.
     * @param onrejected The callback to execute when the Result is rejected.
     * @returns A Result for the completion of which ever callback is executed.
     */
    then<Value1 = Value, Reason1 = never, Value2 = never, Reason2 = Reason>(
      onfulfilled?: ((value: Value) => Value1 | PromiseLike<Value1> | Result<Reason1, Value1>) | undefined | null,
      onrejected?: ((reason: Reason) => Value2 | PromiseLike<Value2> | Result<Reason2, Value2>) | undefined | null
    ): Result<RuntimeError | Reason1 | Reason2, Value1 | Value2>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<Value1 = never, Reason1 = never>(onrejected?: ((reason: Reason) => Value1 | PromiseLike<Value1> | Result<Reason1, Value1>) | undefined | null): Result<RuntimeError | Reason1, Value | Value1>;
}
