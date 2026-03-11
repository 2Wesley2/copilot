import { Module } from '@nestjs/common';

import { OperationExecutionController } from './http/operation-execution.controller.js';
import { OperationExecutionMongoPersistenceModule } from './infra/persistence/mongodb/operation-execution-mongodb-persistence.module.js';
import { OperationExecutionService } from './operation-execution.service.js';

@Module({
  imports: [OperationExecutionMongoPersistenceModule],
  controllers: [OperationExecutionController],
  providers: [OperationExecutionService],
  exports: [OperationExecutionService],
})
export class OperationExecutionModule {}
