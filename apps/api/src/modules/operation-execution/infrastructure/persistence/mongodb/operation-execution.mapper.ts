import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import {
  createOperationExecution,
  type OperationExecution,
} from '../../../domain/operation-execution.entity.js';

import type { OperationExecutionMongoDocument, OperationExecutionMongoPersistence } from './operation-execution.schema.js';

export class OperationExecutionMapper {
  public toDomain(document: OperationExecutionMongoDocument): OperationExecution {
    return createOperationExecution({
      id: document._id.toHexString(),
      draftId: document.draftId.toHexString(),
      ...(isNullish(document.errorMessage) ? {} : { errorMessage: document.errorMessage }),
      ...(isNullish(document.finishedAt) ? {} : { finishedAt: document.finishedAt }),
      ...(isNullish(document.resultSnapshot) ? {} : { result: document.resultSnapshot }),
      ...(isNullish(document.startedAt) ? {} : { startedAt: document.startedAt }),
      status: document.status,
    });
  }

  public toPersistence(execution: OperationExecution): OperationExecutionMongoPersistence {
    return {
      _id: new Types.ObjectId(execution.id),
      attempt: 1,
      decisionId: new Types.ObjectId(),
      draftId: new Types.ObjectId(execution.draftId),
      isFinal: true,
      ...(isNullish(execution.errorMessage) ? {} : { errorMessage: execution.errorMessage }),
      ...(isNullish(execution.finishedAt) ? {} : { finishedAt: execution.finishedAt }),
      ...(isNullish(execution.result) ? {} : { resultSnapshot: execution.result }),
      ...(isNullish(execution.startedAt) ? {} : { startedAt: execution.startedAt }),
      status: execution.status,
    };
  }
}
