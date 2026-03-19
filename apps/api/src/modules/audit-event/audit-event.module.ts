import { Module } from '@nestjs/common';

import { AuditEventService } from './application/audit-event.service.js';
import { AuditEventController } from './presentation/http/audit-event.controller.js';
import { AuditEventMongoPersistenceModule } from './infrastructure/persistence/mongodb/audit-event-mongodb-persistence.module.js';

@Module({
  imports: [AuditEventMongoPersistenceModule],
  controllers: [AuditEventController],
  providers: [AuditEventService],
  exports: [AuditEventService],
})
export class AuditEventModule {}
