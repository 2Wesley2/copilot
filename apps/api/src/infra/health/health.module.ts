import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { MongoReadinessHealthIndicator } from '../database/mongodb/connection/mongodb-readiness.health-indicator.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [MongoReadinessHealthIndicator],
})
export class HealthModule {}
