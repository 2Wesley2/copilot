import { Module, type Provider } from '@nestjs/common';

import { OPERATION_DRAFT_REPOSITORY } from '../../../operation-draft.repository.js';
import { MongooseOperationDraftMapper } from './mongoose-operation-draft.mapper.js';
import { MongooseOperationDraftRepositoryAdapter } from './mongoose-operation-draft.repository.js';

const persistenceProviders: Provider[] = [
  MongooseOperationDraftMapper,
  MongooseOperationDraftRepositoryAdapter,
  {
    provide: OPERATION_DRAFT_REPOSITORY,
    useExisting: MongooseOperationDraftRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [OPERATION_DRAFT_REPOSITORY],
})
export class OperationDraftMongoPersistenceModule {}
