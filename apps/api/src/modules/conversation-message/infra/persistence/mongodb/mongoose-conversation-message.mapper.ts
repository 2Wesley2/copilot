import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import { ConversationMessage } from '../../../conversation-message.entity.js';

export interface MongooseConversationMessagePersistence {
  readonly _id: Types.ObjectId;
  readonly actorId?: Types.ObjectId;
  readonly content: string;
  readonly role: 'SYSTEM' | 'USER' | 'ASSISTANT';
  readonly sessionId: Types.ObjectId;
  readonly streamed?: boolean;
  readonly createdAt: Date;
}

export type MongooseConversationMessageDocument =
  HydratedDocument<MongooseConversationMessagePersistence>;

export class MongooseConversationMessageMapper {
  toDomain(document: MongooseConversationMessageDocument): ConversationMessage {
    return new ConversationMessage({
      id: document._id.toHexString(),
      ...(isNullish(document.actorId) ? {} : { actorId: document.actorId.toHexString() }),
      content: document.content,
      role: document.role,
      sessionId: document.sessionId.toHexString(),
      ...(isNullish(document.streamed) ? {} : { streamed: document.streamed }),
      createdAt: document.createdAt,
    });
  }

  toPersistence(message: ConversationMessage): MongooseConversationMessagePersistence {
    return {
      _id: new Types.ObjectId(message.id),
      ...(isNullish(message.actorId) ? {} : { actorId: new Types.ObjectId(message.actorId) }),
      content: message.content,
      role: message.role,
      sessionId: new Types.ObjectId(message.sessionId),
      ...(isNullish(message.streamed) ? {} : { streamed: message.streamed }),
      createdAt: message.createdAt,
    };
  }
}
