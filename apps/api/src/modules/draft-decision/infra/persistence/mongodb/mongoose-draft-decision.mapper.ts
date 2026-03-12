import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import { createDraftDecision, type DraftDecision } from '../../../draft-decision.entity.js';

export interface MongooseDraftDecisionPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly approved: boolean;
  readonly draftId: Types.ObjectId;
  readonly reason?: unknown;
  readonly createdAt: Date;
}

export type MongooseDraftDecisionDocument = HydratedDocument<MongooseDraftDecisionPersistence>;

export class MongooseDraftDecisionMapper {
  toDomain(document: MongooseDraftDecisionDocument): DraftDecision {
    return createDraftDecision({
      id: document._id.toHexString(),
      actorId: document.actorId.toHexString(),
      approved: document.approved,
      draftId: document.draftId.toHexString(),
      ...(isNullish(document.reason) ? {} : { reason: document.reason }),
      createdAt: document.createdAt,
    });
  }

  toPersistence(decision: DraftDecision): MongooseDraftDecisionPersistence {
    return {
      _id: new Types.ObjectId(decision.id),
      actorId: new Types.ObjectId(decision.actorId),
      approved: decision.approved,
      draftId: new Types.ObjectId(decision.draftId),
      ...(isNullish(decision.reason) ? {} : { reason: decision.reason }),
      createdAt: decision.createdAt,
    };
  }
}
