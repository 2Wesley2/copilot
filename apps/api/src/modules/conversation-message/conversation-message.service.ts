import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { ConversationMessage } from './conversation-message.entity.js';
import {
  CONVERSATION_MESSAGE_REPOSITORY,
  type ConversationMessageRepository,
} from './conversation-message.repository.js';

@Injectable()
export class ConversationMessageService {
  constructor(
    @Inject(CONVERSATION_MESSAGE_REPOSITORY)
    private readonly repository: ConversationMessageRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(messageId: string): AsyncResult<ConversationMessage | null, Error> {
    return this.repository.findById(messageId);
  }

  save(message: ConversationMessage): AsyncResult<void, Error> {
    return this.repository.save(message);
  }
}
