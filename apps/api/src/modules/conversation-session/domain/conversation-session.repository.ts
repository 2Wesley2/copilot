import type { AsyncResult } from '../../../error/index.js';
import type { ConversationSession } from './conversation-session.entity.js';

export const CONVERSATION_SESSION_REPOSITORY = Symbol('CONVERSATION_SESSION_REPOSITORY');

export interface ConversationSessionRepository {
  findById(sessionId: string): AsyncResult<ConversationSession | null, Error>;
  save(session: ConversationSession): AsyncResult<void, Error>;
}
