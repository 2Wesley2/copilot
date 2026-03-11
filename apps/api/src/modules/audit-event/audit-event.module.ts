import { Module } from '@nestjs/common';

import { AuditEventService } from './audit-event.service.js';
import { AuditEventController } from './http/audit-event.controller.js';
import { AuditEventMongoPersistenceModule } from './infra/persistence/mongodb/audit-event-mongodb-persistence.module.js';

@Module({
  imports: [AuditEventMongoPersistenceModule],
  controllers: [AuditEventController],
  providers: [AuditEventService],
  exports: [AuditEventService],
})
export class AuditEventModule {}
