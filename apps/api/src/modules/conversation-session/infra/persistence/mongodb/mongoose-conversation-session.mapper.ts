import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import {
  type ConversationSession,
  createConversationSession,
} from '../../../conversation-session.entity.js';

export interface MongooseConversationSessionPersistence {
  readonly _id: Types.ObjectId;
  readonly actorId: Types.ObjectId;
  readonly metadata?: unknown;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type MongooseConversationSessionDocument =
  HydratedDocument<MongooseConversationSessionPersistence>;

export class MongooseConversationSessionMapper {
  toDomain(document: MongooseConversationSessionDocument): ConversationSession {
    return createConversationSession({
      id: document._id.toHexString(),
      actorId: document.actorId.toHexString(),
      ...(isNullish(document.metadata) ? {} : { metadata: document.metadata }),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toPersistence(session: ConversationSession): MongooseConversationSessionPersistence {
    return {
      _id: new Types.ObjectId(session.id),
      actorId: new Types.ObjectId(session.actorId),
      ...(isNullish(session.metadata) ? {} : { metadata: session.metadata }),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
