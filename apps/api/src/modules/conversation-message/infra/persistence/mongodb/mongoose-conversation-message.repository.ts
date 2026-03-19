import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../infra/database/mongodb/mongoose/mongoose.schemas.js';
import type { ConversationMessage } from '../../../conversation-message.entity.js';
import type { ConversationMessageRepository } from '../../../conversation-message.repository.js';
import {
  type MongooseConversationMessageDocument,
  type MongooseConversationMessageMapper,
  type MongooseConversationMessagePersistence,
} from './mongoose-conversation-message.mapper.js';

@Injectable()
export class MongooseConversationMessageRepositoryAdapter implements ConversationMessageRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.conversationMessage)
    private readonly conversationMessageModel: Model<MongooseConversationMessagePersistence>,
    private readonly conversationMessageMapper: MongooseConversationMessageMapper,
  ) {}

  public findById(messageId: string): AsyncResult<ConversationMessage | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseConversationMessageDocument | null =
        await this.conversationMessageModel.findById(messageId).exec();

      if (isNullish(document)) {
        return null;
      }

      return this.conversationMessageMapper.toDomain(document);
    });
  }

  public save(message: ConversationMessage): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.conversationMessageMapper.toPersistence(message);

      await this.conversationMessageModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
