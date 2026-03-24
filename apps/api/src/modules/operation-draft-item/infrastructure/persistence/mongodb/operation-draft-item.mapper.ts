import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import type { OperationDraftItem } from '../../../domain/operation-draft-item.entity.js';
import { createOperationDraftItem } from '../../../domain/operation-draft-item.entity.js';
import type {
  OperationDraftItemMongoDocument,
  OperationDraftItemMongoPersistence,
} from './operation-draft-item.schema.js';

export class OperationDraftItemMapper {
  public toDomain(document: OperationDraftItemMongoDocument): OperationDraftItem {
    return createOperationDraftItem({
      id: document._id.toHexString(),
      action: document.action,
      draftId: document.draftId.toHexString(),
      payload: document.payload,
      position: document.position,
      ...(isNullish(document.productId) ? {} : { productId: document.productId.toHexString() }),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      validationStatus: document.validationStatus,
    });
  }

  public toPersistence(item: OperationDraftItem): OperationDraftItemMongoPersistence {
    return {
      _id: new Types.ObjectId(item.id),
      action: item.action,
      draftId: new Types.ObjectId(item.draftId),
      payload: item.payload,
      position: item.position,
      ...(isNullish(item.productId) ? {} : { productId: new Types.ObjectId(item.productId) }),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      validationStatus: item.validationStatus,
    };
  }
}
