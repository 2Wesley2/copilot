import { Module } from '@nestjs/common';

import { AUDIT_EVENT_REPOSITORY } from '../../../audit-event.repository.js';
import { MongooseAuditEventMapper } from './mongoose-audit-event.mapper.js';
import { MongooseAuditEventRepositoryAdapter } from './mongoose-audit-event.repository.js';

@Module({
  providers: [
    MongooseAuditEventMapper,
    MongooseAuditEventRepositoryAdapter,
    {
      provide: AUDIT_EVENT_REPOSITORY,
      useExisting: MongooseAuditEventRepositoryAdapter,
    },
  ],
  exports: [AUDIT_EVENT_REPOSITORY],
})
export class AuditEventMongoPersistenceModule {}
