import { Module } from '@nestjs/common';

import { ConversationSessionService } from './conversation-session.service.js';
import { ConversationSessionController } from './http/conversation-session.controller.js';
import { ConversationSessionMongoPersistenceModule } from './infra/persistence/mongodb/conversation-session-mongodb-persistence.module.js';

@Module({
  imports: [ConversationSessionMongoPersistenceModule],
  controllers: [ConversationSessionController],
  providers: [ConversationSessionService],
  exports: [ConversationSessionService],
})
export class ConversationSessionModule {}
