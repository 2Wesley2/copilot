import type { Connection } from 'mongoose';

import type { MongoConnectionObserver } from './mongodb-composite-connection.observer.js';

export class MongoLoggingObserver implements MongoConnectionObserver {
  public onConnecting(connection: Connection): void {
    console.info(`[mongodb] connecting (${connection.name})`);
  }

  public onConnected(connection: Connection): void {
    console.info(`[mongodb] connected (${connection.name})`);
  }

  public onOpen(connection: Connection): void {
    console.info(`[mongodb] open (${connection.name})`);
  }

  public onDisconnecting(connection: Connection): void {
    console.warn(`[mongodb] disconnecting (${connection.name})`);
  }

  public onDisconnected(connection: Connection): void {
    console.error(`[mongodb] disconnected (${connection.name})`);
  }

  public onClose(connection: Connection): void {
    console.warn(`[mongodb] close (${connection.name})`);
  }

  public onReconnected(connection: Connection): void {
    console.info(`[mongodb] reconnected (${connection.name})`);
  }

  public onError(error: Error, connection: Connection): void {
    console.error(`[mongodb] error (${connection.name}): ${error.message}`);
  }
}

export const createMongoLoggingObserver = () => new MongoLoggingObserver();
