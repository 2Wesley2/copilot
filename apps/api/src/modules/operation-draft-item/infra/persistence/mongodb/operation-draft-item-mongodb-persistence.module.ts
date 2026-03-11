import { Module, type Provider } from '@nestjs/common';

import { OPERATION_DRAFT_ITEM_REPOSITORY } from '../../../operation-draft-item.repository.js';
import { MongooseOperationDraftItemMapper } from './mongoose-operation-draft-item.mapper.js';
import { MongooseOperationDraftItemRepositoryAdapter } from './mongoose-operation-draft-item.repository.js';

const persistenceProviders: Provider[] = [
  MongooseOperationDraftItemMapper,
  MongooseOperationDraftItemRepositoryAdapter,
  {
    provide: OPERATION_DRAFT_ITEM_REPOSITORY,
    useExisting: MongooseOperationDraftItemRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [OPERATION_DRAFT_ITEM_REPOSITORY],
})
export class OperationDraftItemMongoPersistenceModule {}
