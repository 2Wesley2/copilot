import { Module, type Provider } from '@nestjs/common';

import { CONVERSATION_MESSAGE_REPOSITORY } from '../../../conversation-message.repository.js';
import { MongooseConversationMessageMapper } from './mongoose-conversation-message.mapper.js';
import { MongooseConversationMessageRepositoryAdapter } from './mongoose-conversation-message.repository.js';

const persistenceProviders: Provider[] = [
  MongooseConversationMessageMapper,
  MongooseConversationMessageRepositoryAdapter,
  {
    provide: CONVERSATION_MESSAGE_REPOSITORY,
    useExisting: MongooseConversationMessageRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [CONVERSATION_MESSAGE_REPOSITORY],
})
export class ConversationMessageMongoPersistenceModule {}
