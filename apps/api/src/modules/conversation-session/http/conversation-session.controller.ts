import { Controller, Get } from '@nestjs/common';

import type { ConversationSessionService } from '../conversation-session.service.js';

@Controller('conversation-sessions')
export class ConversationSessionController {
  public constructor(private readonly service: ConversationSessionService) {}

  @Get()
  public health(): { ok: true } {
    return this.service.health();
  }
}
