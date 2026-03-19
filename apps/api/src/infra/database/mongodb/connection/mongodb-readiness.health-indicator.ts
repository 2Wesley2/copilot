import { isNullish } from '@copilot/shared';
import { Inject, Injectable } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { MONGO_READINESS_STORE } from './mongodb-readiness.constants.js';
import type { MongoReadinessStore } from './mongodb-readiness.store.js';

@Injectable()
export class MongoReadinessHealthIndicator {
  public constructor(
    @Inject(MONGO_READINESS_STORE)
    private readonly store: MongoReadinessStore,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  public isHealthy(key = 'mongodb'): HealthIndicatorResult {
    const snapshot = this.store.getSnapshot();
    const indicator = this.healthIndicatorService.check(key);

    if (!snapshot.connected) {
      return indicator.down({
        connected: snapshot.connected,
        version: snapshot.version,
        ...(isNullish(snapshot.lastErrorMessage)
          ? {}
          : { lastErrorMessage: snapshot.lastErrorMessage }),
      });
    }

    return indicator.up({
      connected: snapshot.connected,
      version: snapshot.version,
    });
  }
}
