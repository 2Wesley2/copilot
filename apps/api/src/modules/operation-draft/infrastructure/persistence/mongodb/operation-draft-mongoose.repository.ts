import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { OperationDraft } from '../../../domain/operation-draft.entity.js';
import type { OperationDraftRepository } from '../../../domain/operation-draft.repository.js';
import { OperationDraftMapper } from './operation-draft.mapper.js';
import {
  OPERATION_DRAFT_MODEL_NAME,
  type OperationDraftMongoDocument,
  type OperationDraftMongoPersistence,
} from './operation-draft.schema.js';

@Injectable()
export class OperationDraftMongooseRepository implements OperationDraftRepository {
  public constructor(
    @InjectModel(OPERATION_DRAFT_MODEL_NAME)
    private readonly operationDraftModel: Model<OperationDraftMongoPersistence>,
    private readonly operationDraftMapper: OperationDraftMapper,
  ) {}

  public findById(draftId: string): AsyncResult<OperationDraft | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: OperationDraftMongoDocument | null = await this.operationDraftModel
        .findById(draftId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.operationDraftMapper.toDomain(document);
    });
  }

  public save(draft: OperationDraft): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.operationDraftMapper.toPersistence(draft);

      await this.operationDraftModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
