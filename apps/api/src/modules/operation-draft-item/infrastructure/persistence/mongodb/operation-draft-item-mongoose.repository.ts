import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { OperationDraftItem } from '../../../domain/operation-draft-item.entity.js';
import type { OperationDraftItemRepository } from '../../../domain/operation-draft-item.repository.js';
import { OperationDraftItemMapper } from './operation-draft-item.mapper.js';
import {
  OPERATION_DRAFT_ITEM_MODEL_NAME,
  type OperationDraftItemMongoDocument,
  type OperationDraftItemMongoPersistence,
} from './operation-draft-item.schema.js';

@Injectable()
export class OperationDraftItemMongooseRepository implements OperationDraftItemRepository {
  public constructor(
    @InjectModel(OPERATION_DRAFT_ITEM_MODEL_NAME)
    private readonly operationDraftItemModel: Model<OperationDraftItemMongoPersistence>,
    private readonly operationDraftItemMapper: OperationDraftItemMapper,
  ) {}

  public findById(itemId: string): AsyncResult<OperationDraftItem | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: OperationDraftItemMongoDocument | null = await this.operationDraftItemModel
        .findById(itemId)
        .exec();

      if (isNullish(document)) {
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
