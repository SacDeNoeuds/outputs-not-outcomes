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
    if (value instanceof Result) return value
    return new Result((resolve, reject) => {
      if (!isPromiseLike(value)) resolve(value)
      else value.then(resolve, (error) => reject(new RuntimeError(error)))
    })
  }

  static reject(value) {
    if (value instanceof Result) return value
    return new Result((_, reject) => {
      if (!isPromiseLike(value)) reject(value)
      else value.then(reject, (error) => reject(new RuntimeError(error)))
    })
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
      return Result.resolve(callback(value))
    } catch (error) {
      return Promise.reject(new RuntimeError(error))
    }
  }
}
