import type { AsyncResult } from '../../../error/index.js';
import type { ConversationMessage } from './conversation-message.entity.js';

export const CONVERSATION_MESSAGE_REPOSITORY = Symbol('CONVERSATION_MESSAGE_REPOSITORY');

export interface ConversationMessageRepository {
  findById(id: string): AsyncResult<ConversationMessage | null, Error>;
  save(message: ConversationMessage): AsyncResult<void, Error>;
}
