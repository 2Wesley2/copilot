import { Controller, Get } from '@nestjs/common';

import type { ConversationMessageService } from '../../application/conversation-message.service.js';

@Controller('conversation-messages')
export class ConversationMessageController {
  public constructor(private readonly service: ConversationMessageService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
