import { isNullish } from '@copilot/shared';
import { type HydratedDocument, Types } from 'mongoose';

import {
  createOperationExecution,
  type OperationExecution,
} from '../../../operation-execution.entity.js';

export interface MongooseOperationExecutionPersistence {
  readonly _id: Types.ObjectId;
  readonly draftId: Types.ObjectId;
  readonly errorMessage?: unknown;
  readonly finishedAt?: unknown;
  readonly result?: unknown;
  readonly startedAt?: unknown;
  readonly status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export type MongooseOperationExecutionDocument =
  HydratedDocument<MongooseOperationExecutionPersistence>;

export class MongooseOperationExecutionMapper {
  toDomain(document: MongooseOperationExecutionDocument): OperationExecution {
    return createOperationExecution({
      id: document._id.toHexString(),
      draftId: document.draftId.toHexString(),
      ...(isNullish(document.errorMessage) ? {} : { errorMessage: document.errorMessage }),
      ...(isNullish(document.finishedAt) ? {} : { finishedAt: document.finishedAt }),
      ...(isNullish(document.result) ? {} : { result: document.result }),
      ...(isNullish(document.startedAt) ? {} : { startedAt: document.startedAt }),
      status: document.status,
    });
  }

  toPersistence(execution: OperationExecution): MongooseOperationExecutionPersistence {
    return {
      _id: new Types.ObjectId(execution.id),
      draftId: new Types.ObjectId(execution.draftId),
      ...(isNullish(execution.errorMessage) ? {} : { errorMessage: execution.errorMessage }),
      ...(isNullish(execution.finishedAt) ? {} : { finishedAt: execution.finishedAt }),
      ...(isNullish(execution.result) ? {} : { result: execution.result }),
      ...(isNullish(execution.startedAt) ? {} : { startedAt: execution.startedAt }),
      status: execution.status,
    };
  }
}
