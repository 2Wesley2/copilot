import { Module, type Provider } from '@nestjs/common';

import { CONVERSATION_SESSION_REPOSITORY } from '../../../conversation-session.repository.js';
import { MongooseConversationSessionMapper } from './mongoose-conversation-session.mapper.js';
import { MongooseConversationSessionRepositoryAdapter } from './mongoose-conversation-session.repository.js';

const persistenceProviders: Provider[] = [
  MongooseConversationSessionMapper,
  MongooseConversationSessionRepositoryAdapter,
  {
    provide: CONVERSATION_SESSION_REPOSITORY,
    useExisting: MongooseConversationSessionRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [CONVERSATION_SESSION_REPOSITORY],
})
export class ConversationSessionMongoPersistenceModule {}
