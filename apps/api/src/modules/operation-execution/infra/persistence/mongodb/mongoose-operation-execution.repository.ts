import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../infra/database/mongodb/mongoose/mongoose.schemas.js';
import type { OperationExecution } from '../../../operation-execution.entity.js';
import type { OperationExecutionRepository } from '../../../operation-execution.repository.js';
import {
  type MongooseOperationExecutionDocument,
  type MongooseOperationExecutionMapper,
  type MongooseOperationExecutionPersistence,
} from './mongoose-operation-execution.mapper.js';

@Injectable()
export class MongooseOperationExecutionRepositoryAdapter implements OperationExecutionRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.operationExecution)
    private readonly operationExecutionModel: Model<MongooseOperationExecutionPersistence>,
    private readonly operationExecutionMapper: MongooseOperationExecutionMapper,
  ) {}

  public findById(executionId: string): AsyncResult<OperationExecution | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseOperationExecutionDocument | null = await this.operationExecutionModel
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
