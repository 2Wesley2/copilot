import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CONVERSATION_MESSAGE_REPOSITORY } from '../../../domain/conversation-message.repository.js';
import { CONVERSATION_MESSAGE_MODEL_NAME, ConversationMessageSchema } from './conversation-message.schema.js';
import { ConversationMessageMapper } from './conversation-message.mapper.js';
import { ConversationMessageMongooseRepository } from './conversation-message-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: CONVERSATION_MESSAGE_MODEL_NAME, schema: ConversationMessageSchema }])],
  providers: [
    ConversationMessageMapper,
    ConversationMessageMongooseRepository,
    {
      provide: CONVERSATION_MESSAGE_REPOSITORY,
      useExisting: ConversationMessageMongooseRepository,
    },
  ],
  exports: [CONVERSATION_MESSAGE_REPOSITORY],
})
export class ConversationMessageMongoPersistenceModule {}
