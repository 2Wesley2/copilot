import type { AsyncResult } from '../../../error/index.js';
import type { OperationExecution } from './operation-execution.entity.js';

export const OPERATION_EXECUTION_REPOSITORY = Symbol('OPERATION_EXECUTION_REPOSITORY');

export interface OperationExecutionRepository {
  findById(executionId: string): AsyncResult<OperationExecution | null, Error>;
  save(execution: OperationExecution): AsyncResult<void, Error>;
}
