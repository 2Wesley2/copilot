import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OPERATION_EXECUTION_REPOSITORY } from '../../../domain/operation-execution.repository.js';
import { OPERATION_EXECUTION_MODEL_NAME, OperationExecutionSchema } from './operation-execution.schema.js';
import { OperationExecutionMapper } from './operation-execution.mapper.js';
import { OperationExecutionMongooseRepository } from './operation-execution-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: OPERATION_EXECUTION_MODEL_NAME, schema: OperationExecutionSchema }])],
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
