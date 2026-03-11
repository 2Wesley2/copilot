import { type HydratedDocument,Types } from 'mongoose';

import { OperationDraft } from '../../../operation-draft.entity.js';

export interface MongooseOperationDraftPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly intent: string;
  readonly payload: unknown;
  readonly sessionId: Types.ObjectId;
  readonly status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type MongooseOperationDraftDocument = HydratedDocument<MongooseOperationDraftPersistence>;

export class MongooseOperationDraftMapper {
  toDomain(document: MongooseOperationDraftDocument): OperationDraft {
    return new OperationDraft({
      id: document._id.toHexString(),
      actorId: document.actorId.toHexString(),
      intent: document.intent,
      payload: document.payload,
      sessionId: document.sessionId.toHexString(),
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toPersistence(draft: OperationDraft): MongooseOperationDraftPersistence {
    return {
      _id: new Types.ObjectId(draft.id),
      actorId: new Types.ObjectId(draft.actorId),
      intent: draft.intent,
      payload: draft.payload,
      sessionId: new Types.ObjectId(draft.sessionId),
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }
}
