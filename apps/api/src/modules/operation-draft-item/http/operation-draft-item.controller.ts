import { Controller, Get } from '@nestjs/common';

import type { OperationDraftItemService } from '../operation-draft-item.service.js';

@Controller('operation-draft-items')
export class OperationDraftItemController {
  public constructor(private readonly service: OperationDraftItemService) {}

  @Get()
  public health(): { ok: true } {
    return this.service.health();
  }
}
