import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import {
  type ConversationMessage,
  createConversationMessage,
} from '../../../domain/conversation-message.entity.js';
import type {
  ConversationMessageMongoDocument,
  ConversationMessageMongoPersistence,
} from './conversation-message.schema.js';

export class ConversationMessageMapper {
  public toDomain(document: ConversationMessageMongoDocument): ConversationMessage {
    return createConversationMessage({
      id: document._id.toHexString(),
      ...(isNullish(document.actorId) ? {} : { actorId: document.actorId.toHexString() }),
      content: document.content,
      role: document.role,
      sessionId: document.sessionId.toHexString(),
      streamed: document.streamed,
      createdAt: document.createdAt,
    });
  }

  public toPersistence(message: ConversationMessage): ConversationMessageMongoPersistence {
    return {
      _id: new Types.ObjectId(message.id),
      ...(isNullish(message.actorId) ? {} : { actorId: new Types.ObjectId(message.actorId) }),
      content: message.content,
      role: message.role,
      sessionId: new Types.ObjectId(message.sessionId),
      streamed: message.streamed ?? false,
      createdAt: message.createdAt,
    };
  }
}
