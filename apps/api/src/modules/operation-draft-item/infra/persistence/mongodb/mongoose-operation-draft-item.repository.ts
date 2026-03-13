import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_MODELS } from '../../../../../mongodb/mongoose.schemas.js';
import type { OperationDraftItem } from '../../../operation-draft-item.entity.js';
import type { OperationDraftItemRepository } from '../../../operation-draft-item.repository.js';
import {
  type MongooseOperationDraftItemDocument,
  type MongooseOperationDraftItemMapper,
  type MongooseOperationDraftItemPersistence,
} from './mongoose-operation-draft-item.mapper.js';

@Injectable()
export class MongooseOperationDraftItemRepositoryAdapter implements OperationDraftItemRepository {
  public constructor(
    @InjectModel(MONGO_MODELS.names.operationDraftItem)
    private readonly operationDraftItemModel: Model<MongooseOperationDraftItemPersistence>,
    private readonly operationDraftItemMapper: MongooseOperationDraftItemMapper,
  ) {}

  public findById(itemId: string): AsyncResult<OperationDraftItem | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseOperationDraftItemDocument | null = await this.operationDraftItemModel
        .findById(itemId)
        .exec();

      if (document === null) {
        return null;
      }

      return this.operationDraftItemMapper.toDomain(document);
    });
  }

  public save(item: OperationDraftItem): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.operationDraftItemMapper.toPersistence(item);

      await this.operationDraftItemModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
