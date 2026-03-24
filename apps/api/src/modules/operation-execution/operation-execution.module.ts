import { Module } from '@nestjs/common';

import { OperationExecutionService } from './application/operation-execution.service.js';
import { OperationExecutionMongoPersistenceModule } from './infrastructure/persistence/mongodb/operation-execution-mongodb-persistence.module.js';
import { OperationExecutionController } from './presentation/http/operation-execution.controller.js';

@Module({
  imports: [OperationExecutionMongoPersistenceModule],
  controllers: [OperationExecutionController],
  providers: [OperationExecutionService],
  exports: [OperationExecutionService],
})
export class OperationExecutionModule {}
