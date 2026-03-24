import { Module } from '@nestjs/common';

import { ConversationMessageService } from './application/conversation-message.service.js';
import { ConversationMessageMongoPersistenceModule } from './infrastructure/persistence/mongodb/conversation-message-mongodb-persistence.module.js';
import { ConversationMessageController } from './presentation/http/conversation-message.controller.js';

@Module({
  imports: [ConversationMessageMongoPersistenceModule],
  controllers: [ConversationMessageController],
  providers: [ConversationMessageService],
  exports: [ConversationMessageService],
})
export class ConversationMessageModule {}
