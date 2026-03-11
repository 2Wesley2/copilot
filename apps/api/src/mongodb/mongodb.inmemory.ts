import { MongoMemoryServer } from 'mongodb-memory-server';

import { type AsyncResult, errorHandler } from '../error/index.js';

let memoryServerPromise: Promise<MongoMemoryServer> | null = null;

function createMemoryServerPromise(): Promise<MongoMemoryServer> {
  return Promise.resolve().then(() => MongoMemoryServer.create());
}

function getOrCreateMemoryServerPromise(): Promise<MongoMemoryServer> {
  memoryServerPromise ??= createMemoryServerPromise().catch((cause: unknown) => {
    memoryServerPromise = null;
    return Promise.reject(errorHandler.normalize(cause));
  });

  return memoryServerPromise;
}

export function getMemoryServer(): AsyncResult<MongoMemoryServer, Error> {
  return errorHandler.fromPromise(() => getOrCreateMemoryServerPromise());
}

export function stopInMemoryMongoServer(): AsyncResult<void, Error> {
  if (memoryServerPromise === null) {
    return errorHandler.okAsync(undefined);
  }

  const activeMemoryServerPromise = memoryServerPromise;

  return errorHandler
    .fromPromise(() => activeMemoryServerPromise)
    .andThen((memoryServer) => errorHandler.fromPromise(() => memoryServer.stop()))
    .map(() => {
      memoryServerPromise = null;
      return undefined;
    })
    .mapErr((error) => {
      memoryServerPromise = null;
      return error;
    });
}
