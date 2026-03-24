import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CONVERSATION_SESSION_REPOSITORY } from '../../../domain/conversation-session.repository.js';
import { ConversationSessionMapper } from './conversation-session.mapper.js';
import {
  CONVERSATION_SESSION_MODEL_NAME,
  conversationSessionSchema,
} from './conversation-session.schema.js';
import { ConversationSessionMongooseRepository } from './conversation-session-mongoose.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CONVERSATION_SESSION_MODEL_NAME, schema: conversationSessionSchema },
    ]),
  ],
  providers: [
    ConversationSessionMapper,
    ConversationSessionMongooseRepository,
    {
      provide: CONVERSATION_SESSION_REPOSITORY,
      useExisting: ConversationSessionMongooseRepository,
    },
  ],
  exports: [CONVERSATION_SESSION_REPOSITORY],
})
export class ConversationSessionMongoPersistenceModule {}
