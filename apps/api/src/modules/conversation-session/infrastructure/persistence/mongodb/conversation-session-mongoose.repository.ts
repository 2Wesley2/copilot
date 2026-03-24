import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { ConversationSession } from '../../../domain/conversation-session.entity.js';
import type { ConversationSessionRepository } from '../../../domain/conversation-session.repository.js';
import { ConversationSessionMapper } from './conversation-session.mapper.js';
import {
  CONVERSATION_SESSION_MODEL_NAME,
  type ConversationSessionMongoDocument,
  type ConversationSessionMongoPersistence,
} from './conversation-session.schema.js';

@Injectable()
export class ConversationSessionMongooseRepository implements ConversationSessionRepository {
  public constructor(
    @InjectModel(CONVERSATION_SESSION_MODEL_NAME)
    private readonly conversationSessionModel: Model<ConversationSessionMongoPersistence>,
    private readonly conversationSessionMapper: ConversationSessionMapper,
  ) {}

  public findById(sessionId: string): AsyncResult<ConversationSession | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: ConversationSessionMongoDocument | null = await this.conversationSessionModel
        .findById(sessionId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.conversationSessionMapper.toDomain(document);
    });
  }

  public save(session: ConversationSession): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.conversationSessionMapper.toPersistence(session);

      await this.conversationSessionModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
