import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { ConversationMessage } from '../../../domain/conversation-message.entity.js';
import type { ConversationMessageRepository } from '../../../domain/conversation-message.repository.js';
import { CONVERSATION_MESSAGE_MODEL_NAME, type ConversationMessageMongoDocument, type ConversationMessageMongoPersistence } from './conversation-message.schema.js';
import { ConversationMessageMapper } from './conversation-message.mapper.js';

@Injectable()
export class ConversationMessageMongooseRepository implements ConversationMessageRepository {
  public constructor(
    @InjectModel(CONVERSATION_MESSAGE_MODEL_NAME)
    private readonly conversationMessageModel: Model<ConversationMessageMongoPersistence>,
    private readonly conversationMessageMapper: ConversationMessageMapper,
  ) {}

  public findById(messageId: string): AsyncResult<ConversationMessage | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: ConversationMessageMongoDocument | null =
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
