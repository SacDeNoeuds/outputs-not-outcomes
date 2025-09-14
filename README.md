# outputs-not-outcomes

Using Javascript Promises as Results

## Install

```sh
npm i -S outputs-not-outcomes
```

## Usage

This package is to be used _exactly_ like `Promise`, the only difference being the typing of errors.

### Constructing a type-safe result

```ts
const result = new Result<MyCustomError, MyResult>((success, failure) => {
  success('my success here')
  // or
  failure(new MyCustomError())
})

const resolved = Result.resolve(1) // Result<never, number>

const rejected = Result.reject(1) // Result<number, never>
```

### Building pipelines

See [register.ts](https://github.com/SacDeNoeuds/outputs-not-outcomes/blob/main/spec/register.ts), roughly:
```ts
function register(email: string, password: string) {
  return validatePassword(password) // sync check
    .then(() => validateEmail(email))
    .then(() => assertNoAccountExistsWithEmail(email)) // async check
    .then(() => createAccount(email, password)) // async task
}
```

## FAQ

### Why do I sometimes have `RuntimeError` and sometimes not ?

It depends on how you constructed the result. For instance, `Result.resolve(1)` is entirely safe, there's no chance a type error or whatever would slip in the `1` statement.

However when resolving a `Result` from a `Promise` (or `PromiseLike`), we have no guarantee that the underlying `Promise` or `PromiseLike` does not embed any runtime error. Since there's a risk, there's a possibility. Therefore is it is typed.

What can introduce a runtime error:
- `new Result((resolve, reject) => { … })` -> the function body may contain a runtime error.
- `Result.resolve(promiseLike)` -> `promiseLike` may contain a runtime error.
- `Result.reject(promiseLike)` -> `promiseLike` may contain a runtime error.
- `myResult.then(a, b)` -> `a` or `b` function bodies may contain a runtime error.
- `myResult.catch(cb)` -> `cb` function body may contain a runtime error.