import { Controller, Get } from '@nestjs/common';

import type { DraftDecisionService } from '../../application/draft-decision.service.js';

@Controller('draft-decisions')
export class DraftDecisionController {
  public constructor(private readonly service: DraftDecisionService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
