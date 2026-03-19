import type { Connection } from 'mongoose';

import type { MongoConnectionObserver } from './mongodb-composite-connection.observer.js';
import { type MongoReadinessStore } from './mongodb-readiness.store.js';

export class MongoReadinessObserver implements MongoConnectionObserver {
  public constructor(private readonly store: MongoReadinessStore) {}

  public onConnected(_connection: Connection): void {
    this.store.markConnected();
  }

  public onReconnected(_connection: Connection): void {
    this.store.markConnected();
  }

  public onDisconnected(_connection: Connection): void {
    this.store.markDisconnected();
  }

  public onClose(_connection: Connection): void {
    this.store.markDisconnected();
  }

  public onError(error: Error, _connection: Connection): void {
    this.store.markError(error);
  }
}

export const createMongoReadinessObserver = (store: MongoReadinessStore) =>
  new MongoReadinessObserver(store);
