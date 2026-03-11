import { Controller, Get } from '@nestjs/common';

import type { DraftDecisionService } from '../draft-decision.service.js';

@Controller('draft-decisions')
export class DraftDecisionController {
  constructor(private readonly service: DraftDecisionService) {}

  @Get()
  health(): { ok: true } {
    return this.service.health();
  }
}
