import { Controller, Get } from '@nestjs/common';

import type { AuditEventService } from '../../application/audit-event.service.js';

@Controller('audit-events')
export class AuditEventController {
  public constructor(private readonly service: AuditEventService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
