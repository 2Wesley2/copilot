import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { OperationExecution } from '../../../domain/operation-execution.entity.js';
import type { OperationExecutionRepository } from '../../../domain/operation-execution.repository.js';
import { OPERATION_EXECUTION_MODEL_NAME, type OperationExecutionMongoDocument, type OperationExecutionMongoPersistence } from './operation-execution.schema.js';
import { OperationExecutionMapper } from './operation-execution.mapper.js';

@Injectable()
export class OperationExecutionMongooseRepository implements OperationExecutionRepository {
  public constructor(
    @InjectModel(OPERATION_EXECUTION_MODEL_NAME)
    private readonly operationExecutionModel: Model<OperationExecutionMongoPersistence>,
    private readonly operationExecutionMapper: OperationExecutionMapper,
  ) {}

  public findById(executionId: string): AsyncResult<OperationExecution | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: OperationExecutionMongoDocument | null = await this.operationExecutionModel
        .findById(executionId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.operationExecutionMapper.toDomain(document);
    });
  }

  public save(execution: OperationExecution): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.operationExecutionMapper.toPersistence(execution);

      await this.operationExecutionModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
