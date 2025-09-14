import { RuntimeError } from "./runtime-error.js"

/**
 * @param {unknown} value
 * @returns {value is PromiseLike<any>}
 */
function isPromiseLike(value) {
  return (
    value &&
    typeof value === "object" &&
    "then" in value &&
    typeof value.then === "function"
  )
}
export class Result extends Promise {
  static resolve(value) {
    if (!isPromiseLike(value)) return super.resolve(value)
    return value.then(super.resolve, (error) =>
      super.reject(new RuntimeError(error)),
    )
  }

  static reject(value) {
    if (!isPromiseLike(value)) return super.reject(value)
    return value.then(super.reject, (error) =>
      super.reject(new RuntimeError(error)),
    )
  }

  constructor(executor) {
    super((resolve, reject) => {
      try {
        executor(resolve, reject)
      } catch (error) {
        reject(new RuntimeError(error))
      }
    })
  }
  then(onfulfilled, onrejected) {
    return super.then(
      onfulfilled && catchSyncRuntimeError(onfulfilled),
      onrejected && catchSyncRuntimeError(onrejected),
    )
  }
}

function catchSyncRuntimeError(callback) {
  return (value) => {
    try {
      const got = callback(value)
      if (!isPromiseLike(got)) return got
      return Result.resolve(got)
    } catch (error) {
      return Promise.reject(new RuntimeError(error))
    }
  }
}
