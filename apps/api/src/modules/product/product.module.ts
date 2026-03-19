import { Module } from '@nestjs/common';

import { ProductController } from './presentation/http/product.controller.js';
import { ProductMongoPersistenceModule } from './infrastructure/persistence/mongodb/product-mongodb-persistence.module.js';
import { ProductService } from './application/product.service.js';

@Module({
  imports: [ProductMongoPersistenceModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
