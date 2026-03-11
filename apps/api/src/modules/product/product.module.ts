import { Module } from '@nestjs/common';

import { ProductController } from './http/product.controller.js';
import { ProductMongoPersistenceModule } from './infra/persistence/mongodb/product-mongodb-persistence.module.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [ProductMongoPersistenceModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
