import { Result } from '../src/result'

class MyCustomError {}
interface MyResult {}
declare const myResult: MyResult

const result = new Result<MyCustomError, MyResult>((success, failure) => {
  success(myResult)
  // or
  failure(new MyCustomError())
})
// Result<MyCustomError | RuntimeError, MyResult>

declare const promiseLikeOfNumber: PromiseLike<number>

const resolved_1 = Result.resolve(1) // Result<never, number>
const resolved_2 = Result.resolve(promiseLikeOfNumber) // Result<RuntimeError, T> -> a runtime might slip in `somePromiseLike`.

const rejected_1 = Result.reject(1) // Result<number, never>
const rejected_2 = Result.reject(promiseLikeOfNumber) // Result<number | RuntimeError, never>