import { MongoMemoryServer } from 'mongodb-memory-server';

import { type AsyncResult, errorHandler } from '../error/index.js';

class InMemoryMongoServerManager {
  private static instance: InMemoryMongoServerManager | undefined;

  private memoryServerPromise: Promise<MongoMemoryServer> | null = null;

  private constructor() {
    /* empty */
  }

  public static getInstance(): InMemoryMongoServerManager {
    InMemoryMongoServerManager.instance ??= new InMemoryMongoServerManager();
    return InMemoryMongoServerManager.instance;
  }

  private async createMemoryServerPromise(): Promise<MongoMemoryServer> {
    return Promise.resolve().then(() => MongoMemoryServer.create());
  }

  private getOrCreateMemoryServerPromise(): Promise<MongoMemoryServer> {
    this.memoryServerPromise ??= this.createMemoryServerPromise().catch((cause: unknown) => {
      this.memoryServerPromise = null;
      return Promise.reject(errorHandler.normalize(cause));
    });

    return this.memoryServerPromise;
  }

  public getMemoryServer(): AsyncResult<MongoMemoryServer, Error> {
    return errorHandler.fromPromise(() => this.getOrCreateMemoryServerPromise());
  }

  public stop(): AsyncResult<void, Error> {
    if (this.memoryServerPromise === null) {
      return errorHandler.okAsync(undefined);
    }

    const activeMemoryServerPromise = this.memoryServerPromise;

    return errorHandler
      .fromPromise(() => activeMemoryServerPromise)
      .andThen((memoryServer) => errorHandler.fromPromise(() => memoryServer.stop()))
      .map(() => {
        this.memoryServerPromise = null;
        return undefined;
      })
      .mapErr((error) => {
        this.memoryServerPromise = null;
        return error;
      });
  }
}

const inMemoryMongoServerManager = InMemoryMongoServerManager.getInstance();

export function getMemoryServer(): AsyncResult<MongoMemoryServer, Error> {
  return inMemoryMongoServerManager.getMemoryServer();
}

export function stopInMemoryMongoServer(): AsyncResult<void, Error> {
  return inMemoryMongoServerManager.stop();
}
