import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { AuditEvent } from '../../../domain/audit-event.entity.js';
import type { AuditEventRepository } from '../../../domain/audit-event.repository.js';
import { AUDIT_EVENT_MODEL_NAME, type AuditEventMongoDocument, type AuditEventMongoPersistence } from './audit-event.schema.js';
import { AuditEventMapper } from './audit-event.mapper.js';

@Injectable()
export class AuditEventMongooseRepository implements AuditEventRepository {
  public constructor(
    @InjectModel(AUDIT_EVENT_MODEL_NAME)
    private readonly auditEventModel: Model<AuditEventMongoPersistence>,
    private readonly auditEventMapper: AuditEventMapper,
  ) {}

  public findById(auditEventId: string): AsyncResult<AuditEvent | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: AuditEventMongoDocument | null = await this.auditEventModel
        .findById(auditEventId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.auditEventMapper.toDomain(document);
    });
  }

  public save(event: AuditEvent): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.auditEventMapper.toPersistence(event);

      await this.auditEventModel.create(persistence);
    });
  }
}
