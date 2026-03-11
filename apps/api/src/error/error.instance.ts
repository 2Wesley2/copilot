import { createError } from './error.factory.js';
import { DefaultErrorHandler } from './error.handler.js';
import type { ErrorHandlerContract } from './result.contract.js';

export const errorHandler: ErrorHandlerContract = new DefaultErrorHandler(createError);
