import { Module, type Provider } from '@nestjs/common';

import { OPERATION_EXECUTION_REPOSITORY } from '../../../operation-execution.repository.js';
import { MongooseOperationExecutionMapper } from './mongoose-operation-execution.mapper.js';
import { MongooseOperationExecutionRepositoryAdapter } from './mongoose-operation-execution.repository.js';

const persistenceProviders: Provider[] = [
  MongooseOperationExecutionMapper,
  MongooseOperationExecutionRepositoryAdapter,
  {
    provide: OPERATION_EXECUTION_REPOSITORY,
    useExisting: MongooseOperationExecutionRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [OPERATION_EXECUTION_REPOSITORY],
})
export class OperationExecutionMongoPersistenceModule {}
