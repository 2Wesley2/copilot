export interface MongoReadinessSnapshot {
  readonly version: number;
  readonly connected: boolean;
  readonly lastErrorMessage?: string;
}

function createMongoReadinessSnapshot(
  snapshot: MongoReadinessSnapshot,
): Readonly<MongoReadinessSnapshot> {
  return Object.freeze(snapshot);
}

export class MongoReadinessStore {
  private state: Readonly<MongoReadinessSnapshot> = createMongoReadinessSnapshot({
    version: 0,
    connected: false,
  });

  public markConnected(): void {
    this.state = createMongoReadinessSnapshot({
      version: this.state.version + 1,
      connected: true,
    });
  }

  public markDisconnected(): void {
    this.state = createMongoReadinessSnapshot({
      version: this.state.version + 1,
      connected: false,
    });
  }

  public markError(error: Error): void {
    this.state = createMongoReadinessSnapshot({
      version: this.state.version + 1,
      connected: false,
      lastErrorMessage: error.message,
    });
  }

  public getSnapshot(): Readonly<MongoReadinessSnapshot> {
    return this.state;
  }
}

export const createMongoReadinessStore = () => new MongoReadinessStore();
