import { Controller, Get } from '@nestjs/common';

import type { OperationDraftItemService } from '../../application/operation-draft-item.service.js';

@Controller('operation-draft-items')
export class OperationDraftItemController {
  public constructor(private readonly service: OperationDraftItemService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
