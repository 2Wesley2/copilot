import { Module } from '@nestjs/common';

import { AuditEventService } from './application/audit-event.service.js';
import { AuditEventMongoPersistenceModule } from './infrastructure/persistence/mongodb/audit-event-mongodb-persistence.module.js';
import { AuditEventController } from './presentation/http/audit-event.controller.js';

@Module({
  imports: [AuditEventMongoPersistenceModule],
  controllers: [AuditEventController],
  providers: [AuditEventService],
  exports: [AuditEventService],
})
export class AuditEventModule {}
