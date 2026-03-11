import { Module } from '@nestjs/common';

import { ConversationMessageService } from './conversation-message.service.js';
import { ConversationMessageController } from './http/conversation-message.controller.js';
import { ConversationMessageMongoPersistenceModule } from './infra/persistence/mongodb/conversation-message-mongodb-persistence.module.js';

@Module({
  imports: [ConversationMessageMongoPersistenceModule],
  controllers: [ConversationMessageController],
  providers: [ConversationMessageService],
  exports: [ConversationMessageService],
})
export class ConversationMessageModule {}
