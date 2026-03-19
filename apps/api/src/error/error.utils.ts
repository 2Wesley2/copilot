import type { AsyncResult, Result } from './error.handler.js';
import { errorHandler } from './error.instance.js';

export function ensureError(value: unknown): Error {
  return errorHandler.normalize(value);
}

export function tryAsync<T>(fn: () => Promise<T>): AsyncResult<T, Error> {
  return errorHandler.fromPromise(fn);
}

export function toResultAsync<T, E extends Error>(result: Result<T, E>): AsyncResult<T, E> {
  return errorHandler.fromResult(result);
}
