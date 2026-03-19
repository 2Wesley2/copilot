export { createError, type ErrorFactory } from './error.factory.js';
export type {
  AsyncResult,
  AsyncResultContract,
  ErrorHandlerContract,
  Result,
  ResultContract,
} from './error.handler.js';
export { AsyncResultImpl, DefaultErrorHandler, ErrResult, OkResult } from './error.handler.js';
export { errorHandler } from './error.instance.js';
export { ensureError, toResultAsync, tryAsync } from './error.utils.js';
