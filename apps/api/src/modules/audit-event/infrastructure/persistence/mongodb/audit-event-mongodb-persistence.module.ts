import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AUDIT_EVENT_REPOSITORY } from '../../../domain/audit-event.repository.js';
import { AuditEventMapper } from './audit-event.mapper.js';
import { AUDIT_EVENT_MODEL_NAME, auditEventSchema } from './audit-event.schema.js';
import { AuditEventMongooseRepository } from './audit-event-mongoose.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AUDIT_EVENT_MODEL_NAME, schema: auditEventSchema }]),
  ],
  providers: [
    AuditEventMapper,
    AuditEventMongooseRepository,
    {
      provide: AUDIT_EVENT_REPOSITORY,
      useExisting: AuditEventMongooseRepository,
    },
  ],
  exports: [AUDIT_EVENT_REPOSITORY],
})
export class AuditEventMongoPersistenceModule {}
