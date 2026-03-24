import { Types } from 'mongoose';

import type { OperationDraft } from '../../../domain/operation-draft.entity.js';
import { createOperationDraft } from '../../../domain/operation-draft.entity.js';
import type {
  OperationDraftMongoDocument,
  OperationDraftMongoPersistence,
} from './operation-draft.schema.js';

export class OperationDraftMapper {
  public toDomain(document: OperationDraftMongoDocument): OperationDraft {
    return createOperationDraft({
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

  public toPersistence(draft: OperationDraft): OperationDraftMongoPersistence {
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
