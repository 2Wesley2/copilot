import { Controller, Get } from '@nestjs/common';

import type { AuditEventService } from '../audit-event.service.js';

@Controller('audit-events')
export class AuditEventController {
  constructor(private readonly service: AuditEventService) {}

  @Get()
  health() {
    return { ok: true };
  }
}
