import { Controller, Get } from '@nestjs/common';

import type { AuditEventService } from '../audit-event.service.js';

@Controller('audit-events')
export class AuditEventController {
  public constructor(private readonly service: AuditEventService) {}

  @Get()
  public health(): { ok: true } {
    return this.service.health();
  }
}
