export class RuntimeError extends Error {
  constructor(readonly cause: unknown)
}