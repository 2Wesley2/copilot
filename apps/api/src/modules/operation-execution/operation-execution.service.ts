import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { OperationExecution } from './operation-execution.entity.js';
import {
  OPERATION_EXECUTION_REPOSITORY,
  type OperationExecutionRepository,
} from './operation-execution.repository.js';

@Injectable()
export class OperationExecutionService {
  public constructor(
    @Inject(OPERATION_EXECUTION_REPOSITORY)
    private readonly repository: OperationExecutionRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(executionId: string): AsyncResult<OperationExecution | null, Error> {
    return this.repository.findById(executionId);
  }

  public save(execution: OperationExecution): AsyncResult<void, Error> {
    return this.repository.save(execution);
  }
}
