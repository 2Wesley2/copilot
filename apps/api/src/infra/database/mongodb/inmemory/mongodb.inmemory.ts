import { MongoMemoryServer } from 'mongodb-memory-server';

import { type AsyncResult, errorHandler } from '../../../../error/index.js';

interface IdleInMemoryMongoServerState {
  readonly status: 'idle';
}

interface StartingInMemoryMongoServerState {
  readonly status: 'starting';
  readonly promise: Promise<MongoMemoryServer>;
}

interface StartedInMemoryMongoServerState {
  readonly status: 'started';
  readonly server: MongoMemoryServer;
}

interface StoppingInMemoryMongoServerState {
  readonly status: 'stopping';
  readonly promise: Promise<void>;
}

type InMemoryMongoServerState =
  | IdleInMemoryMongoServerState
  | StartingInMemoryMongoServerState
  | StartedInMemoryMongoServerState
  | StoppingInMemoryMongoServerState;

class InMemoryMongoServerManager {
  private static instance: InMemoryMongoServerManager | undefined;

  private state: InMemoryMongoServerState = {
    status: 'idle',
  };

  private constructor() {
    /* empty */
  }

  public static getInstance(): InMemoryMongoServerManager {
    InMemoryMongoServerManager.instance ??= new InMemoryMongoServerManager();

    return InMemoryMongoServerManager.instance;
  }

  public getMemoryServer(): AsyncResult<MongoMemoryServer, Error> {
    return errorHandler.fromPromise(() => this.getOrStartMemoryServer());
  }

  public stop(): AsyncResult<void, Error> {
    switch (this.state.status) {
      case 'idle': {
        return errorHandler.okAsync(undefined);
      }

      case 'stopping': {
        const stoppingPromise = this.state.promise;
        return errorHandler.fromPromise(() => stoppingPromise);
      }

      case 'started': {
        const activeServer = this.state.server;
        return errorHandler.fromPromise(() =>
          this.createStoppingPromise(Promise.resolve(activeServer)),
        );
      }

      case 'starting': {
        const startingPromise = this.state.promise;
        return errorHandler.fromPromise(() => this.createStoppingPromise(startingPromise));
      }
    }
  }

  private async createMemoryServerPromise(): Promise<MongoMemoryServer> {
    return MongoMemoryServer.create();
  }

  private getOrStartMemoryServer(): Promise<MongoMemoryServer> {
    switch (this.state.status) {
      case 'idle': {
        return this.createStartingPromise();
      }

      case 'starting': {
        const startingPromise = this.state.promise;
        return startingPromise;
      }

      case 'started': {
        const activeServer = this.state.server;
        return Promise.resolve(activeServer);
      }

      case 'stopping': {
        const stoppingPromise = this.state.promise;
        return stoppingPromise.then(() => this.getOrStartMemoryServer());
      }
    }
  }

  private createStartingPromise(): Promise<MongoMemoryServer> {
    const promise = this.createMemoryServerPromise()
      .then((server) => {
        if (this.state.status === 'starting' && this.state.promise === promise) {
          this.state = {
            status: 'started',
            server,
          };
        }

        return server;
      })
      .catch((cause: unknown) => {
        if (this.state.status === 'starting' && this.state.promise === promise) {
          this.state = {
            status: 'idle',
          };
        }

        return Promise.reject(errorHandler.normalize(cause));
      });

    this.state = {
      status: 'starting',
      promise,
    };

    return promise;
  }

  private createStoppingPromise(serverPromise: Promise<MongoMemoryServer>): Promise<void> {
    const promise = serverPromise
      .then((server) => server.stop())
      .then(() => {
        if (this.state.status === 'stopping' && this.state.promise === promise) {
          this.state = {
            status: 'idle',
          };
        }
      })
      .catch((cause: unknown) => {
        if (this.state.status === 'stopping' && this.state.promise === promise) {
          this.state = {
            status: 'idle',
          };
        }

        return Promise.reject(errorHandler.normalize(cause));
      });

    this.state = {
      status: 'stopping',
      promise,
    };

    return promise;
  }
}

export function getMemoryServer(): AsyncResult<MongoMemoryServer, Error> {
  return InMemoryMongoServerManager.getInstance().getMemoryServer();
}

export function stopInMemoryMongoServer(): AsyncResult<void, Error> {
  return InMemoryMongoServerManager.getInstance().stop();
}
