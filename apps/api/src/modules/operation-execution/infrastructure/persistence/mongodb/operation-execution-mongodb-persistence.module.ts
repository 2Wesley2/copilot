import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OPERATION_EXECUTION_REPOSITORY } from '../../../domain/operation-execution.repository.js';
import { OperationExecutionMapper } from './operation-execution.mapper.js';
import {
  OPERATION_EXECUTION_MODEL_NAME,
  operationExecutionSchema,
} from './operation-execution.schema.js';
import { OperationExecutionMongooseRepository } from './operation-execution-mongoose.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OPERATION_EXECUTION_MODEL_NAME, schema: operationExecutionSchema },
    ]),
  ],
  providers: [
    OperationExecutionMapper,
    OperationExecutionMongooseRepository,
    {
      provide: OPERATION_EXECUTION_REPOSITORY,
      useExisting: OperationExecutionMongooseRepository,
    },
  ],
  exports: [OPERATION_EXECUTION_REPOSITORY],
})
export class OperationExecutionMongoPersistenceModule {}
