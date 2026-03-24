import { Controller, Get } from '@nestjs/common';

import { OperationExecutionService } from '../../application/operation-execution.service.js';

@Controller('operation-executions')
export class OperationExecutionController {
  public constructor(private readonly service: OperationExecutionService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
