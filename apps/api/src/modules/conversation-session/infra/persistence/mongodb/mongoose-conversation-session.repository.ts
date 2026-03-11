import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_MODELS } from '../../../../../mongodb/mongoose.schemas.js';
import type { ConversationSession } from '../../../conversation-session.entity.js';
import type { ConversationSessionRepository } from '../../../conversation-session.repository.js';
import {
  type MongooseConversationSessionDocument,
  type MongooseConversationSessionMapper,
  type MongooseConversationSessionPersistence,
} from './mongoose-conversation-session.mapper.js';

@Injectable()
export class MongooseConversationSessionRepositoryAdapter
  implements ConversationSessionRepository
{
  constructor(
    @InjectModel(MONGO_MODELS.names.conversationSession)
    private readonly conversationSessionModel: Model<MongooseConversationSessionPersistence>,
    private readonly conversationSessionMapper: MongooseConversationSessionMapper,
  ) {}

  findById(sessionId: string): AsyncResult<ConversationSession | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseConversationSessionDocument | null =
        await this.conversationSessionModel.findById(sessionId).exec();

      if (document === null) {
        return null;
      }

      return this.conversationSessionMapper.toDomain(document);
    });
  }

  save(session: ConversationSession): AsyncResult<void, Error> {
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
