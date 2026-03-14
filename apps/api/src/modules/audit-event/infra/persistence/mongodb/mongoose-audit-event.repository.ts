import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../mongodb/mongoose.schemas.js';
import type { AuditEvent } from '../../../audit-event.entity.js';
import type { AuditEventRepository } from '../../../audit-event.repository.js';
import {
  type MongooseAuditEventDocument,
  type MongooseAuditEventMapper,
  type MongooseAuditEventPersistence,
} from './mongoose-audit-event.mapper.js';
import { isNullish } from '@copilot/shared';

@Injectable()
export class MongooseAuditEventRepositoryAdapter implements AuditEventRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.auditEvent)
    private readonly auditEventModel: Model<MongooseAuditEventPersistence>,
    private readonly auditEventMapper: MongooseAuditEventMapper,
  ) {}

  public findById(auditEventId: string): AsyncResult<AuditEvent | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseAuditEventDocument | null = await this.auditEventModel
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
