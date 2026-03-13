import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_MODELS } from '../../../../../mongodb/mongoose.schemas.js';
import type { OperationDraft } from '../../../operation-draft.entity.js';
import type { OperationDraftRepository } from '../../../operation-draft.repository.js';
import {
  type MongooseOperationDraftDocument,
  type MongooseOperationDraftMapper,
  type MongooseOperationDraftPersistence,
} from './mongoose-operation-draft.mapper.js';

@Injectable()
export class MongooseOperationDraftRepositoryAdapter implements OperationDraftRepository {
  public constructor(
    @InjectModel(MONGO_MODELS.names.operationDraft)
    private readonly operationDraftModel: Model<MongooseOperationDraftPersistence>,
    private readonly operationDraftMapper: MongooseOperationDraftMapper,
  ) {}

  public findById(draftId: string): AsyncResult<OperationDraft | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseOperationDraftDocument | null = await this.operationDraftModel
        .findById(draftId)
        .exec();

      if (document === null) {
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
