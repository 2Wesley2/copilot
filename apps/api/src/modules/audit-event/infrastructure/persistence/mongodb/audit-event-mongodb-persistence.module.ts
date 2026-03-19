import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AUDIT_EVENT_REPOSITORY } from '../../../domain/audit-event.repository.js';
import { AUDIT_EVENT_MODEL_NAME, AuditEventSchema } from './audit-event.schema.js';
import { AuditEventMapper } from './audit-event.mapper.js';
import { AuditEventMongooseRepository } from './audit-event-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: AUDIT_EVENT_MODEL_NAME, schema: AuditEventSchema }])],
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
