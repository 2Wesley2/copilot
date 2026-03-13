import { Controller, Get } from '@nestjs/common';

import type { OperationExecutionService } from '../operation-execution.service.js';

@Controller('operation-executions')
export class OperationExecutionController {
  public constructor(private readonly service: OperationExecutionService) {}

  @Get()
  public health(): { ok: true } {
    return this.service.health();
  }
}
