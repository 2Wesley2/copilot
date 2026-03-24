import { Types } from 'mongoose';

import type { OperationExecution } from '../../../domain/operation-execution.entity.js';
import { createOperationExecution } from '../../../domain/operation-execution.entity.js';
import type {
  OperationExecutionMongoDocument,
  OperationExecutionMongoPersistence,
} from './operation-execution.schema.js';

export class OperationExecutionMapper {
  public toDomain(document: OperationExecutionMongoDocument): OperationExecution {
    return createOperationExecution({
      id: document._id.toHexString(),
      attempt: document.attempt,
      decisionId: document.decisionId.toHexString(),
      draftId: document.draftId.toHexString(),
      ...(document.errorMessage === undefined ? {} : { errorMessage: document.errorMessage }),
      ...(document.executedAt === undefined ? {} : { executedAt: document.executedAt }),
      ...(document.executedById === undefined
        ? {}
        : {
            executedById:
              document.executedById === null ? null : document.executedById.toHexString(),
          }),
      ...(document.executedPayload === undefined
        ? {}
        : { executedPayload: document.executedPayload }),
      ...(document.finishedAt === undefined ? {} : { finishedAt: document.finishedAt }),
      isFinal: document.isFinal,
      ...(document.resultSnapshot === undefined ? {} : { result: document.resultSnapshot }),
      ...(document.startedAt === undefined ? {} : { startedAt: document.startedAt }),
      status: document.status,
    });
  }
  public toPersistence(execution: OperationExecution): OperationExecutionMongoPersistence {
    return {
      _id: new Types.ObjectId(execution.id),
      attempt: execution.attempt,
      decisionId: new Types.ObjectId(execution.decisionId),
      draftId: new Types.ObjectId(execution.draftId),
      ...(execution.errorMessage === undefined ? {} : { errorMessage: execution.errorMessage }),
      ...(execution.executedAt === undefined ? {} : { executedAt: execution.executedAt }),
      ...(execution.executedById === undefined
        ? {}
        : {
            executedById:
              execution.executedById === null ? null : new Types.ObjectId(execution.executedById),
          }),
      ...(execution.executedPayload === undefined
        ? {}
        : { executedPayload: execution.executedPayload }),
      ...(execution.finishedAt === undefined ? {} : { finishedAt: execution.finishedAt }),
      isFinal: execution.isFinal,
      ...(execution.result === undefined ? {} : { resultSnapshot: execution.result }),
      ...(execution.startedAt === undefined ? {} : { startedAt: execution.startedAt }),
      status: execution.status,
    };
  }
}
