import { createError } from './error.factory.js';
import { createDefaultErrorHandler } from './error.handler.js';
import type { ErrorHandlerContract } from './result.contract.js';

export const errorHandler: ErrorHandlerContract = createDefaultErrorHandler(createError);
