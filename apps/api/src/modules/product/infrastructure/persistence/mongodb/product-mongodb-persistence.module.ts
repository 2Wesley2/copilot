import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PRODUCT_REPOSITORY } from '../../../domain/product.repository.js';
import { PRODUCT_MODEL_NAME, ProductSchema } from './product.schema.js';
import { ProductMapper } from './product.mapper.js';
import { ProductMongooseRepository } from './product-mongoose.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: PRODUCT_MODEL_NAME, schema: ProductSchema }])],
  providers: [
    ProductMapper,
    ProductMongooseRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: ProductMongooseRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductMongoPersistenceModule {}
