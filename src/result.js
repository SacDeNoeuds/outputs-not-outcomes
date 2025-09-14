import { RuntimeError } from './runtime-error.js'

export class Result extends Promise {
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
      onfulfilled && catchRuntimeError(onfulfilled),
      onrejected && catchRuntimeError(onrejected),
    )
  }
}

function catchRuntimeError(callback) {
  return (value) => {
    try {
      return callback(value)
    } catch (error) {
      return Result.reject(new RuntimeError(error))
    }
  }
}