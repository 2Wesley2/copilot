import type { Connection } from 'mongoose';

export interface MongoConnectionObserver {
  onConnecting?(connection: Connection): void;
  onConnected?(connection: Connection): void;
  onOpen?(connection: Connection): void;
  onDisconnecting?(connection: Connection): void;
  onDisconnected?(connection: Connection): void;
  onClose?(connection: Connection): void;
  onReconnected?(connection: Connection): void;
  onError?(error: Error, connection: Connection): void;
}

export class CompositeMongoConnectionObserver implements MongoConnectionObserver {
  public constructor(private readonly observers: readonly MongoConnectionObserver[]) {}

  public onConnecting(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onConnecting?.(connection);
    }
  }

  public onConnected(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onConnected?.(connection);
    }
  }

  public onOpen(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onOpen?.(connection);
    }
  }

  public onDisconnecting(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onDisconnecting?.(connection);
    }
  }

  public onDisconnected(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onDisconnected?.(connection);
    }
  }

  public onClose(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onClose?.(connection);
    }
  }

  public onReconnected(connection: Connection): void {
    for (const observer of this.observers) {
      observer.onReconnected?.(connection);
    }
  }

  public onError(error: Error, connection: Connection): void {
    for (const observer of this.observers) {
      observer.onError?.(error, connection);
    }
  }
}

export const createCompositeMongoConnectionObserver = (
  observers: readonly MongoConnectionObserver[],
) => new CompositeMongoConnectionObserver(observers);
