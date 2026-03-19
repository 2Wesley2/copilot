import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import { createDraftDecision, type DraftDecision } from '../../../domain/draft-decision.entity.js';

import type { DraftDecisionMongoDocument, DraftDecisionMongoPersistence } from './draft-decision.schema.js';

export class DraftDecisionMapper {
  public toDomain(document: DraftDecisionMongoDocument): DraftDecision {
    return createDraftDecision({
      id: document._id.toHexString(),
      actorId: document.actorId.toHexString(),
      approved: document.decisionType === 'APPROVED',
      draftId: document.draftId.toHexString(),
      ...(isNullish(document.decisionPayload) ? {} : { reason: document.decisionPayload }),
      createdAt: document.decidedAt,
    });
  }

  public toPersistence(decision: DraftDecision): DraftDecisionMongoPersistence {
    return {
      _id: new Types.ObjectId(decision.id),
      actorId: new Types.ObjectId(decision.actorId),
      decisionType: decision.approved ? 'APPROVED' : 'REJECTED',
      draftId: new Types.ObjectId(decision.draftId),
      ...(isNullish(decision.reason) ? {} : { decisionPayload: decision.reason }),
      decidedAt: decision.createdAt,
      isFinal: true,
    };
  }
}
