import { createError } from './error.factory.js';
import { createDefaultErrorHandler, type ErrorHandlerContract } from './error.handler.js';

export const errorHandler: ErrorHandlerContract = createDefaultErrorHandler(createError);
