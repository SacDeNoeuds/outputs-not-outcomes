import assert from "node:assert"
import { Result } from "../src/result.js"
import { RuntimeError } from "../src/runtime-error"

async function it_captures_errors_in_constructor_executor() {
  const result = new Result<never, void>((resolve) => {
    // @ts-expect-error
    a.b.c
    resolve()
  })
  await assert.rejects(result, RuntimeError)
}

async function it_captures_errors_in_constructor_executor_resolve_promise_like() {
  const promiseLike = new Promise((_, reject) => reject('oops'))
  const result = new Result<never, void>((resolve) => {
    // @ts-expect-error
    resolve(promiseLike)
  })
  await assert.rejects(result, RuntimeError)
}

async function it_captures_errors_in_constructor_executor_reject_promise_like() {
  const promiseLike = new Promise((_, reject) => reject('oops'))
  const result = new Result<never, void>((_, reject) => {
    // @ts-expect-error
    reject(promiseLike)
  })
  await assert.rejects(result, RuntimeError)
}

async function it_captures_errors_in_then() {
  const result = Result.resolve(1).then(() => {
    // @ts-expect-error
    a.b.c
    return Result.resolve("one")
  })
  await assert.rejects(result, RuntimeError)
}

async function it_captures_errors_in_catch() {
  const result = Result.reject(1).catch(() => {
    // @ts-expect-error
    a.b.c
    return Result.resolve("one")
  })
  await assert.rejects(result, RuntimeError)
}

async function it_captures_error_in_resolve_promise_like() {
  const promise = new Promise((_, reject) => reject("oops"))
  const result = Result.resolve(promise)
  await assert.rejects(result, RuntimeError)
}

async function it_captures_error_in_reject_promise_like() {
  const promise = new Promise((_, reject) => reject("oops"))
  const result = Result.reject(promise)
  await assert.rejects(result, RuntimeError)
}

async function it_captures_error_in_returned_promise_like_in_then() {
  const promise = new Promise((_, reject) => reject("oops"))
  const result = Result.resolve(1).then(() => promise)
  await assert.rejects(result, RuntimeError)
}

async function it_captures_error_in_returned_promise_like_in_catch() {
  const promise = new Promise((_, reject) => reject("oops"))
  const result = Result.reject(1).catch(() => promise)
  await assert.rejects(result, RuntimeError)
}

const tests = [
  it_captures_errors_in_constructor_executor,
  // it_captures_errors_in_constructor_executor_resolve_promise_like,
  // it_captures_errors_in_constructor_executor_reject_promise_like,
  it_captures_errors_in_then,
  it_captures_errors_in_catch,
  it_captures_error_in_resolve_promise_like,
  it_captures_error_in_reject_promise_like,
  it_captures_error_in_returned_promise_like_in_then,
  it_captures_error_in_returned_promise_like_in_catch,
]
const filename = import.meta.filename
  .replace(import.meta.dirname, "")
  .slice(1, -3)

async function run_tests() {
  for (const test of tests) {
    console.info(">", test.name.replaceAll("_", " "))
    await test()
  }
  console.info()
}

run_tests().then(
  () => {
    console.info(filename, "– Tests passed ✅")
    process.exit(0)
  },
  (error) => {
    console.info(filename, "– Tests failed ❌")
    console.info()
    console.error(error)
    console.info()
    process.exit(1)
  },
)
