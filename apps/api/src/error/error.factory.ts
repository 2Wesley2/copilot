export type ErrorFactory = (message: string) => Error;

export const createError: ErrorFactory = (message) => new Error(message);
