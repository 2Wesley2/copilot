import { Controller, Get } from '@nestjs/common';

import type { OperationDraftService } from '../operation-draft.service.js';

@Controller('operation-drafts')
export class OperationDraftController {
  constructor(private readonly service: OperationDraftService) {}

  @Get()
  health(): { ok: true } {
    return this.service.health();
  }
}
