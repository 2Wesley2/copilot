import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import {
  createOperationDraftItem,
  type OperationDraftItem,
} from '../../../operation-draft-item.entity.js';

export interface MongooseOperationDraftItemPersistence {
  readonly _id: Types.ObjectId;
  readonly action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  readonly draftId: Types.ObjectId;
  readonly payload: unknown;
  readonly position: number;
  readonly productId?: Types.ObjectId;
  readonly createdAt: Date;
}

export type MongooseOperationDraftItemDocument =
  HydratedDocument<MongooseOperationDraftItemPersistence>;

export class MongooseOperationDraftItemMapper {
  public toDomain(document: MongooseOperationDraftItemDocument): OperationDraftItem {
    return createOperationDraftItem({
      id: document._id.toHexString(),
      action: document.action,
      draftId: document.draftId.toHexString(),
      payload: document.payload,
      position: document.position,
      ...(isNullish(document.productId) ? {} : { productId: document.productId.toHexString() }),
      createdAt: document.createdAt,
    });
  }

  public toPersistence(item: OperationDraftItem): MongooseOperationDraftItemPersistence {
    return {
      _id: new Types.ObjectId(item.id),
      action: item.action,
      draftId: new Types.ObjectId(item.draftId),
      payload: item.payload,
      position: item.position,
      ...(isNullish(item.productId) ? {} : { productId: new Types.ObjectId(item.productId) }),
      createdAt: item.createdAt,
    };
  }
}
