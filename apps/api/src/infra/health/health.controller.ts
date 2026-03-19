import { Controller, Get } from '@nestjs/common';
import { HealthCheck, type HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

import { MongoReadinessHealthIndicator } from '../database/mongodb/connection/mongodb-readiness.health-indicator.js';

@Controller('health')
export class HealthController {
  public constructor(
    private readonly health: HealthCheckService,
    private readonly mongoReadinessHealthIndicator: MongoReadinessHealthIndicator,
  ) {}

  @Get('liveness')
  @HealthCheck()
  public liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => ({
        application: {
          status: 'up' as const,
        },
      }),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  public readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mongoReadinessHealthIndicator.isHealthy('mongodb')]);
  }
}
