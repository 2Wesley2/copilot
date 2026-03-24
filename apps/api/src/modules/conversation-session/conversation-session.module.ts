import { Module } from '@nestjs/common';

import { ConversationSessionService } from './application/conversation-session.service.js';
import { ConversationSessionMongoPersistenceModule } from './infrastructure/persistence/mongodb/conversation-session-mongodb-persistence.module.js';
import { ConversationSessionController } from './presentation/http/conversation-session.controller.js';

@Module({
  imports: [ConversationSessionMongoPersistenceModule],
  controllers: [ConversationSessionController],
  providers: [ConversationSessionService],
  exports: [ConversationSessionService],
})
export class ConversationSessionModule {}
