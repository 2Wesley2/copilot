import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../../error/index.js';
import type { ConversationMessage } from '../domain/conversation-message.entity.js';
import {
  CONVERSATION_MESSAGE_REPOSITORY,
  type ConversationMessageRepository,
} from '../domain/conversation-message.repository.js';

@Injectable()
export class ConversationMessageService {
  public constructor(
    @Inject(CONVERSATION_MESSAGE_REPOSITORY)
    private readonly repository: ConversationMessageRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(messageId: string): AsyncResult<ConversationMessage | null, Error> {
    return this.repository.findById(messageId);
  }

  public save(message: ConversationMessage): AsyncResult<void, Error> {
    return this.repository.save(message);
  }
}
