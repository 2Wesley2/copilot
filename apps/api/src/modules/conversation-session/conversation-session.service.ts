import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { ConversationSession } from './conversation-session.entity.js';
import {
  CONVERSATION_SESSION_REPOSITORY,
  type ConversationSessionRepository,
} from './conversation-session.repository.js';

@Injectable()
export class ConversationSessionService {
  constructor(
    @Inject(CONVERSATION_SESSION_REPOSITORY)
    private readonly repository: ConversationSessionRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(sessionId: string): AsyncResult<ConversationSession | null, Error> {
    return this.repository.findById(sessionId);
  }

  save(session: ConversationSession): AsyncResult<void, Error> {
    return this.repository.save(session);
  }
}
