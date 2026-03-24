import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import {
  type ConversationSession,
  createConversationSession,
} from '../../../domain/conversation-session.entity.js';
import type {
  ConversationSessionMongoDocument,
  ConversationSessionMongoPersistence,
} from './conversation-session.schema.js';

export class ConversationSessionMapper {
  public toDomain(document: ConversationSessionMongoDocument): ConversationSession {
    return createConversationSession({
      id: document._id.toHexString(),
      actorId: document.actorId.toHexString(),
      ...(isNullish(document.metadata) ? {} : { metadata: document.metadata }),
      ...(isNullish(document.endedAt) ? {} : { endedAt: document.endedAt }),
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  public toPersistence(session: ConversationSession): ConversationSessionMongoPersistence {
    return {
      _id: new Types.ObjectId(session.id),
      actorId: new Types.ObjectId(session.actorId),
      ...(isNullish(session.metadata) ? {} : { metadata: session.metadata }),
      ...(isNullish(session.endedAt) ? {} : { endedAt: session.endedAt }),
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
