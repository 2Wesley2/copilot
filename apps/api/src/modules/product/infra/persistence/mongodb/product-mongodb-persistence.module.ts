import { Module, type Provider } from '@nestjs/common';

import { PRODUCT_REPOSITORY } from '../../../product.repository.js';
import { MongooseProductMapper } from './mongoose-product.mapper.js';
import { MongooseProductRepositoryAdapter } from './mongoose-product.repository.js';

const persistenceProviders: Provider[] = [
  MongooseProductMapper,
  MongooseProductRepositoryAdapter,
  {
    provide: PRODUCT_REPOSITORY,
    useExisting: MongooseProductRepositoryAdapter,
  },
];

@Module({
  providers: persistenceProviders,
  exports: [PRODUCT_REPOSITORY],
})
export class ProductMongoPersistenceModule {}
