export class RuntimeError extends Error {
  /**
   * @param {unknown} cause
   */
  constructor(cause) {
    super('runtime error', { cause })
  }
}