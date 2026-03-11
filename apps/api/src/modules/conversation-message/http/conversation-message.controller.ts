import { Controller, Get } from '@nestjs/common';

import type { ConversationMessageService } from '../conversation-message.service.js';

@Controller('conversation-messages')
export class ConversationMessageController {
  constructor(private readonly service: ConversationMessageService) {}

  @Get()
  health(): { ok: true } {
    return this.service.health();
  }
}
