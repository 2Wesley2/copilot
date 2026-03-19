import type { Connection } from 'mongoose';

import {
  createCompositeMongoConnectionObserver,
  type MongoConnectionObserver,
} from './mongodb-composite-connection.observer.js';
import { createMongoLoggingObserver } from './mongodb-logging.observer.js';
import { createMongoReadinessObserver } from './mongodb-readiness.observer.js';
import { createMongoReadinessStore, type MongoReadinessStore } from './mongodb-readiness.store.js';

export interface MongoConnectionPolicy {
  apply(connection: Connection): Connection;
}

export class DefaultMongoConnectionPolicy implements MongoConnectionPolicy {
  public constructor(private readonly observer: MongoConnectionObserver) {}

  public apply(connection: Connection): Connection {
    connection.on('connecting', () => {
      this.observer.onConnecting?.(connection);
    });

    connection.on('connected', () => {
      this.observer.onConnected?.(connection);
    });

    connection.on('open', () => {
      this.observer.onOpen?.(connection);
    });

    connection.on('disconnecting', () => {
      this.observer.onDisconnecting?.(connection);
    });

    connection.on('disconnected', () => {
      this.observer.onDisconnected?.(connection);
    });

    connection.on('close', () => {
      this.observer.onClose?.(connection);
    });

    connection.on('reconnected', () => {
      this.observer.onReconnected?.(connection);
    });

    connection.on('error', (error: Error) => {
      this.observer.onError?.(error, connection);
    });

    return connection;
  }
}

export interface MongoConnectionInfrastructure {
  readonly policy: MongoConnectionPolicy;
  readonly readinessStore: MongoReadinessStore;
}

export const createDefaultMongoConnectionPolicy = (observer: MongoConnectionObserver) =>
  new DefaultMongoConnectionPolicy(observer);

export function createMongoConnectionInfrastructure(): MongoConnectionInfrastructure {
  const readinessStore = createMongoReadinessStore();

  const observer = createCompositeMongoConnectionObserver([
    createMongoLoggingObserver(),
    createMongoReadinessObserver(readinessStore),
  ]);

  return {
    policy: createDefaultMongoConnectionPolicy(observer),
    readinessStore,
  };
}
